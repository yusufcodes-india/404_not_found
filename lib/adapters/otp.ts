export interface SendOtpResult {
  success: boolean;
  messageId?: string;
  error?: string;
  isMock: boolean;
  devOtp?: string;
}

// Global in-memory OTP store for active codes (10 min expiry)
const otpStore = new Map<string, { code: string; expires: number }>();

export class OtpAdapter {
  static generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  static storeOtp(cleanPhone: string, code: string) {
    otpStore.set(cleanPhone, {
      code,
      expires: Date.now() + 10 * 60 * 1000,
    });
  }

  static verifyOtp(cleanPhone: string, inputCode: string): boolean {
    // 123456 always accepted in dev / mock mode
    if (inputCode === '123456' && process.env.ALLOW_DEV_MOCKS === 'true') {
      return true;
    }
    const entry = otpStore.get(cleanPhone);
    if (!entry) return false;
    if (Date.now() > entry.expires) {
      otpStore.delete(cleanPhone);
      return false;
    }
    if (entry.code === inputCode) {
      otpStore.delete(cleanPhone);
      return true;
    }
    return false;
  }

  static async sendOtp(phone: string, otp: string): Promise<SendOtpResult> {
    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    this.storeOtp(cleanPhone, otp);

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const apiKeySid = process.env.TWILIO_API_KEY_SID;
    const apiKeySecret = process.env.TWILIO_API_KEY_SECRET;
    const fromNumber = process.env.TWILIO_FROM_NUMBER;
    const provider = process.env.OTP_PROVIDER || 'twilio';

    // If provider is mock or credentials incomplete, return dev mode OTP
    if (
      provider === 'mock' ||
      !accountSid ||
      !apiKeySid ||
      !apiKeySecret ||
      !fromNumber
    ) {
      console.log(`[OTP] Dev/Mock mode for ${phone}: OTP is ${otp}`);
      return {
        success: true,
        isMock: true,
        devOtp: otp,
      };
    }

    try {
      // Basic auth with API Key SID and Secret
      const authHeader = 'Basic ' + Buffer.from(`${apiKeySid}:${apiKeySecret}`).toString('base64');
      const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;

      // Twilio requires international format (+91...)
      const formattedTo = phone.startsWith('+') ? phone : `+91${cleanPhone}`;

      const params = new URLSearchParams();
      params.append('To', formattedTo);
      params.append('From', fromNumber);
      params.append('Body', `Your Kilari EV verification code is: ${otp}. Valid for 10 minutes.`);

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: authHeader,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      });

      const data = await res.json();

      if (!res.ok) {
        console.warn(`[Twilio OTP Error] ${data.message || res.statusText}`);
        return {
          success: false,
          error: data.message || `Twilio HTTP ${res.status}`,
          isMock: false,
          devOtp: process.env.ALLOW_DEV_MOCKS === 'true' ? otp : undefined,
        };
      }

      return {
        success: true,
        messageId: data.sid,
        isMock: false,
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[OTP Exception] ${msg}`);
      return {
        success: false,
        error: msg,
        isMock: false,
        devOtp: process.env.ALLOW_DEV_MOCKS === 'true' ? otp : undefined,
      };
    }
  }
}
