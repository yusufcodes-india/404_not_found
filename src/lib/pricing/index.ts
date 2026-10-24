const PRICE_PER_KWH_PAISE = 1400; // ₹14
const PLATFORM_FEE_PERCENT = 0.10; // 10%
const PAYMENT_COST_PERCENT = 0.025; // 2.5%

export interface SessionCalculation {
  gross: number;
  platformFee: number;
  hostEarnings: number;
  paymentCost: number;
  contribution: number;
}

export function calcSession(kwh: number): SessionCalculation {
  const gross = Math.round(kwh * PRICE_PER_KWH_PAISE);
  const platformFee = Math.round(gross * PLATFORM_FEE_PERCENT);
  const paymentCost = Math.round(gross * PAYMENT_COST_PERCENT);
  const hostEarnings = gross - platformFee;
  const contribution = hostEarnings - paymentCost;

  return {
    gross,
    platformFee,
    hostEarnings,
    paymentCost,
    contribution,
  };
}

export type RefundEvent = 'renter_cancel' | 'host_cancel' | 'charger_failure' | 'emergency';

export function refundFor(event: RefundEvent, hoursBefore: number, paidAmountPaise: number) {
  if (event === 'host_cancel' || event === 'charger_failure') {
    return {
      refundAmount: paidAmountPaise,
      penalty: 0,
      reason: 'Full refund due to host/hardware issue',
    };
  }

  if (event === 'emergency') {
    // Emergency is reviewed, but usually full refund
    return {
      refundAmount: paidAmountPaise,
      penalty: 0,
      reason: 'Full refund approved for emergency',
    };
  }

  if (event === 'renter_cancel') {
    if (hoursBefore >= 6) {
      return { refundAmount: paidAmountPaise, penalty: 0, reason: 'Full refund (>6h)' };
    } else if (hoursBefore >= 2) {
      return {
        refundAmount: Math.round(paidAmountPaise * 0.75),
        penalty: Math.round(paidAmountPaise * 0.25),
        reason: '75% refund (2-6h)',
      };
    } else {
      return {
        refundAmount: Math.round(paidAmountPaise * 0.5),
        penalty: Math.round(paidAmountPaise * 0.5),
        reason: '50% refund (<2h)',
      };
    }
  }

  return { refundAmount: 0, penalty: paidAmountPaise, reason: 'No refund' };
}
