import { NextRequest } from 'next/server';
import { z } from 'zod';
import { okResponse, errorResponse } from '@/lib/api/response';
import { OtpAdapter } from '@/lib/adapters/otp';

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

    // Generate OTP (or 123456 if dev mock)
    const otp = process.env.ALLOW_DEV_MOCKS === 'true' ? '123456' : OtpAdapter.generateOtp();
    const result = await OtpAdapter.sendOtp(cleanPhone, otp);

    return okResponse({
      phone: cleanPhone,
      otpSent: result.success,
      hint: result.devOtp ? `Demo code is ${result.devOtp}` : 'OTP sent via SMS',
      isMock: result.isMock,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Invalid request';
    return errorResponse(msg, 'VALIDATION_ERROR', 400);
  }
}
