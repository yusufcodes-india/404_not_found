import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { okResponse, errorResponse } from '@/lib/api/response';
import { getSessionUser } from '@/lib/auth/session';

export async function GET(req: NextRequest) {
  const user = await getSessionUser(req);
  if (!user) {
    return errorResponse('Unauthenticated', 'UNAUTHORIZED', 401);
  }

  const profile = await prisma.profile.findUnique({
    where: { userId: user.id },
    include: {
      verifications: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
  });

  const latest = profile?.verifications?.[0];

  return okResponse({
    status: profile?.kycStatus || 'NOT_STARTED',
    provider: latest?.provider || 'mock',
    last4: latest?.last4,
    verifiedAt: latest?.verifiedAt,
    isMock: latest?.provider === 'mock',
  });
}
