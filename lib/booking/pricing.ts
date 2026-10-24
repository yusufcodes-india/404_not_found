export const PRICE_PAISE_PER_KWH = 1400;
export const PLATFORM_FEE_BPS = 1000;
export const PAYMENT_COST_BPS = 250;

function roundHalfUp(n: number): number {
  if (!Number.isFinite(n) || n < 0) throw new Error("Amount must be a finite non-negative number");
  return Math.floor(n + 0.5);
}

export function quote(estKwh: number): number {
  if (!Number.isFinite(estKwh) || estKwh <= 0 || estKwh > 200) {
    throw new Error("Estimated energy must be greater than 0 and at most 200 kWh");
  }
  return roundHalfUp(estKwh * PRICE_PAISE_PER_KWH);
}

export function calcSession(kwh: number) {
  if (!Number.isFinite(kwh) || kwh < 0 || kwh > 200) throw new Error("Invalid metered energy");
  const grossPaise = roundHalfUp(kwh * PRICE_PAISE_PER_KWH);
  const platformFeePaise = roundHalfUp(grossPaise * PLATFORM_FEE_BPS / 10_000);
  const hostEarningsPaise = grossPaise - platformFeePaise;
  const paymentCostEstimatePaise = roundHalfUp(grossPaise * PAYMENT_COST_BPS / 10_000);
  return {
    grossPaise,
    platformFeePaise,
    hostEarningsPaise,
    paymentCostEstimatePaise,
    contributionPaise: platformFeePaise - paymentCostEstimatePaise
  };
}

export function finalCharge(meteredKwh: number, prepaidPaise: number) {
  if (!Number.isSafeInteger(prepaidPaise) || prepaidPaise < 0) throw new Error("Invalid prepaid amount");
  const grossPaise = roundHalfUp(meteredKwh * PRICE_PAISE_PER_KWH);
  return { chargedPaise: Math.min(grossPaise, prepaidPaise), refundPaise: Math.max(0, prepaidPaise - grossPaise) };
}