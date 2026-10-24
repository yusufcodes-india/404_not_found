import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { okResponse, errorResponse } from '@/lib/api/response';
import { getSessionUser } from '@/lib/auth/session';

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const user = await getSessionUser(req);
  if (!user) return errorResponse('Unauthenticated', 'UNAUTHORIZED', 401);

  const booking = await prisma.booking.findUnique({ where: { id } });
  if (!booking) return errorResponse('Booking not found', 'NOT_FOUND', 404);

  if (booking.driverId !== user.id && booking.hostId !== user.id && user.role !== 'ADMIN') {
    return errorResponse('Forbidden', 'FORBIDDEN', 403);
  }

  if (['COMPLETED', 'CANCELLED', 'DECLINED'].includes(booking.status)) {
    return errorResponse(`Booking is already ${booking.status.toLowerCase()}`, 'INVALID_STATE', 400);
  }

  const updated = await prisma.booking.update({
    where: { id },
    data: { status: 'CANCELLED' },
  });

  return okResponse({ booking: updated });
}
