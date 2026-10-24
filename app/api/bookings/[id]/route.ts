import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { okResponse, errorResponse } from '@/lib/api/response';
import { getSessionUser } from '@/lib/auth/session';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const user = await getSessionUser(req);
  if (!user) return errorResponse('Unauthenticated', 'UNAUTHORIZED', 401);

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      charger: true,
      driver: { include: { profile: true } },
      host: { include: { profile: true } },
      vehicle: true,
      payments: true,
      chargingSession: true,
      chatThread: {
        include: { messages: { orderBy: { createdAt: 'asc' } } },
      },
    },
  });

  if (!booking) return errorResponse('Booking not found', 'NOT_FOUND', 404);
  if (booking.driverId !== user.id && booking.hostId !== user.id && user.role !== 'ADMIN') {
    return errorResponse('Forbidden', 'FORBIDDEN', 403);
  }

  // Exact address unlocks only when booking is PAID or ACTIVE
  const addressUnlocked = booking.status === 'PAID' || booking.status === 'ACTIVE' || booking.status === 'COMPLETED';

  return okResponse({
    ...booking,
    charger: {
      ...booking.charger,
      exactAddress: addressUnlocked || booking.hostId === user.id ? booking.charger.exactAddress : undefined,
    },
  });
}
