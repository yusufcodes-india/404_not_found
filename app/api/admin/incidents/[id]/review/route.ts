import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { okResponse, errorResponse } from '@/lib/api/response';
import { getSessionUser } from '@/lib/auth/session';

const ReviewSchema = z.object({
  status: z.enum(['INVESTIGATING', 'RESOLVED', 'DISMISSED']),
  resolution: z.string().optional(),
});

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const user = await getSessionUser(req);
  if (!user) return errorResponse('Unauthenticated', 'UNAUTHORIZED', 401);

  if (user.role !== 'ADMIN' && process.env.ALLOW_DEV_MOCKS !== 'true') {
    return errorResponse('Admin privileges required', 'FORBIDDEN', 403);
  }

  try {
    const body = await req.json();
    const data = ReviewSchema.parse(body);

    const incident = await prisma.incident.update({
      where: { id },
      data: {
        status: data.status,
        resolution: data.resolution,
      },
    });

    await prisma.auditEvent.create({
      data: {
        actorId: user.id,
        action: 'INCIDENT_REVIEWED',
        entity: 'Incident',
        entityId: id,
        outcome: 'SUCCESS',
        metadata: JSON.stringify(data),
      },
    });

    return okResponse({ incident });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Review error';
    return errorResponse(msg, 'REVIEW_ERROR', 400);
  }
}
