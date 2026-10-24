import { flags } from '@/lib/flags';

export type DemandLevel = 'Low' | 'Medium' | 'High';

export interface DemandPrediction {
  level: DemandLevel;
  confidence: number; // 0-1
  recommendedSlot: string;
  reasons: string[];
}

export function predictDemand(area: string, hourOfWeek: number, history: any[]): DemandPrediction {
  // 1. Filter history for the area and hour
  const areaData = history.filter(h => h.area === area && h.hour_of_week === hourOfWeek);

  if (areaData.length === 0) {
    return {
      level: 'Medium',
      confidence: 0.3,
      recommendedSlot: '8 AM - 12 PM',
      reasons: ['Insufficient data for this window'],
    };
  }

  // 2. Calculate seasonal average with recency weighting
  // Simple average for demo; real app would use a decaying weighted average
  const avgRequests = areaData.reduce((acc, curr) => acc + curr.request_count, 0) / areaData.length;

  // 3. Map average to demand level
  let level: DemandLevel = 'Low';
  if (avgRequests > 15) level = 'High';
  else if (avgRequests > 5) level = 'Medium';

  // 4. Determine confidence based on data volume
  const confidence = Math.min(areaData.length / 10, 0.95);

  return {
    level,
    confidence,
    recommendedSlot: level === 'High' ? '6 AM - 10 AM' : 'Anytime',
    reasons: level === 'High' ? ['Historical peak demand for this area'] : ['Generally available'],
  };
}
