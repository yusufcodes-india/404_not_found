import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { okResponse, errorResponse } from '@/lib/api/response';
import { getSessionUser } from '@/lib/auth/session';

const CreateLogSchema = z.object({
  action: z.string().min(1),
  entity: z.string().default('UserActivity'),
  entityId: z.string().optional(),
  outcome: z.string().default('SUCCESS'),
  metadata: z.record(z.string(), z.unknown()).or(z.string()).optional(),
});

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const user = await getSessionUser(req);
  if (!user) {
    return errorResponse('Unauthenticated', 'UNAUTHORIZED', 401);
  }

  try {
    const [auditEvents, bookings, sessions] = await Promise.all([
      prisma.auditEvent.findMany({
        where: { actorId: user.id },
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
      prisma.booking.findMany({
        where: { OR: [{ driverId: user.id }, { hostId: user.id }] },
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true,
          status: true,
          paymentStatus: true,
          estKwh: true,
          createdAt: true,
          charger: { select: { title: true, areaLabel: true } },
        },
      }),
      prisma.chargingSession.findMany({
        where: {
          booking: { OR: [{ driverId: user.id }, { hostId: user.id }] },
        },
        orderBy: { startedAt: 'desc' },
        take: 10,
        select: {
          id: true,
          status: true,
          kwhDelivered: true,
          startedAt: true,
          endedAt: true,
          booking: { select: { charger: { select: { title: true } } } },
        },
      }),
    ]);

    // Format unified log items
    const logs = auditEvents.map((evt) => {
      let parsedMeta: Record<string, unknown> | null = null;
      if (evt.metadata) {
        try {
          parsedMeta = JSON.parse(evt.metadata);
        } catch {
          parsedMeta = { raw: evt.metadata };
        }
      }
      return {
        id: evt.id,
        action: evt.action,
        entity: evt.entity,
        entityId: evt.entityId,
        outcome: evt.outcome,
        timestamp: evt.createdAt.toISOString(),
        details: parsedMeta,
      };
    });

    return okResponse({
      logs,
      summary: {
        totalLogs: auditEvents.length,
        totalBookings: bookings.length,
        totalSessions: sessions.length,
        user: {
          id: user.id,
          phone: user.phone,
          fullName: user.fullName,
          role: user.role,
        },
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to retrieve logs';
    return errorResponse(msg, 'LOGS_ERROR', 500);
  }
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser(req);
  if (!user) {
    return errorResponse('Unauthenticated', 'UNAUTHORIZED', 401);
  }

  try {
    const body = await req.json().catch(() => ({}));
    const data = CreateLogSchema.parse(body);

    const metaStr = typeof data.metadata === 'string'
      ? data.metadata
      : JSON.stringify(data.metadata || {});

    const event = await prisma.auditEvent.create({
      data: {
        actorId: user.id,
        action: data.action,
        entity: data.entity,
        entityId: data.entityId || user.id,
        outcome: data.outcome,
        metadata: metaStr,
      },
    });

    return okResponse({
      logged: true,
      id: event.id,
      action: event.action,
      timestamp: event.createdAt.toISOString(),
    }, undefined, 201);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to record log';
    return errorResponse(msg, 'LOG_CREATE_ERROR', 400);
  }
}
