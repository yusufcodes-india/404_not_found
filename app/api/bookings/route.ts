import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { okResponse, errorResponse } from '@/lib/api/response';
import { getSessionUser } from '@/lib/auth/session';
import { quote } from '@/lib/booking/pricing';

const CreateBookingSchema = z.object({
  chargerId: z.string(),
  windowStart: z.string(),
  windowEnd: z.string(),
  estKwh: z.number().min(0.5).max(100).default(10.0),
  vehicleId: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const user = await getSessionUser(req);
  if (!user) return errorResponse('Unauthenticated', 'UNAUTHORIZED', 401);

  const bookings = await prisma.booking.findMany({
    where: {
      OR: [{ driverId: user.id }, { hostId: user.id }],
    },
    include: {
      charger: {
        select: {
          id: true,
          title: true,
          areaLabel: true,
          powerKw: true,
          connectorType: true,
          approxLat: true,
          approxLng: true,
        },
      },
      driver: {
        select: {
          profile: { select: { fullName: true } },
          phone: true,
        },
      },
      host: {
        select: {
          profile: { select: { fullName: true } },
        },
      },
      vehicle: true,
      payments: true,
      chargingSession: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return okResponse(bookings);
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser(req);
  if (!user) return errorResponse('Unauthenticated', 'UNAUTHORIZED', 401);

  try {
    const body = await req.json();
    const data = CreateBookingSchema.parse(body);

    const charger = await prisma.charger.findUnique({
      where: { id: data.chargerId },
    });
    if (!charger || charger.status !== 'ACTIVE') {
      return errorResponse('Charger is not available for booking', 'CHARGER_UNAVAILABLE', 400);
    }

    if (charger.ownerId === user.id) {
      return errorResponse('You cannot book your own charger', 'SELF_BOOKING_NOT_ALLOWED', 400);
    }

    const start = new Date(data.windowStart);
    const end = new Date(data.windowEnd);
    if (end <= start) {
      return errorResponse('End time must be after start time', 'INVALID_TIME_WINDOW', 400);
    }

    // Overlap conflict check: no conflicting approved, paid, or active bookings
    const overlap = await prisma.booking.findFirst({
      where: {
        chargerId: charger.id,
        status: { in: ['APPROVED', 'PAID', 'ACTIVE'] },
        OR: [
          { windowStart: { lte: start }, windowEnd: { gt: start } },
          { windowStart: { lt: end }, windowEnd: { gte: end } },
          { windowStart: { gte: start }, windowEnd: { lte: end } },
        ],
      },
    });

    if (overlap) {
      return errorResponse('This charger is already booked for the requested window', 'SLOT_CONFLICT', 409);
    }

    // Quote in integer paise
    const quotedAmountPaise = quote(data.estKwh);

    // Create booking and chat thread in a single transaction
    const booking = await prisma.$transaction(async (tx) => {
      const b = await tx.booking.create({
        data: {
          chargerId: charger.id,
          driverId: user.id,
          hostId: charger.ownerId,
          vehicleId: data.vehicleId,
          windowStart: start,
          windowEnd: end,
          estKwh: data.estKwh,
          quotedAmountPaise,
          status: 'REQUESTED',
          paymentStatus: 'UNPAID',
        },
      });

      // Initialize chat thread for this booking
      await tx.chatThread.create({
        data: {
          bookingId: b.id,
          status: 'OPEN',
          messages: {
            create: {
              senderRole: 'ASSISTANT',
              isAi: true,
              content: `Welcome to your booking thread for ${charger.title}! I am the Kilari Assistant. Let me know if you have questions about parking, charging speed, or arrival instructions.`,
            },
          },
        },
      });

      // Notify host
      await tx.notification.create({
        data: {
          userId: charger.ownerId,
          type: 'BOOKING_REQUESTED',
          title: 'New Booking Request',
          body: `New request for ${charger.title} (${data.estKwh} kWh). Please review and approve.`,
        },
      });

      // Audit event
      await tx.auditEvent.create({
        data: {
          actorId: user.id,
          action: 'BOOKING_REQUESTED',
          entity: 'Booking',
          entityId: b.id,
          outcome: 'SUCCESS',
        },
      });

      return b;
    });

    return okResponse({ booking }, undefined, 201);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to create booking';
    return errorResponse(msg, 'CREATE_BOOKING_ERROR', 400);
  }
}
