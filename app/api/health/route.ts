import { okResponse } from '@/lib/api/response';

export async function GET() {
  const gemmaModel = process.env.GEMMA_MODEL || 'gemma-4-31b-it';
  const hasGemmaKey = Boolean(process.env.GEMMA_API_KEY);

  return okResponse({
    status: 'ok',
    service: 'Kilari EV Marketplace API',
    version: '1.0.0',
    time: new Date().toISOString(),
    ai: {
      provider: 'gemma4',
      model: gemmaModel,
      configured: hasGemmaKey,
      mode: hasGemmaKey ? 'online' : 'rules_fallback',
    },
    integrations: {
      database: 'connected',
      maps: {
        provider: process.env.MAPS_PROVIDER || 'geoapify',
        configured: Boolean(process.env.GEOAPIFY_API_KEY || process.env.MAPS_API_KEY),
      },
      payments: {
        provider: process.env.PAYMENT_PROVIDER || 'razorpay',
        configured: Boolean(process.env.RAZORPAY_KEY_ID),
      },
      otp: {
        provider: process.env.OTP_PROVIDER || 'twilio',
        configured: Boolean(process.env.TWILIO_API_KEY_SID || process.env.TWILIO_ACCOUNT_SID),
      },
      kyc: process.env.KYC_PROVIDER || 'mock',
    },
  });
}