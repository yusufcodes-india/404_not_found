import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { okResponse, errorResponse } from '@/lib/api/response';
import { getSessionUser } from '@/lib/auth/session';

export async function GET(req: NextRequest) {
  const user = await getSessionUser(req);
  if (!user) return errorResponse('Unauthenticated', 'UNAUTHORIZED', 401);

  // In dev / demo mode, allow host or admin to inspect incidents
  if (user.role !== 'ADMIN' && process.env.ALLOW_DEV_MOCKS !== 'true') {
    return errorResponse('Admin privileges required', 'FORBIDDEN', 403);
  }

  const incidents = await prisma.incident.findMany({
    include: {
      booking: true,
      reporter: { select: { profile: { select: { fullName: true } } } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return okResponse(incidents);
}
