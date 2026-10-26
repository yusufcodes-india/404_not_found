import { describe, it, expect } from 'vitest';
import { GET as getHealth } from '@/app/api/health/route';
import { GET as getChargers } from '@/app/api/chargers/route';
import { POST as verifyOtp } from '@/app/api/auth/verify-otp/route';
import { GET as getUserLogs } from '@/app/api/user/logs/route';
import { NextRequest } from 'next/server';

describe('Kilari API Routes', () => {
  it('GET /api/health returns status ok and Gemma 4 model details', async () => {
    const res = await getHealth();
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(json.data.status).toBe('ok');
    expect(json.data.ai.provider).toBe('gemma4');
    expect(json.data.ai.model).toContain('gemma-4');
  });

  it('GET /api/chargers never exposes exactAddress or private fields in public discovery', async () => {
    const req = new NextRequest('http://localhost:3000/api/chargers');
    const res = await getChargers(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(Array.isArray(json.data)).toBe(true);

    for (const charger of json.data) {
      expect(charger.exactAddress).toBeUndefined();
      expect(charger.exactLat).toBeUndefined();
      expect(charger.exactLng).toBeUndefined();
      expect(charger.approxLat).toBeDefined();
      expect(charger.approxLng).toBeDefined();
      expect(charger.pricePerKwh).toBe(14);
    }
  });

  it('POST /api/auth/verify-otp updates name and logs login event', async () => {
    const req = new NextRequest('http://localhost:3000/api/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: '9876543210',
        otp: '123456',
        name: 'Kilari Test Driver',
        role: 'DRIVER'
      }),
    });
    const res = await verifyOtp(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(json.data.user.name).toBe('Kilari Test Driver');
    expect(json.data.token).toBeDefined();

    // Verify user logs returns the login event with bearer token
    const logsReq = new NextRequest('http://localhost:3000/api/user/logs', {
      headers: {
        Authorization: `Bearer ${json.data.token}`
      }
    });
    const logsRes = await getUserLogs(logsReq);
    expect(logsRes.status).toBe(200);
    const logsJson = await logsRes.json();
    expect(logsJson.ok).toBe(true);
    expect(logsJson.data.logs.some((l: { action: string }) => l.action === 'USER_LOGIN')).toBe(true);
  });
});
