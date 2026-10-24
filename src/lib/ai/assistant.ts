import { flags } from '@/lib/flags';

export interface AssistantContext {
  bookingId: string;
  charger: {
    name: string;
    power: string;
    connector: string;
    rules: string;
    parking: string;
    price: string;
  };
  bookingWindow: string;
  nearbyPlaces: any[];
}

export interface AssistantResponse {
  text: string;
  source: 'ai' | 'rules';
  suggestedActions?: string[];
}

export async function getAssistantResponse(prompt: string, context: AssistantContext): Promise<AssistantResponse> {
  // 1. Moderation check first (handled in chat UI, but repeated here for safety)
  // ... moderation logic ...

  // 2. Rule-based fallback / Intent matching
  const lowerPrompt = prompt.toLowerCase();

  if (lowerPrompt.includes('park') || lowerPrompt.includes('parking')) {
    return {
      text: `Parking for this charger is: ${context.charger.parking}. Please ensure you don't block the driveway.`,
      source: 'rules',
    };
  }

  if (lowerPrompt.includes('speed') || lowerPrompt.includes('power') || lowerPrompt.includes('fast')) {
    return {
      text: `This charger provides ${context.charger.power} power with a ${context.charger.connector} connector.`,
      source: 'rules',
    };
  }

  if (lowerPrompt.includes('time') || lowerPrompt.includes('when')) {
    return {
      text: `Your booking is scheduled for ${context.bookingWindow}.`,
      source: 'rules',
    };
  }

  if (lowerPrompt.includes('eat') || lowerPrompt.includes('food') || lowerPrompt.includes('cafe')) {
    const places = context.nearbyPlaces.map(p => p.name).join(', ');
    return {
      text: `While you charge, you might like: ${places}. All are within walking distance.`,
      source: 'rules',
    };
  }

  // 3. AI Provider (Anthropic/LLM)
  if (flags.aiProvider === 'anthropic') {
    try {
      // Simulation of LLM call with strict system prompt
      // System Prompt: "You are the Kilari Assistant. Use ONLY the provided context.
      // Never reveal private phone numbers or exact addresses. If you don't know, escalate to host."

      return {
        text: `I'm not entirely sure about that. I've notified your host, and they'll get back to you soon!`,
        source: 'ai',
      };
    } catch (err) {
      return { text: "I'm having trouble connecting. Please wait or ask the host.", source: 'rules' };
    }
  }

  return {
    text: "I've asked the host to reply to this. They'll be with you shortly!",
    source: 'rules',
  };
}
