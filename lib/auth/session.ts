import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export interface AuthUser {
  id: string;
  phone: string;
  role: string;
  fullName: string;
}

export async function getSessionUser(req: NextRequest): Promise<AuthUser | null> {
  // Check Authorization header or cookie
  const authHeader = req.headers.get('authorization');
  let token = authHeader?.replace(/^Bearer\s+/i, '');

  if (!token) {
    token = req.cookies.get('kilari_session')?.value;
  }

  // If mock mode is enabled and a dev test token is provided
  if (!token && process.env.ALLOW_DEV_MOCKS === 'true') {
    const devUserId = req.headers.get('x-dev-user-id');
    if (devUserId) {
      const u = await prisma.user.findUnique({
        where: { id: devUserId },
        include: { profile: true },
      });
      if (u) {
        return {
          id: u.id,
          phone: u.phone,
          role: u.role,
          fullName: u.profile?.fullName || 'Kilari User',
        };
      }
    }
  }

  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: { include: { profile: true } } },
  });

  if (!session || session.expiresAt < new Date()) {
    return null;
  }

  return {
    id: session.user.id,
    phone: session.user.phone,
    role: session.user.role,
    fullName: session.user.profile?.fullName || 'Kilari Member',
  };
}

export async function createSession(userId: string): Promise<string> {
  const token = `kt_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

  await prisma.session.create({
    data: {
      userId,
      token,
      expiresAt,
    },
  });

  return token;
}
