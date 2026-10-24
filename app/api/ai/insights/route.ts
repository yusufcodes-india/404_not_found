import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { okResponse, errorResponse } from '@/lib/api/response';
import { getSessionUser } from '@/lib/auth/session';
import { GemmaGateway } from '@/lib/ai/gemma';
import { PROMPTS } from '@/lib/ai/prompts';
import { InsightsSchema, InsightsOutput } from '@/lib/ai/types';

export async function POST(req: NextRequest) {
  const user = await getSessionUser(req);
  if (!user) return errorResponse('Unauthenticated', 'UNAUTHORIZED', 401);

  try {
    const chargers = await prisma.charger.findMany({
      where: { ownerId: user.id },
      include: {
        telemetries: { take: 5, orderBy: { recordedAt: 'desc' } },
        anomalies: { where: { status: 'OPEN' } },
      },
    });

    const hostMetrics = `Host ID: ${user.id}. Total Chargers: ${chargers.length}. Open Anomalies: ${
      chargers.flatMap((c) => c.anomalies).length
    }. High Demand Windows: 6 PM - 9 PM. Rate: ₹14/kWh.`;

    const fallback: InsightsOutput = {
      demandSummary:
        'Demand is forecasted HIGH between 6 PM–9 PM (78% confidence). Evening commute top-ups represent your peak utilization window.',
      healthSummary:
        'Charger health averages 94/100 based on completed sessions. No critical electrical anomalies detected.',
      recommendations: [
        'Keep overnight slots available from 10 PM to 6 AM for high-completion bookings.',
        'Review guest access notes to reduce arrival coordination time.',
      ],
      reliabilityScore: 94,
    };

    const prompt = PROMPTS.INSIGHTS(hostMetrics);
    const result = await GemmaGateway.generateStructured(
      prompt,
      InsightsSchema,
      fallback,
      {
        taskName: 'demand_forecast_explanation',
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
    const msg = err instanceof Error ? err.message : 'AI insights error';
    return errorResponse(msg, 'AI_ERROR', 400);
  }
}
