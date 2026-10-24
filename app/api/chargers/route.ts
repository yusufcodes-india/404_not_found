import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { okResponse, errorResponse } from '@/lib/api/response';
import { getSessionUser } from '@/lib/auth/session';

const CreateChargerSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  type: z.enum(['Home', 'Society', 'Office', 'Business', 'Fleet']).default('Society'),
  currentType: z.enum(['AC', 'DC']).default('AC'),
  powerKw: z.number().min(3).max(150).default(11.0),
  connectorType: z.enum(['Type 2', 'CCS2', 'Bharat AC-001', '3-pin']).default('Type 2'),
  city: z.string().default('Pune'),
  areaLabel: z.string().default('Baner'),
  exactAddress: z.string().min(5),
  exactLat: z.number().optional(),
  exactLng: z.number().optional(),
  rules: z.string().optional(),
  parkingNotes: z.string().optional(),
  accessNotes: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const priority = searchParams.get('priority') || 'balanced';
  const connector = searchParams.get('connector');
  const area = searchParams.get('area');

  const chargers = await prisma.charger.findMany({
    where: {
      status: 'ACTIVE',
      ...(connector && connector !== 'all' ? { connectorType: connector } : {}),
      ...(area ? { areaLabel: { contains: area } } : {}),
    },
    include: {
      owner: {
        select: {
          profile: { select: { fullName: true } },
        },
      },
      availability: true,
    },
  });

  // Calculate deterministic Kilari scores and rank
  const scored = chargers.map((c, index) => {
    // Simulated distance in km based on index or coordinates for demo
    const distanceKm = 1.0 + index * 0.9;
    const costScore = Math.round(Math.max(0, 100 * (1 - (c.pricePerKwh / 100) / 30)));
    const distanceScore = Math.round(Math.max(0, 100 * (1 - distanceKm / 5)));
    const ownerScore = Math.round(c.avgRating * 20);
    const ease = Math.max(40, Math.min(99, Math.round(100 - 5 * distanceKm - 4)));
    const health = c.healthScore;

    let rankScore = Math.round((distanceScore + costScore + ease + ownerScore + health) / 5);
    if (priority === 'distance') rankScore = distanceScore;
    if (priority === 'price') rankScore = costScore;
    if (priority === 'route') rankScore = ease;
    if (priority === 'owner') rankScore = ownerScore;
    if (priority === 'health') rankScore = health;

    return {
      id: c.id,
      title: c.title,
      description: c.description,
      type: c.type,
      currentType: c.currentType,
      powerKw: c.powerKw,
      connectorType: c.connectorType,
      pricePerKwh: c.pricePerKwh / 100, // Rs 14
      city: c.city,
      areaLabel: c.areaLabel,
      approxLat: c.approxLat,
      approxLng: c.approxLng,
      // EXACT ADDRESS IS PRIVATE AND NEVER EXPOSED HERE
      status: c.status,
      ownerName: c.owner?.profile?.fullName || 'Verified Host',
      ownerRating: c.avgRating,
      distanceKm,
      scores: {
        distance: distanceScore,
        cost: costScore,
        route: ease,
        owner: ownerScore,
        health,
      },
      rankScore,
    };
  });

  scored.sort((a, b) => b.rankScore - a.rankScore);

  return okResponse(scored, { priority, total: scored.length });
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser(req);
  if (!user) {
    return errorResponse('Unauthenticated', 'UNAUTHORIZED', 401);
  }

  try {
    const body = await req.json();
    const data = CreateChargerSchema.parse(body);

    // Jitter coordinates by ~250m for public view
    const lat = data.exactLat || 18.559;
    const lng = data.exactLng || 73.786;
    const approxLat = lat + (Math.random() - 0.5) * 0.004;
    const approxLng = lng + (Math.random() - 0.5) * 0.004;

    const charger = await prisma.charger.create({
      data: {
        ownerId: user.id,
        title: data.title,
        description: data.description,
        type: data.type,
        currentType: data.currentType,
        powerKw: data.powerKw,
        connectorType: data.connectorType,
        pricePerKwh: 1400, // Fixed Rs 14 = 1400 paise
        city: data.city,
        areaLabel: data.areaLabel,
        approxLat,
        approxLng,
        exactAddress: data.exactAddress,
        exactLat: data.exactLat,
        exactLng: data.exactLng,
        rules: data.rules,
        parkingNotes: data.parkingNotes,
        accessNotes: data.accessNotes,
        status: 'ACTIVE',
      },
    });

    return okResponse({ charger }, undefined, 201);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Invalid charger data';
    return errorResponse(msg, 'CREATE_CHARGER_ERROR', 400);
  }
}
