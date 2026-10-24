import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { okResponse, errorResponse } from '@/lib/api/response';

const TelemetrySchema = z.object({
  voltage: z.number().optional(),
  current: z.number().optional(),
  powerKw: z.number().optional(),
  status: z.string().default('ONLINE'),
});

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  try {
    const body = await req.json();
    const data = TelemetrySchema.parse(body);

    const session = await prisma.chargingSession.findUnique({
      where: { id },
      include: { booking: true },
    });

    if (!session) return errorResponse('Session not found', 'NOT_FOUND', 404);

    const telemetry = await prisma.chargerTelemetry.create({
      data: {
        chargerId: session.booking.chargerId,
        voltage: data.voltage,
        current: data.current,
        powerKw: data.powerKw,
        status: data.status,
      },
    });

    return okResponse({ telemetry });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Telemetry error';
    return errorResponse(msg, 'TELEMETRY_ERROR', 400);
  }
}
