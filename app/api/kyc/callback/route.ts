import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { okResponse, errorResponse } from '@/lib/api/response';
import { getSessionUser } from '@/lib/auth/session';
import { KycAdapter } from '@/lib/adapters/kyc';

const CallbackSchema = z.object({
  referenceId: z.string(),
  licenceNumber: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const user = await getSessionUser(req);
  if (!user) {
    return errorResponse('Unauthenticated', 'UNAUTHORIZED', 401);
  }

  try {
    const body = await req.json();
    const { referenceId, licenceNumber } = CallbackSchema.parse(body);

    const profile = await prisma.profile.findUnique({ where: { userId: user.id } });
    if (!profile) return errorResponse('Profile not found', 'NOT_FOUND', 404);

    const verifyResult = await KycAdapter.completeMockVerification(referenceId, licenceNumber);

    await prisma.kycVerification.updateMany({
      where: { profileId: profile.id, referenceId },
      data: {
        status: 'VERIFIED',
        last4: verifyResult.last4,
        verifiedAt: new Date(),
      },
    });

    await prisma.profile.update({
      where: { id: profile.id },
      data: { kycStatus: 'VERIFIED' },
    });

    return okResponse({
      verified: true,
      status: 'VERIFIED',
      last4: verifyResult.last4,
      isMock: true,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'KYC verification failed';
    return errorResponse(msg, 'CALLBACK_ERROR', 400);
  }
}
