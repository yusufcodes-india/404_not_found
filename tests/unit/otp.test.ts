import { describe, it, expect } from 'vitest';
import { OtpAdapter } from '@/lib/adapters/otp';

describe('OtpAdapter', () => {
  it('generates 6-digit numeric OTP', () => {
    const otp = OtpAdapter.generateOtp();
    expect(otp).toMatch(/^\d{6}$/);
  });

  it('stores and verifies OTP accurately', () => {
    const phone = '9876543210';
    const otp = '849201';
    OtpAdapter.storeOtp(phone, otp);

    expect(OtpAdapter.verifyOtp(phone, '000000')).toBe(false);
    expect(OtpAdapter.verifyOtp(phone, otp)).toBe(true);
    // Once used, cannot be reused
    expect(OtpAdapter.verifyOtp(phone, otp)).toBe(false);
  });

  it('accepts 123456 in dev/mock mode', () => {
    const prev = process.env.ALLOW_DEV_MOCKS;
    process.env.ALLOW_DEV_MOCKS = 'true';
    try {
      expect(OtpAdapter.verifyOtp('9999999999', '123456')).toBe(true);
    } finally {
      process.env.ALLOW_DEV_MOCKS = prev;
    }
  });
});
