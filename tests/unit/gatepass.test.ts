import { describe, it, expect } from 'vitest';
import { signGatePass, verifyGatePass, generateQrDataUrl } from '@/lib/gatepass/token';

describe('Gate Pass JWT and QR Generator', () => {
  it('signs and verifies gate pass tokens securely with claims', async () => {
    const claims = {
      bookingId: 'book-1234',
      chargerId: 'chg-5678',
      driverId: 'drv-999',
      chargerTitle: 'Green Hive Society',
      startsAt: '2026-10-25T22:00:00Z',
      endsAt: '2026-10-26T06:00:00Z',
    };

    const token = await signGatePass(claims);
    expect(typeof token).toBe('string');
    expect(token.length).toBeGreaterThan(20);

    const verified = await verifyGatePass(token);
    expect(verified).not.toBeNull();
    expect(verified?.bookingId).toBe('book-1234');
    expect(verified?.chargerTitle).toBe('Green Hive Society');
  });

  it('generates a valid base64 QR data URL', async () => {
    const qr = await generateQrDataUrl('KIL-PASS-TEST-123');
    expect(qr.startsWith('data:image/png;base64,')).toBe(true);
  });
});
