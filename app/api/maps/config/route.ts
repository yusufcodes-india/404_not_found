import { MapsAdapter } from '@/lib/adapters/maps';
import { okResponse } from '@/lib/api/response';

export const dynamic = 'force-dynamic';

export async function GET() {
  const config = MapsAdapter.getConfig();
  return okResponse(config);
}
