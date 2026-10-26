import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { okResponse, errorResponse } from '@/lib/api/response';
import { getSessionUser } from '@/lib/auth/session';

const UpdateProfileSchema = z.object({
  fullName: z.string().min(2).optional(),
  city: z.string().optional(),
  phone: z.string().optional(),
  role: z.enum(['DRIVER', 'HOST', 'BOTH']).optional(), // Cannot self-promote to ADMIN
  vehicleMake: z.string().optional(),
  vehicleReg: z.string().optional(),
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

    const userUpdates: { role?: string; phone?: string } = {};
    if (data.role) userUpdates.role = data.role;
    if (data.phone) {
      const clean = data.phone.replace(/\D/g, '').slice(-10);
      if (/^[6-9]\d{9}$/.test(clean)) userUpdates.phone = clean;
    }

    if (Object.keys(userUpdates).length > 0) {
      await prisma.user.update({
        where: { id: user.id },
        data: userUpdates,
      });
    }

    const updated = await prisma.profile.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        fullName: data.fullName || user.fullName,
        city: data.city || 'Pune',
        onboardingStep: data.onboardingStep || 'DONE',
        kycStatus: 'VERIFIED',
      },
      update: {
        ...(data.fullName ? { fullName: data.fullName } : {}),
        ...(data.city ? { city: data.city } : {}),
        ...(data.onboardingStep ? { onboardingStep: data.onboardingStep } : {}),
      },
      include: {
        user: { include: { vehicles: true } },
      },
    });

    if (data.vehicleReg || data.vehicleMake) {
      const defaultVehicle = await prisma.vehicle.findFirst({
        where: { userId: user.id, isDefault: true },
      });
      if (defaultVehicle) {
        await prisma.vehicle.update({
          where: { id: defaultVehicle.id },
          data: {
            makeModel: data.vehicleMake || defaultVehicle.makeModel,
            registration: data.vehicleReg || defaultVehicle.registration,
          },
        });
      } else {
        await prisma.vehicle.create({
          data: {
            userId: user.id,
            makeModel: data.vehicleMake || 'Tata Nexon EV',
            registration: data.vehicleReg || 'MH12AB1234',
            vehicleType: '4-wheeler',
            connector: 'Type 2',
            isDefault: true,
          },
        });
      }
    }

    // Log audit event
    await prisma.auditEvent.create({
      data: {
        actorId: user.id,
        action: 'PROFILE_UPDATED',
        entity: 'Profile',
        entityId: updated.id,
        outcome: 'SUCCESS',
        metadata: JSON.stringify({
          fullName: data.fullName,
          phone: data.phone,
          city: data.city,
          vehicleReg: data.vehicleReg,
          updatedAt: new Date().toISOString(),
        }),
      },
    }).catch(() => {});

    return okResponse({ profile: updated });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Invalid profile data';
    return errorResponse(msg, 'UPDATE_ERROR', 400);
  }
}
