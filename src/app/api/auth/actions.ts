"use server";

import { sendOtpService, verifyOtpService } from '@/lib/services/auth';

export async function sendOtp(phone: string) {
  return await sendOtpService(phone);
}

export async function verifyOtp(phone: string, token: string) {
  return await verifyOtpService(phone, token);
}
