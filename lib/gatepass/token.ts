import { SignJWT, jwtVerify } from 'jose';
import QRCode from 'qrcode';

const SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || 'kilari-gatepass-signing-secret-key-32-chars-long'
);

export interface GatePassClaims {
  bookingId: string;
  chargerId: string;
  driverId: string;
  chargerTitle: string;
  startsAt: string;
  endsAt: string;
}

export async function signGatePass(claims: GatePassClaims): Promise<string> {
  return await new SignJWT({ ...claims })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(SECRET);
}

export async function verifyGatePass(token: string): Promise<GatePassClaims | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as unknown as GatePassClaims;
  } catch {
    return null;
  }
}

export async function generateQrDataUrl(text: string): Promise<string> {
  return await QRCode.toDataURL(text, {
    errorCorrectionLevel: 'M',
    margin: 2,
    width: 256,
    color: {
      dark: '#173b35',
      light: '#ffffff',
    },
  });
}
