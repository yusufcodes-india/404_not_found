import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { okResponse, errorResponse } from '@/lib/api/response';
import { getSessionUser } from '@/lib/auth/session';

const UpdateProfileSchema = z.object({
  fullName: z.string().min(2).optional(),
  city: z.string().optional(),
  role: z.enum(['DRIVER', 'HOST', 'BOTH']).optional(), // Cannot self-promote to ADMIN
  onboardingStep: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const user = await getSessionUser(req);
  if (!user) {
    return errorResponse('Unauthenticated', 'UNAUTHORIZED', 401);
  }

  const profile = await prisma.profile.findUnique({
    where: { userId: user.id },
    include: {
      user: {
        include: { vehicles: true },
      },
    },
  });

  return okResponse({ profile });
}

export async function PATCH(req: NextRequest) {
  const user = await getSessionUser(req);
  if (!user) {
    return errorResponse('Unauthenticated', 'UNAUTHORIZED', 401);
  }

  try {
    const body = await req.json();
    const data = UpdateProfileSchema.parse(body);

    if (data.role) {
      await prisma.user.update({
        where: { id: user.id },
        data: { role: data.role },
      });
    }

    const updated = await prisma.profile.update({
      where: { userId: user.id },
      data: {
        ...(data.fullName ? { fullName: data.fullName } : {}),
        ...(data.city ? { city: data.city } : {}),
        ...(data.onboardingStep ? { onboardingStep: data.onboardingStep } : {}),
      },
    });

    return okResponse({ profile: updated });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Invalid profile data';
    return errorResponse(msg, 'UPDATE_ERROR', 400);
  }
}
