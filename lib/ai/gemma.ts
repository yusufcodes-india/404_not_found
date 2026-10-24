import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { AiGatewayOptions, AiGatewayResult, GemmaModel } from './types';

export class GemmaGateway {
  private static defaultModel: GemmaModel = (process.env.GEMMA_MODEL as GemmaModel) || 'gemma-4-31b-it';

  static async generateStructured<T>(
    prompt: string,
    schema: z.ZodSchema<T>,
    fallbackData: T,
    options: AiGatewayOptions
  ): Promise<AiGatewayResult<T>> {
    const startTime = Date.now();
    const requestId = options.requestId || `ai-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const apiKey = process.env.GEMMA_API_KEY;
    const model = (process.env.GEMMA_MODEL as GemmaModel) || this.defaultModel;
    const timeoutMs = options.timeoutMs || 10000;

    // If no API key configured, use deterministic rule-based fallback immediately
    if (!apiKey) {
      const latencyMs = Date.now() - startTime;
      await this.logRequest(options.taskName, model, prompt, JSON.stringify(fallbackData), latencyMs, 'RULES_FALLBACK');
      return {
        success: true,
        data: fallbackData,
        model: `${model} (offline-rules-fallback)`,
        source: 'rules_fallback',
        latencyMs,
        requestId,
      };
    }

    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);

      // Support either custom Gemma endpoint (Ollama/vLLM) or Google AI API
      const baseUrl = process.env.GEMMA_BASE_URL || 'https://generativelanguage.googleapis.com/v1beta';
      const endpoint = process.env.GEMMA_BASE_URL
        ? `${baseUrl}/chat/completions`
        : `${baseUrl}/models/${model}:generateContent?key=${apiKey}`;

      const requestBody = process.env.GEMMA_BASE_URL
        ? {
            model,
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.2,
            max_tokens: options.maxTokens || 500,
          }
        : {
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.2,
              maxOutputTokens: options.maxTokens || 500,
              responseMimeType: 'application/json',
            },
          };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(process.env.GEMMA_BASE_URL ? { Authorization: `Bearer ${apiKey}` } : {}),
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });

      clearTimeout(timer);

      if (!response.ok) {
        throw new Error(`Gemma 4 upstream error: ${response.status} ${response.statusText}`);
      }

      const json = await response.json();
      let rawText = '';
      if (process.env.GEMMA_BASE_URL) {
        rawText = json.choices?.[0]?.message?.content || '';
      } else {
        rawText = json.candidates?.[0]?.content?.parts?.[0]?.text || '';
      }

      // Clean any accidental markdown code fences
      const cleaned = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      const validated = schema.parse(parsed);

      const latencyMs = Date.now() - startTime;
      await this.logRequest(options.taskName, model, prompt, JSON.stringify(validated), latencyMs, 'SUCCESS');

      return {
        success: true,
        data: validated,
        model,
        source: 'gemma4',
        latencyMs,
        requestId,
      };
    } catch (err: unknown) {
      const latencyMs = Date.now() - startTime;
      const errorMsg = err instanceof Error ? err.message : String(err);
      await this.logRequest(options.taskName, model, prompt, JSON.stringify({ error: errorMsg, fallback: fallbackData }), latencyMs, 'FALLBACK_ON_ERROR');

      return {
        success: true,
        data: fallbackData,
        model: `${model} (fallback)`,
        source: 'rules_fallback',
        latencyMs,
        requestId,
      };
    }
  }

  private static async logRequest(
    taskName: string,
    model: string,
    prompt: string,
    response: string,
    latencyMs: number,
    status: string
  ) {
    try {
      await prisma.aiRequest.create({
        data: {
          taskName,
          model,
          prompt: prompt.slice(0, 1000), // sanitize & truncate
          response: response.slice(0, 2000),
          latencyMs,
          status,
        },
      });
    } catch {
      // Don't fail the request if logging fails
    }
  }
}
