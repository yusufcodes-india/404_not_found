import { NextRequest } from 'next/server';
import { z } from 'zod';
import { okResponse, errorResponse } from '@/lib/api/response';

const LoginSchema = z.object({
  phone: z.string().min(10, 'Valid 10-digit Indian mobile required'),
  name: z.string().optional(),
  role: z.enum(['DRIVER', 'HOST', 'BOTH', 'ADMIN']).default('DRIVER'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone } = LoginSchema.parse(body);

    // Normalize phone (strip +91, 0, spaces)
    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      return errorResponse('Please enter a valid 10-digit Indian mobile number', 'INVALID_PHONE', 400);
    }

    // In dev / mock mode, demo OTP is 123456
    return okResponse({
      phone: cleanPhone,
      otpSent: true,
      hint: process.env.ALLOW_DEV_MOCKS === 'true' ? 'Demo OTP is 123456' : 'OTP sent via SMS',
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Invalid request';
    return errorResponse(msg, 'VALIDATION_ERROR', 400);
  }
}
