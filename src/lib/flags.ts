/**
 * Feature flags for Kilari.
 * Handles environment variables and provides typed booleans for the application logic.
 */

export const flags = {
  demoMode: process.env.NEXT_PUBLIC_DEMO_MODE === 'true',

  // Provider settings
  aiProvider: (process.env.AI_PROVIDER as 'rules' | 'anthropic') || 'rules',
  kycProvider: (process.env.KYC_PROVIDER as 'mock' | 'digilocker') || 'mock',
  meterProvider: (process.env.METER_PROVIDER as 'mock' | 'smart-socket') || 'mock',

  // Map and Payment availability (derived from keys + demo mode)
  hasMapsKey: !!process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY,
  hasRazorpayKeys: !!process.env.RAZORPAY_KEY_ID && !!process.env.RAZORPAY_KEY_SECRET,

  // Integration flags
  useMockKyc: process.env.KYC_PROVIDER === 'mock' || process.env.NEXT_PUBLIC_DEMO_MODE === 'true',
  useMockMeter: process.env.METER_PROVIDER === 'mock' || process.env.NEXT_PUBLIC_DEMO_MODE === 'true',
  useRuleBasedAi: process.env.AI_PROVIDER === 'rules' || process.env.NEXT_PUBLIC_DEMO_MODE === 'true',
} as const;

export type AppFlags = typeof flags;
