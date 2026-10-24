import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { okResponse, errorResponse } from '@/lib/api/response';
import { getSessionUser } from '@/lib/auth/session';
import { KycAdapter } from '@/lib/adapters/kyc';

export async function POST(req: NextRequest) {
  const user = await getSessionUser(req);
  if (!user) {
    return errorResponse('Unauthenticated', 'UNAUTHORIZED', 401);
  }

  try {
    const profile = await prisma.profile.findUnique({ where: { userId: user.id } });
    if (!profile) return errorResponse('Profile not found', 'NOT_FOUND', 404);

    const result = await KycAdapter.startVerification(user.id);

    await prisma.kycVerification.create({
      data: {
        profileId: profile.id,
        provider: result.provider,
        referenceId: result.referenceId,
        status: 'PENDING',
      },
    });

    return okResponse(result);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'KYC start failed';
    return errorResponse(msg, 'KYC_ERROR', 400);
  }
}
