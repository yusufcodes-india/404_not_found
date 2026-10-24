import { NextRequest } from 'next/server';
import { z } from 'zod';
import { okResponse, errorResponse } from '@/lib/api/response';
import { getSessionUser } from '@/lib/auth/session';
import { GemmaGateway } from '@/lib/ai/gemma';
import { PROMPTS } from '@/lib/ai/prompts';
import { ModerationSchema, ModerationOutput } from '@/lib/ai/types';

const ModerateSchema = z.object({
  message: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const user = await getSessionUser(req);
  if (!user) return errorResponse('Unauthenticated', 'UNAUTHORIZED', 401);

  try {
    const body = await req.json();
    const { message } = ModerateSchema.parse(body);

    // Rule-based check first
    const hasPhone = /(?:\+?91|0)?[6-9]\d{9}|\b\d{7,}\b/.test(message);
    const hasEmail = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(message);
    const hasUrl = /https?:\/\/[^\s]+|www\.[^\s]+/i.test(message);

    const ruleBlocked = hasPhone || hasEmail || hasUrl;
    const flags: string[] = [];
    if (hasPhone) flags.push('PHONE_NUMBER');
    if (hasEmail) flags.push('EMAIL_ADDRESS');
    if (hasUrl) flags.push('EXTERNAL_LINK');

    const fallback: ModerationOutput = {
      allowed: !ruleBlocked,
      flags,
      explanation: ruleBlocked
        ? 'Message contains contact information (phone, email, or URL) which violates platform policy.'
        : undefined,
    };

    const prompt = PROMPTS.MODERATION(message);
    const result = await GemmaGateway.generateStructured(
      prompt,
      ModerationSchema,
      fallback,
      {
        taskName: 'chat_moderation',
        userId: user.id,
      }
    );

    // Rule-based safety ALWAYS overrides AI
    if (ruleBlocked) {
      result.data.allowed = false;
      result.data.flags = Array.from(new Set([...result.data.flags, ...flags]));
      result.data.explanation = fallback.explanation;
    }

    return okResponse(result.data);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Moderation error';
    return errorResponse(msg, 'AI_ERROR', 400);
  }
}
