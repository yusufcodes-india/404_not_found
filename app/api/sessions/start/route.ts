import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { okResponse, errorResponse } from '@/lib/api/response';
import { getSessionUser } from '@/lib/auth/session';

const StartSessionSchema = z.object({
  bookingId: z.string(),
  startReadingKwh: z.number().min(0).default(120.5),
});

export async function POST(req: NextRequest) {
  const user = await getSessionUser(req);
  if (!user) return errorResponse('Unauthenticated', 'UNAUTHORIZED', 401);

  try {
    const body = await req.json();
    const { bookingId, startReadingKwh } = StartSessionSchema.parse(body);

    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) return errorResponse('Booking not found', 'NOT_FOUND', 404);

    if (booking.driverId !== user.id && booking.hostId !== user.id && user.role !== 'ADMIN') {
      return errorResponse('Forbidden', 'FORBIDDEN', 403);
    }

    if (booking.status !== 'PAID' && process.env.ALLOW_DEV_MOCKS !== 'true') {
      return errorResponse('Session can only start after verified payment', 'PAYMENT_REQUIRED', 400);
    }

    const session = await prisma.$transaction(async (tx) => {
      const s = await tx.chargingSession.create({
        data: {
          bookingId: booking.id,
          startReadingKwh,
          status: 'ACTIVE',
        },
      });

      await tx.booking.update({
        where: { id: booking.id },
        data: { status: 'ACTIVE' },
      });

      await tx.auditEvent.create({
        data: {
          actorId: user.id,
          action: 'SESSION_STARTED',
          entity: 'ChargingSession',
          entityId: s.id,
          outcome: 'SUCCESS',
        },
      });

      return s;
    });

    return okResponse({ session }, undefined, 201);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to start session';
    return errorResponse(msg, 'SESSION_START_ERROR', 400);
  }
}
