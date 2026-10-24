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

    if (!user) {
      user = await prisma.user.create({
        data: {
          phone: cleanPhone,
          role,
          profile: {
            create: {
              fullName: name || (role === 'DRIVER' ? 'Honey Kumar' : 'Priya Sharma'),
              city: 'Pune',
              kycStatus: 'VERIFIED', // Seed initial mock users as verified for demo
            },
          },
        },
        include: { profile: true },
      });
    }

    const token = await createSession(user.id);
    const res = okResponse({
      user: {
        id: user.id,
        phone: user.phone,
        role: user.role,
        fullName: user.profile?.fullName,
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
