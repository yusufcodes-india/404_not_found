import { NextRequest } from 'next/server';
import { GemmaGateway } from '@/lib/ai/gemma';
import { okResponse, errorResponse } from '@/lib/api/response';
import { z } from 'zod';

const GemmaRequestSchema = z.object({
  prompt: z.string().min(1, 'Prompt cannot be empty'),
  task: z.string().optional().default('general_assistant'),
});

const AssistantResponseSchema = z.object({
  reply: z.string(),
  suggestions: z.array(z.string()).optional(),
  confidence: z.number().min(0).max(1).optional(),
});

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const parsed = GemmaRequestSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse('Invalid prompt supplied', 'BAD_REQUEST', 400);
    }

    const { prompt, task } = parsed.data;

    const formattedPrompt = `You are Kilari Assistant, a friendly and accurate AI helper for an EV community charging network in Pune, India.
Fixed charging rate is ₹14/kWh across all community chargers. Exact addresses are kept private until booking is confirmed.
Driver question: "${prompt}"

Provide your answer in strict JSON:
{
  "reply": "helpful, concise answer in markdown",
  "suggestions": ["Follow-up question 1", "Follow-up question 2"],
  "confidence": 0.95
}`;

    const result = await GemmaGateway.generateStructured(
      formattedPrompt,
      AssistantResponseSchema,
      {
        reply: `Welcome to Kilari! Community EV charging in Pune is ₹14/kWh fixed price. How can I assist with your journey today?`,
        suggestions: ['Find chargers near Hinjewadi', 'How does gate pass work?'],
        confidence: 0.9,
      },
      {
        taskName: task,
        maxTokens: 600,
        timeoutMs: 20000,
      }
    );

    return okResponse({
      ...result.data,
      model: result.model,
      source: result.source,
      latencyMs: result.latencyMs,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Gemma query failed';
    return errorResponse(message, 'AI_ERROR', 500);
  }
}

export async function GET() {
  const model = process.env.GEMMA_MODEL || 'gemma-4-26b-a4b-it';
  const hasKey = Boolean(process.env.GEMMA_API_KEY);
  return okResponse({
    service: 'Gemma 4 AI Assistant Gateway',
    model,
    configured: hasKey,
    mode: hasKey ? 'online' : 'rules_fallback',
  });
}
