import { z } from 'zod';

export type GemmaModel = 'gemma-4-31b-it' | 'gemma-4-26b-a4b-it';

export interface AiGatewayOptions {
  taskName: string;
  userId?: string;
  requestId?: string;
  timeoutMs?: number;
  maxTokens?: number;
}

export interface AiGatewayResult<T> {
  success: boolean;
  data: T;
  model: string;
  source: 'gemma4' | 'rules_fallback';
  latencyMs: number;
  tokensUsed?: number;
  requestId: string;
}

// Zod schemas for AI outputs
export const ChatAssistantSchema = z.object({
  answer: z.string(),
  needsHuman: z.boolean().default(false),
  reason: z.string().optional(),
});
export type ChatAssistantOutput = z.infer<typeof ChatAssistantSchema>;

export const RecommendationSchema = z.object({
  recommendedChargerId: z.string().optional(),
  summary: z.string(),
  reasons: z.array(z.string()),
  smartScore: z.number().min(0).max(100),
});
export type RecommendationOutput = z.infer<typeof RecommendationSchema>;

export const InsightsSchema = z.object({
  demandSummary: z.string(),
  healthSummary: z.string(),
  recommendations: z.array(z.string()),
  reliabilityScore: z.number().min(0).max(100),
});
export type InsightsOutput = z.infer<typeof InsightsSchema>;

export const ModerationSchema = z.object({
  allowed: z.boolean(),
  flags: z.array(z.string()),
  explanation: z.string().optional(),
});
export type ModerationOutput = z.infer<typeof ModerationSchema>;

export const RiskAssessmentSchema = z.object({
  riskLevel: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  flags: z.array(z.string()),
  summary: z.string(),
});
export type RiskAssessmentOutput = z.infer<typeof RiskAssessmentSchema>;
