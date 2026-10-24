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

  const charger = await prisma.charger.findUnique({
    where: { id },
    include: {
      owner: {
        select: {
          id: true,
          profile: { select: { fullName: true } },
        },
      },
      availability: true,
    },
  });

  if (!charger) {
    return errorResponse('Charger not found', 'NOT_FOUND', 404);
  }

  // Check if caller can see the exact private address
  let canViewExactAddress = false;
  if (user) {
    if (user.role === 'ADMIN' || charger.ownerId === user.id) {
      canViewExactAddress = true;
    } else {
      // Check if driver has a paid or active booking on this charger
      const paidBooking = await prisma.booking.findFirst({
        where: {
          chargerId: charger.id,
          driverId: user.id,
          status: { in: ['PAID', 'ACTIVE'] },
        },
      });
      if (paidBooking) canViewExactAddress = true;
    }
  }

  return okResponse({
    id: charger.id,
    title: charger.title,
    description: charger.description,
    type: charger.type,
    currentType: charger.currentType,
    powerKw: charger.powerKw,
    connectorType: charger.connectorType,
    pricePerKwh: charger.pricePerKwh / 100, // 14
    city: charger.city,
    areaLabel: charger.areaLabel,
    approxLat: charger.approxLat,
    approxLng: charger.approxLng,
    exactAddress: canViewExactAddress ? charger.exactAddress : undefined,
    rules: charger.rules,
    parkingNotes: charger.parkingNotes,
    accessNotes: charger.accessNotes,
    healthScore: charger.healthScore,
    avgRating: charger.avgRating,
    ownerName: charger.owner?.profile?.fullName || 'Community Host',
    availability: charger.availability,
    canViewExactAddress,
  });
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const user = await getSessionUser(req);
  if (!user) return errorResponse('Unauthenticated', 'UNAUTHORIZED', 401);

  const charger = await prisma.charger.findUnique({ where: { id } });
  if (!charger) return errorResponse('Charger not found', 'NOT_FOUND', 404);
  if (charger.ownerId !== user.id && user.role !== 'ADMIN') {
    return errorResponse('Forbidden', 'FORBIDDEN', 403);
  }

  const body = await req.json();
  const updated = await prisma.charger.update({
    where: { id },
    data: {
      ...(body.title ? { title: body.title } : {}),
      ...(body.description ? { description: body.description } : {}),
      ...(body.status ? { status: body.status } : {}),
      ...(body.rules ? { rules: body.rules } : {}),
    },
  });

  return okResponse({ charger: updated });
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const user = await getSessionUser(req);
  if (!user) return errorResponse('Unauthenticated', 'UNAUTHORIZED', 401);

  const charger = await prisma.charger.findUnique({ where: { id } });
  if (!charger) return errorResponse('Charger not found', 'NOT_FOUND', 404);
  if (charger.ownerId !== user.id && user.role !== 'ADMIN') {
    return errorResponse('Forbidden', 'FORBIDDEN', 403);
  }

  await prisma.charger.delete({ where: { id } });
  return okResponse({ deleted: true });
}
