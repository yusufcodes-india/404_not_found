import crypto from 'crypto';

export interface PaymentOrderResult {
  orderId: string;
  amountPaise: number;
  currency: string;
  provider: 'razorpay' | 'mock';
  keyId?: string;
  isMock: boolean;
}

export class PaymentAdapter {
  static async createOrder(bookingId: string, amountPaise: number): Promise<PaymentOrderResult> {
    const provider = process.env.PAYMENT_PROVIDER || 'mock';
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (provider === 'razorpay' && keyId && keySecret && !keyId.includes('placeholder')) {
      const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
      const response = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${auth}`,
        },
        body: JSON.stringify({
          amount: amountPaise,
          currency: 'INR',
          receipt: `rcpt_${bookingId.slice(0, 15)}`,
          payment_capture: 1,
        }),
      });

      if (!response.ok) {
        throw new Error(`Razorpay order creation failed: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        orderId: data.id,
        amountPaise,
        currency: 'INR',
        provider: 'razorpay',
        keyId,
        isMock: false,
      };
    }

    // Mock order for test mode
    return {
      orderId: `order_mock_${Date.now()}_${bookingId.slice(0, 6)}`,
      amountPaise,
      currency: 'INR',
      provider: 'mock',
      keyId: 'rzp_test_mock',
      isMock: true,
    };
  }

  static verifySignature(orderId: string, paymentId: string, signature: string): boolean {
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret || keySecret === 'placeholder_secret' || process.env.ALLOW_DEV_MOCKS === 'true') {
      // In dev/mock mode, accept mock signatures
      return true;
    }

    const expected = crypto
      .createHmac('sha256', keySecret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  }
}
