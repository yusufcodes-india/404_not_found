import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { okResponse, errorResponse } from '@/lib/api/response';
import { createSession } from '@/lib/auth/session';
import { OtpAdapter } from '@/lib/adapters/otp';

const VerifySchema = z.object({
  phone: z.string(),
  otp: z.string(),
  name: z.string().optional(),
  role: z.enum(['DRIVER', 'HOST', 'BOTH', 'ADMIN']).default('DRIVER'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone, otp, name, role } = VerifySchema.parse(body);

    const cleanPhone = phone.replace(/\D/g, '').slice(-10);

    // Validate OTP
    const isValid = OtpAdapter.verifyOtp(cleanPhone, otp);
    if (!isValid) {
      return errorResponse("That code isn't right. Check it and try again.", 'INVALID_OTP', 400);
    }

    // Upsert User
    let user = await prisma.user.findUnique({
      where: { phone: cleanPhone },
      include: { profile: true },
    });

    const trimmedName = name?.trim() || '';

    if (!user) {
      user = await prisma.user.create({
        data: {
          phone: cleanPhone,
          role,
          profile: {
            create: {
              fullName: trimmedName || (role === 'DRIVER' ? 'Honey Kumar' : 'Priya Sharma'),
              city: 'Pune',
              kycStatus: 'VERIFIED', // Seed initial mock users as verified for demo
            },
          },
        },
        include: { profile: true },
      });
    } else if (trimmedName) {
      // User exists: update profile name so it matches the name entered at login!
      await prisma.profile.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          fullName: trimmedName,
          city: 'Pune',
          kycStatus: 'VERIFIED',
        },
        update: {
          fullName: trimmedName,
        },
      });
      user = await prisma.user.findUnique({
        where: { id: user.id },
        include: { profile: true },
      }) || user;
    }

    const token = await createSession(user.id);

    // Record audit event for user login
    await prisma.auditEvent.create({
      data: {
        actorId: user.id,
        action: 'USER_LOGIN',
        entity: 'User',
        entityId: user.id,
        outcome: 'SUCCESS',
        metadata: JSON.stringify({
          phone: cleanPhone,
          fullName: user.profile?.fullName || trimmedName,
          role: user.role,
          loginAt: new Date().toISOString(),
        }),
      },
    }).catch(() => {});

    const res = okResponse({
      user: {
        id: user.id,
        phone: user.phone,
        role: user.role,
        fullName: user.profile?.fullName || trimmedName,
        name: user.profile?.fullName || trimmedName,
        kycStatus: user.profile?.kycStatus,
      },
      token,
    });

    // Set secure HTTP-only cookie
    res.cookies.set('kilari_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60,
    });

    return res;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Invalid request';
    return errorResponse(msg, 'AUTH_ERROR', 400);
  }
}
