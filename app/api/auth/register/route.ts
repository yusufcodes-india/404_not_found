import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { okResponse, errorResponse } from '@/lib/api/response';
import { createSession } from '@/lib/auth/session';

const RegisterSchema = z.object({
  phone: z.string(),
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  role: z.enum(['DRIVER', 'HOST', 'BOTH']).default('DRIVER'),
  city: z.string().default('Pune'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone, fullName, role, city } = RegisterSchema.parse(body);
    const cleanPhone = phone.replace(/\D/g, '').slice(-10);

    const existing = await prisma.user.findUnique({ where: { phone: cleanPhone } });
    if (existing) {
      return errorResponse('User with this mobile already exists. Please log in.', 'USER_EXISTS', 409);
    }

    const user = await prisma.user.create({
      data: {
        phone: cleanPhone,
        role,
        profile: {
          create: {
            fullName,
            city,
            kycStatus: 'NOT_STARTED',
          },
        },
      },
      include: { profile: true },
    });

    const token = await createSession(user.id);
    const res = okResponse({
      user: {
        id: user.id,
        phone: user.phone,
        role: user.role,
        fullName: user.profile?.fullName,
      },
      token,
    });

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
    return errorResponse(msg, 'REGISTRATION_ERROR', 400);
  }
}
