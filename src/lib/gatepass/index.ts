import * as jose from 'jose';
import { flags } from '@/lib/flags';

const SECRET = new TextEncoder().encode(process.env.GATEPASS_SIGNING_SECRET || 'demo-secret-key-minimum-32-chars-long!!');

export interface GatePassClaims {
  bookingId: string;
  chargerId: string;
  renterId: string;
  nbf: number;
  exp: number;
}

export async function generateGatePass(claims: GatePassClaims) {
  return await new jose.SignJWT(claims)
    .setProtectedHeader({ alg: 'HS256' })
    .sign(SECRET);
}

export async function verifyGatePass(token: string) {
  try {
    const { payload } = await jose.jwtVerify(token, SECRET);
    return { success: true, payload };
  } catch (err) {
    return { success: false, error: 'Invalid or expired token' };
  }
}
