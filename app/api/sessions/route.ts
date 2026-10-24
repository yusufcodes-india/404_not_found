import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { okResponse, errorResponse } from '@/lib/api/response';
import { getSessionUser } from '@/lib/auth/session';

export async function GET(req: NextRequest) {
  const user = await getSessionUser(req);
  if (!user) return errorResponse('Unauthenticated', 'UNAUTHORIZED', 401);

  const sessions = await prisma.chargingSession.findMany({
    where: {
      booking: {
        OR: [{ driverId: user.id }, { hostId: user.id }],
      },
    },
    include: {
      booking: {
        include: {
          charger: { select: { title: true, areaLabel: true } },
          driver: { select: { profile: { select: { fullName: true } } } },
        },
      },
    },
    orderBy: { startedAt: 'desc' },
  });

  // Calculate host totals
  let totalKwh = 0;
  let totalGrossPaise = 0;
  let totalHostEarningsPaise = 0;

  for (const s of sessions) {
    totalKwh += s.kwhDelivered || 0;
    totalGrossPaise += s.grossPaise || 0;
    totalHostEarningsPaise += s.hostEarningsPaise || 0;
  }

  return okResponse(sessions, {
    summary: {
      totalSessions: sessions.length,
      totalKwh: Number(totalKwh.toFixed(1)),
      grossAmountRupees: totalGrossPaise / 100,
      hostEarningsRupees: totalHostEarningsPaise / 100,
      platformFeePercent: 10,
    },
  });
}
