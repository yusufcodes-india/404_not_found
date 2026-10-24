import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { okResponse, errorResponse } from '@/lib/api/response';
import { getSessionUser } from '@/lib/auth/session';

export async function GET(req: NextRequest) {
  const user = await getSessionUser(req);
  if (!user) return errorResponse('Unauthenticated', 'UNAUTHORIZED', 401);

  if (user.role !== 'ADMIN' && process.env.ALLOW_DEV_MOCKS !== 'true') {
    return errorResponse('Admin privileges required', 'FORBIDDEN', 403);
  }

  const audits = await prisma.auditEvent.findMany({
    take: 50,
    orderBy: { createdAt: 'desc' },
    include: {
      actor: { select: { phone: true, role: true } },
    },
  });

  return okResponse(audits);
}
