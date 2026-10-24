import { NextRequest } from 'next/server';
import { MapsAdapter } from '@/lib/adapters/maps';
import { okResponse, errorResponse } from '@/lib/api/response';
import { z } from 'zod';

const RouteQuerySchema = z.object({
  fromLat: z.coerce.number(),
  fromLng: z.coerce.number(),
  toLat: z.coerce.number(),
  toLng: z.coerce.number(),
});

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const parsed = RouteQuerySchema.safeParse({
    fromLat: searchParams.get('fromLat'),
    fromLng: searchParams.get('fromLng'),
    toLat: searchParams.get('toLat'),
    toLng: searchParams.get('toLng'),
  });

  if (!parsed.success) {
    return errorResponse('Invalid coordinates supplied', 'BAD_REQUEST', 400);
  }

  const { fromLat, fromLng, toLat, toLng } = parsed.data;
  const route = await MapsAdapter.calculateRoute(fromLat, fromLng, toLat, toLng);
  return okResponse(route);
}
