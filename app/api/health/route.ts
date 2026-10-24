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
      payments: process.env.PAYMENT_PROVIDER || 'mock',
      kyc: process.env.KYC_PROVIDER || 'mock',
    },
  });
}