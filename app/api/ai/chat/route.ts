import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { okResponse, errorResponse } from '@/lib/api/response';
import { getSessionUser } from '@/lib/auth/session';
import { GemmaGateway } from '@/lib/ai/gemma';
import { PROMPTS } from '@/lib/ai/prompts';
import { ChatAssistantSchema, ChatAssistantOutput } from '@/lib/ai/types';

const AiChatSchema = z.object({
  bookingId: z.string().optional(),
  chargerId: z.string().optional(),
  message: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const user = await getSessionUser(req);
  if (!user) return errorResponse('Unauthenticated', 'UNAUTHORIZED', 401);

  try {
    const body = await req.json();
    const { bookingId, chargerId, message } = AiChatSchema.parse(body);

    let context = 'City: Pune. Rate: ₹14/kWh. Fixed platform price.';
    if (bookingId) {
      const b = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: { charger: true },
      });
      if (b) {
        context += `\nCharger: ${b.charger.title}. Speed: ${b.charger.powerKw} kW. Connector: ${b.charger.connectorType}. Area: ${b.charger.areaLabel}. Rules: ${b.charger.rules || 'Follow host parking guidelines'}. Parking: ${b.charger.parkingNotes || 'Designated guest parking'}. Window: ${b.windowStart.toLocaleTimeString()} to ${b.windowEnd.toLocaleTimeString()}. Status: ${b.status}. Note: Exact address unlocks only on confirmed gate pass.`;
      }
    } else if (chargerId) {
      const c = await prisma.charger.findUnique({ where: { id: chargerId } });
      if (c) {
        context += `\nCharger: ${c.title}. Speed: ${c.powerKw} kW. Connector: ${c.connectorType}. Area: ${c.areaLabel}. Rules: ${c.rules || 'Standard rules'}. Parking: ${c.parkingNotes || 'Guest bay'}.`;
      }
    }

    // Fallback answers for deterministic rules mode
    let fallbackAnswer = 'I can help with questions about parking, charging speed, timing, or access instructions. Please arrive within your booked window.';
    const qLower = message.toLowerCase();
    if (qLower.includes('park')) {
      fallbackAnswer = 'Please use the marked guest parking bay shown on your paid gate pass.';
    } else if (qLower.includes('speed') || qLower.includes('kw') || qLower.includes('fast')) {
      fallbackAnswer = 'This listing provides up to 11 kW AC charging speed. Actual speed depends on your vehicle onboard charger and battery state.';
    } else if (qLower.includes('address') || qLower.includes('location') || qLower.includes('where')) {
      fallbackAnswer = 'For safety and privacy, the exact address and security gate details unlock in your authenticated gate pass once the booking is approved and paid.';
    } else if (qLower.includes('food') || qLower.includes('coffee') || qLower.includes('restaurant')) {
      fallbackAnswer = 'Cafes and refreshments such as Third Wave Coffee and Green Bowl Kitchen are available within walking distance in the Baner area.';
    }

    const fallback: ChatAssistantOutput = {
      answer: fallbackAnswer,
      needsHuman: false,
    };

    const prompt = PROMPTS.CHAT_ASSISTANT(context, message);
    const result = await GemmaGateway.generateStructured(
      prompt,
      ChatAssistantSchema,
      fallback,
      {
        taskName: 'booking_assistant',
        userId: user.id,
      }
    );

    // Save assistant reply into thread if bookingId was provided
    if (bookingId) {
      const thread = await prisma.chatThread.findUnique({ where: { bookingId } });
      if (thread) {
        await prisma.chatMessage.create({
          data: {
            threadId: thread.id,
            senderRole: 'ASSISTANT',
            isAi: true,
            content: result.data.answer,
          },
        });
      }
    }

    return okResponse({
      ...result.data,
      source: result.source,
      model: result.model,
      requestId: result.requestId,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'AI chat error';
    return errorResponse(msg, 'AI_ERROR', 400);
  }
}
