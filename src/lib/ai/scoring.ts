import { flags } from '@/lib/flags';

export interface ScoringMetrics {
  chargerRating: number;      // 1-5
  chargerCondition: number;    // 0-100
  ownerRating: number;        // 1-5
  ownerReliability: number;   // 0-100
  easeOfTravel: number;       // 0-100
}

export interface ScoreResult {
  totalScore: number;
  breakdown: {
    rating: number;
    condition: number;
    reliability: number;
    ease: number;
  };
  source: 'ai' | 'rules';
  reasons: string[];
}

const WEIGHTS = {
  chargerRating: 0.25,
  chargerCondition: 0.20,
  ownerRating: 0.15,
  ownerReliability: 0.20,
  easeOfTravel: 0.20,
};

// Bayesian smoothing: (weighted sum of ratings + prior) / (count + prior_count)
function smoothRating(rating: number, count: number, prior: number = 3.5, priorCount: number = 2) {
  return ((rating * count) + (prior * priorCount)) / (count + priorCount);
}

export function calculateKilariScore(metrics: ScoringMetrics, count: number = 1): ScoreResult {
  // 1. Smooth the 1-5 ratings to 0-100 scale
  const smoothedChargerRating = smoothRating(metrics.chargerRating, count) * 20;
  const smoothedOwnerRating = smoothRating(metrics.ownerRating, count) * 20;

  // 2. Calculate weighted sum
  const totalScore =
    (smoothedChargerRating * WEIGHTS.chargerRating) +
    (metrics.chargerCondition * WEIGHTS.chargerCondition) +
    (smoothedOwnerRating * WEIGHTS.ownerRating) +
    (metrics.ownerReliability * WEIGHTS.ownerReliability) +
    (metrics.easeOfTravel * WEIGHTS.easeOfTravel);

  // 3. Generate reasons based on highest contributing factors
  const reasons: string[] = [];
  if (smoothedChargerRating > 90) reasons.push('High community rating');
  if (metrics.chargerCondition > 90) reasons.push('Excellent charger condition');
  if (metrics.ownerReliability > 90) reasons.push('Very reliable host');
  if (metrics.easeOfTravel > 80) reasons.push('Easy to reach location');
  if (reasons.length === 0) reasons.push('Consistent performance');

  return {
    totalScore: Math.round(totalScore),
    breakdown: {
      rating: Math.round(smoothedChargerRating),
      condition: metrics.chargerCondition,
      reliability: metrics.ownerReliability,
      ease: metrics.easeOfTravel,
    },
    source: flags.demoMode ? 'rules' : 'ai',
    reasons,
  };
}
