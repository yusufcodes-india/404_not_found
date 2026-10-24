import { describe, it, expect } from 'vitest';
import { GemmaGateway } from '@/lib/ai/gemma';
import { ChatAssistantSchema, ChatAssistantOutput } from '@/lib/ai/types';
import { PROMPTS } from '@/lib/ai/prompts';

describe('Gemma 4 AI Gateway', () => {
  it('falls back deterministically to rule-based output when API key is missing', async () => {
    const fallback: ChatAssistantOutput = {
      answer: 'Please use guest parking bay.',
      needsHuman: false,
    };

    const result = await GemmaGateway.generateStructured(
      PROMPTS.CHAT_ASSISTANT('Parking: Guest bay', 'Where should I park?'),
      ChatAssistantSchema,
      fallback,
      { taskName: 'test_assistant' }
    );

    expect(result.success).toBe(true);
    expect(result.source).toBe('rules_fallback');
    expect(result.data.answer).toBe('Please use guest parking bay.');
    expect(result.model).toContain('gemma-4');
  });

  it('contains strict safety constraints in system prompt', () => {
    expect(PROMPTS.SYSTEM_BASE).toContain('Gemma 4');
    expect(PROMPTS.SYSTEM_BASE).toContain('ADVISORY');
    expect(PROMPTS.SYSTEM_BASE).toContain('1400 paise');
    expect(PROMPTS.SYSTEM_BASE).toContain('NEVER output or invent private addresses');
  });
});
