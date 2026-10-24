import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { okResponse, errorResponse } from '@/lib/api/response';
import { getSessionUser } from '@/lib/auth/session';
import { calcSession } from '@/lib/booking/pricing';

const CompleteSessionSchema = z.object({
  endReadingKwh: z.number().min(0),
});

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const user = await getSessionUser(req);
  if (!user) return errorResponse('Unauthenticated', 'UNAUTHORIZED', 401);

  try {
    const body = await req.json();
    const { endReadingKwh } = CompleteSessionSchema.parse(body);

    const session = await prisma.chargingSession.findUnique({
      where: { id },
      include: { booking: true },
    });

    if (!session) return errorResponse('Session not found', 'NOT_FOUND', 404);
    if (session.status === 'COMPLETED') {
      return errorResponse('Session is already completed', 'ALREADY_COMPLETED', 400);
    }

    const kwhDelivered = Math.max(0, Number((endReadingKwh - session.startReadingKwh).toFixed(2)));
    const calculations = calcSession(kwhDelivered);

    const completed = await prisma.$transaction(async (tx) => {
      const s = await tx.chargingSession.update({
        where: { id },
        data: {
          endReadingKwh,
          kwhDelivered,
          grossPaise: calculations.grossPaise,
          platformFeePaise: calculations.platformFeePaise,
          hostEarningsPaise: calculations.hostEarningsPaise,
          status: 'COMPLETED',
          endedAt: new Date(),
        },
      });

      await tx.booking.update({
        where: { id: session.bookingId },
        data: { status: 'COMPLETED' },
      });

      await tx.auditEvent.create({
        data: {
          actorId: user.id,
          action: 'SESSION_COMPLETED',
          entity: 'ChargingSession',
          entityId: id,
          outcome: 'SUCCESS',
          metadata: JSON.stringify({ kwhDelivered, ...calculations }),
        },
      });

      return s;
    });

    return okResponse({ session: completed, calculations });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to complete session';
    return errorResponse(msg, 'COMPLETE_ERROR', 400);
  }
}
