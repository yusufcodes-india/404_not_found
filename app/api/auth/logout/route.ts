import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { okResponse } from '@/lib/api/response';

export async function POST(req: NextRequest) {
  const token = req.cookies.get('kilari_session')?.value || req.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (token) {
    try {
      await prisma.session.delete({ where: { token } });
    } catch {
      // Ignore if session already deleted
    }
  }

  const res = okResponse({ loggedOut: true });
  res.cookies.delete('kilari_session');
  return res;
}
