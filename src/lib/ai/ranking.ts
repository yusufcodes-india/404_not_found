import { calculateKilariScore, ScoringMetrics } from './scoring';
import { flags } from '@/lib/flags';

export interface ChargerRanking {
  id: string;
  score: number;
  rank: number;
  reasons: string[];
}

export function rankChargers(chargers: any[], vehicle: any, slot: any): ChargerRanking[] {
  // 1. HARD FILTERS (Must pass)
  const filtered = chargers.filter(c => {
    // Compatibility: Connector and Current must match
    if (c.connector !== vehicle.connector) return false;

    // Availability: Must not overlap existing bookings for the slot
    // (This would typically be a DB query, but here we represent the logic)
    if (c.status !== 'active') return false;

    return true;
  });

  // 2. AI SCORING & RANKING
  const ranked = filtered.map(c => {
    const metrics: ScoringMetrics = {
      chargerRating: c.rating || 3.5,
      chargerCondition: c.condition || 80,
      ownerRating: c.ownerRating || 3.5,
      ownerReliability: c.ownerReliability || 80,
      easeOfTravel: c.easeOfTravel || 70,
    };

    const { totalScore, reasons } = calculateKilariScore(metrics, c.reviewCount || 1);

    return {
      id: c.id,
      score: totalScore,
      reasons,
    };
  });

  // Sort by score descending
  return ranked
    .sort((a, b) => b.score - a.score)
    .map((item, index) => ({ ...item, rank: index + 1 }));
}
