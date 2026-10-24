import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { okResponse, errorResponse } from '@/lib/api/response';
import { getSessionUser } from '@/lib/auth/session';

export async function GET(req: NextRequest) {
  const user = await getSessionUser(req);
  if (!user) {
    return errorResponse('Unauthenticated', 'UNAUTHORIZED', 401);
  }

  const full = await prisma.user.findUnique({
    where: { id: user.id },
    include: {
      profile: true,
      vehicles: true,
    },
  });

  return okResponse({
    user: {
      id: full?.id,
      phone: full?.phone,
      role: full?.role,
      fullName: full?.profile?.fullName,
      city: full?.profile?.city,
      kycStatus: full?.profile?.kycStatus,
      vehicles: full?.vehicles || [],
    },
  });
}
