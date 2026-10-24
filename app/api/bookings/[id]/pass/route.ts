import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { okResponse, errorResponse } from '@/lib/api/response';
import { getSessionUser } from '@/lib/auth/session';
import { signGatePass, generateQrDataUrl } from '@/lib/gatepass/token';

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
      vehicle: true,
    },
  });

  if (!booking) return errorResponse('Booking not found', 'NOT_FOUND', 404);
  if (booking.driverId !== user.id && booking.hostId !== user.id && user.role !== 'ADMIN') {
    return errorResponse('Forbidden', 'FORBIDDEN', 403);
  }

  // Must be PAID or ACTIVE (or demo mode with APPROVED)
  const isPaid = booking.status === 'PAID' || booking.status === 'ACTIVE' || booking.status === 'COMPLETED';
  if (!isPaid && process.env.ALLOW_DEV_MOCKS !== 'true') {
    return errorResponse('Gate pass is only available after payment confirmation', 'PAYMENT_REQUIRED', 402);
  }

  const passCode = `KIL-${booking.id.slice(0, 4).toUpperCase()}-${booking.id.slice(-4).toUpperCase()}`;

  const token = await signGatePass({
    bookingId: booking.id,
    chargerId: booking.chargerId,
    driverId: booking.driverId,
    chargerTitle: booking.charger.title,
    startsAt: booking.windowStart.toISOString(),
    endsAt: booking.windowEnd.toISOString(),
  });

  const qrDataUrl = await generateQrDataUrl(token);

  return okResponse({
    passCode,
    token,
    qrDataUrl,
    chargerTitle: booking.charger.title,
    exactAddress: booking.charger.exactAddress,
    driverName: booking.driver.profile?.fullName || 'Kilari Driver',
    vehiclePlate: booking.vehicle?.registration || 'MH 12 AB 1234',
    windowStart: booking.windowStart,
    windowEnd: booking.windowEnd,
    status: booking.status,
  });
}
