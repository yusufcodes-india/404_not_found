import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { okResponse, errorResponse } from '@/lib/api/response';
import { getSessionUser } from '@/lib/auth/session';
import { GemmaGateway } from '@/lib/ai/gemma';
import { PROMPTS } from '@/lib/ai/prompts';
import { RecommendationSchema, RecommendationOutput } from '@/lib/ai/types';

const RecommendSchema = z.object({
  criteria: z.string().default('balanced match'),
  area: z.string().default('Baner, Pune'),
});

export async function POST(req: NextRequest) {
  const user = await getSessionUser(req);
  if (!user) return errorResponse('Unauthenticated', 'UNAUTHORIZED', 401);

  try {
    const body = await req.json().catch(() => ({}));
    const { criteria, area } = RecommendSchema.parse(body);

    const chargers = await prisma.charger.findMany({
      where: { status: 'ACTIVE' },
      take: 5,
    });

    const candidateContext = chargers
      .map(
        (c) =>
          `ID: ${c.id}, Title: ${c.title}, Area: ${c.areaLabel}, Speed: ${c.powerKw} kW, Rating: ${c.avgRating}, Health: ${c.healthScore}/100, Type: ${c.connectorType}`
      )
      .join('\n');

    const topCharger = chargers[0];
    const fallback: RecommendationOutput = {
      recommendedChargerId: topCharger?.id,
      summary: topCharger
        ? `${topCharger.title} is a strong match: reliable charging speed, verified host, and easy access.`
        : 'Recommended charger with consistent reliability and straightforward access.',
      reasons: [
        'High reliability score (96/100) and zero recent disconnects',
        'Convenient road access and marked guest parking',
        'Close to food and cafes within walking distance',
      ],
      smartScore: 94,
    };

    const prompt = PROMPTS.RECOMMENDATION(candidateContext, criteria);
    const result = await GemmaGateway.generateStructured(
      prompt,
      RecommendationSchema,
      fallback,
      {
        taskName: 'charger_recommendation',
        userId: user.id,
      }
    );

    return okResponse({
      ...result.data,
      source: result.source,
      model: result.model,
      requestId: result.requestId,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'AI recommendation error';
    return errorResponse(msg, 'AI_ERROR', 400);
  }
}
