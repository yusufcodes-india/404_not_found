import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { okResponse, errorResponse } from '@/lib/api/response';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  const charger = await prisma.charger.findUnique({
    where: { id },
    include: {
      telemetries: { orderBy: { recordedAt: 'desc' }, take: 10 },
      healthEvents: { orderBy: { createdAt: 'desc' }, take: 5 },
      anomalies: { where: { status: 'OPEN' } },
    },
  });

  if (!charger) return errorResponse('Charger not found', 'NOT_FOUND', 404);

  return okResponse({
    chargerId: charger.id,
    healthScore: charger.healthScore,
    status: charger.status,
    recentTelemetry: charger.telemetries,
    recentEvents: charger.healthEvents,
    openAnomalies: charger.anomalies,
  });
}
