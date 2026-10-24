export interface KycStartResult {
  referenceId: string;
  provider: 'mock' | 'digilocker';
  redirectUrl?: string;
  isMock: boolean;
  message: string;
}

export interface KycVerifyResult {
  verified: boolean;
  status: 'PENDING' | 'VERIFIED' | 'REJECTED';
  last4?: string;
  provider: 'mock' | 'digilocker';
  isMock: boolean;
}

export class KycAdapter {
  static async startVerification(userId: string, consentVersion = '1.0'): Promise<KycStartResult> {
    const provider = process.env.KYC_PROVIDER || 'mock';

    if (provider === 'digilocker' && !process.env.DIGILOCKER_CLIENT_ID) {
      throw new Error('DigiLocker client credentials not configured. Please use mock mode in development.');
    }

    if (provider === 'digilocker') {
      const state = `dl_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const redirectUri = encodeURIComponent(process.env.DIGILOCKER_REDIRECT_URI || 'http://localhost:3000/api/kyc/callback');
      const authUrl = `https://digilocker.meripehchan.gov.in/public/oauth2/1/authorize?response_type=code&client_id=${process.env.DIGILOCKER_CLIENT_ID}&redirect_uri=${redirectUri}&state=${state}`;

      return {
        referenceId: state,
        provider: 'digilocker',
        redirectUrl: authUrl,
        isMock: false,
        message: 'Redirecting to DigiLocker portal...',
      };
    }

    // Default Mock Provider
    const ref = `mock_kyc_${Date.now()}_${userId.slice(0, 5)}`;
    return {
      referenceId: ref,
      provider: 'mock',
      isMock: true,
      message: 'Demo Driving Licence verification initiated (simulated). No real identity documents stored.',
    };
  }

  static async completeMockVerification(referenceId: string, licenceNumber?: string): Promise<KycVerifyResult> {
    const last4 = licenceNumber ? licenceNumber.replace(/\s+/g, '').slice(-4) : '1234';
    return {
      verified: true,
      status: 'VERIFIED',
      last4,
      provider: 'mock',
      isMock: true,
    };
  }
}
