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

  if (booking.hostId !== user.id && user.role !== 'ADMIN') {
    return errorResponse('Forbidden', 'FORBIDDEN', 403);
  }

  if (booking.status !== 'REQUESTED') {
    return errorResponse(`Cannot decline booking in status ${booking.status}`, 'INVALID_STATE', 400);
  }

  const updated = await prisma.$transaction(async (tx) => {
    const b = await tx.booking.update({
      where: { id },
      data: { status: 'DECLINED' },
    });

    await tx.notification.create({
      data: {
        userId: booking.driverId,
        type: 'BOOKING_DECLINED',
        title: 'Booking Declined',
        body: 'The host was unable to accept your booking request for this window.',
      },
    });

    return b;
  });

  return okResponse({ booking: updated });
}
