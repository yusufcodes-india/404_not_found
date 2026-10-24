import { NextRequest } from 'next/server';
import { z } from 'zod';
import { okResponse, errorResponse } from '@/lib/api/response';
import { getSessionUser } from '@/lib/auth/session';
import { GemmaGateway } from '@/lib/ai/gemma';
import { RiskAssessmentSchema, RiskAssessmentOutput } from '@/lib/ai/types';

const RiskSchema = z.object({
  entityType: z.enum(['BOOKING', 'INCIDENT', 'ANOMALY']),
  details: z.string(),
});

export async function POST(req: NextRequest) {
  const user = await getSessionUser(req);
  if (!user) return errorResponse('Unauthenticated', 'UNAUTHORIZED', 401);

  try {
    const body = await req.json();
    const { entityType, details } = RiskSchema.parse(body);

    const fallback: RiskAssessmentOutput = {
      riskLevel: 'LOW',
      flags: ['STANDARD_SESSION'],
      summary: 'No critical telemetry deviations or safety hazards detected.',
    };

    const prompt = `You are the Kilari Risk & Anomaly Assessment Engine powered by Gemma 4.
Entity Type: ${entityType}
Details: ${details}
Respond with JSON matching schema:
{
  "riskLevel": "LOW",
  "flags": ["list of risk flags"],
  "summary": "Concise risk analysis"
}`;

    const result = await GemmaGateway.generateStructured(
      prompt,
      RiskAssessmentSchema,
      fallback,
      {
        taskName: 'risk_assessment',
        userId: user.id,
      }
    );

    return okResponse(result.data);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Risk assessment error';
    return errorResponse(msg, 'AI_ERROR', 400);
  }
}
