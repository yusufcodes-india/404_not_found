import { flags } from './flags';

export interface KycResult {
  verified: boolean;
  last4?: string;
  name?: string;
  error?: string;
}

export interface KycAdapter {
  start(userId: string): Promise<{ redirectUrl?: string; ref: string }>;
  verify(ref: string): Promise<KycResult>;
}

class MockKycAdapter implements KycAdapter {
  async start(userId: string) {
    return { ref: `mock-ref-${userId}` };
  }

  async verify(ref: string): Promise<KycResult> {
    // Magic failing number check is handled in the UI, but here's the logic
    if (ref.includes('00000')) {
      return { verified: false, error: 'Verification failed' };
    }
    return {
      verified: true,
      last4: '2345',
      name: 'Yusuf Tarwala',
    };
  }
}

class DigiLockerAdapter implements KycAdapter {
  async start() { throw new Error('DigiLocker not configured'); }
  async verify() { throw new Error('DigiLocker not configured'); }
}

export function getKycAdapter(): KycAdapter {
  return flags.useMockKyc ? new MockKycAdapter() : new DigiLockerAdapter();
}
