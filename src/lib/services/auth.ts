import { z } from 'zod';
import { cookies } from 'next/headers';

const phoneSchema = z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number.");

export async function sendOtpService(phone: string) {
  const result = phoneSchema.safeParse(phone);
  if (!result.success) {
    return { success: false, error: result.error.errors[0].message };
  }

  try {
    // In a real app: await supabase.auth.signInWithOtp({ phone: '+91' + phone })
    console.log(`Sending OTP to +91${phone}...`);

    const cookieStore = await cookies();
    cookieStore.set('pending_phone', phone, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 10,
    });

    return { success: true };
  } catch (err) {
    return { success: false, error: 'Couldn\'t send OTP. Please try again.' };
  }
}

export async function verifyOtpService(phone: string, token: string) {
  try {
    // In a real app: await supabase.auth.verifyOtp({ phone, token, type: 'sms' })
    console.log(`Verifying OTP for +91${phone} with token ${token}...`);

    if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true' && token === '123456') {
      const cookieStore = await cookies();
      cookieStore.delete('pending_phone');
      return { success: true };
    }

    return { success: false, error: 'That code isn\'t right. Check it and try again.' };
  } catch (err) {
    return { success: false, error: 'Verification failed.' };
  }
}
