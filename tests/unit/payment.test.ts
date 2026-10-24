import { describe, it, expect } from 'vitest';
import { PaymentAdapter } from '@/lib/adapters/payment';

describe('Payment Adapter', () => {
  it('creates a mock payment order when provider is mock or keys are placeholder', async () => {
    const order = await PaymentAdapter.createOrder('booking-123', 14000);
    expect(order.amountPaise).toBe(14000);
    expect(order.currency).toBe('INR');
    expect(order.isMock).toBe(true);
    expect(order.orderId.startsWith('order_mock_')).toBe(true);
  });

  it('validates test signature correctly in dev/mock mode', () => {
    const isValid = PaymentAdapter.verifySignature('order_1', 'pay_1', 'sig_1');
    expect(isValid).toBe(true);
  });
});
