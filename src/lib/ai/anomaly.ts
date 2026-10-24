import { flags } from '@/lib/flags';

export type AnomalySeverity = 'Low' | 'Medium' | 'High';

export interface Anomaly {
  id: string;
  severity: AnomalySeverity;
  evidence: string;
  confidence: number;
  status: 'pending' | 'dismissed' | 'confirmed';
}

export function detectAnomaly(sessionData: {
  expectedKwh: number;
  actualKwh: number;
  durationMins: number;
  powerRatingKw: number;
}): { isAnomaly: boolean; anomaly?: Anomaly } {
  const { expectedKwh, actualKwh, durationMins, powerRatingKw } = sessionData;

  // 1. Energy Delivery Check (Z-score style)
  // If actual energy is > 20% off from expected for the duration, flag it
  const energyDiff = Math.abs(actualKwh - expectedKwh) / expectedKwh;
  if (energyDiff > 0.2) {
    return {
      isAnomaly: true,
      anomaly: {
        id: `anom_${Date.now()}`,
        severity: energyDiff > 0.5 ? 'High' : 'Medium',
        evidence: `Energy variance: ${(energyDiff * 100).toFixed(1)}%`,
        confidence: 0.85,
        status: 'pending',
      },
    };
  }

  // 2. Power Rating Check
  // If the energy delivered exceeds the physical limit of the charger
  const maxPossibleKwh = (powerRatingKw * (durationMins / 60));
  if (actualKwh > maxPossibleKwh * 1.1) { // 10% tolerance
    return {
      isAnomaly: true,
      anomaly: {
        id: `anom_${Date.now()}`,
        severity: 'High',
        evidence: `Exceeded charger power rating (${powerRatingKw}kW)`,
        confidence: 0.95,
        status: 'pending',
      },
    };
  }

  return { isAnomaly: false };
}
