import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { okResponse, errorResponse } from '@/lib/api/response';
import { getSessionUser } from '@/lib/auth/session';

const SendMessageSchema = z.object({
  content: z.string().min(1).max(2000),
});

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const user = await getSessionUser(req);
  if (!user) return errorResponse('Unauthenticated', 'UNAUTHORIZED', 401);

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      chatThread: {
        include: {
          messages: {
            orderBy: { createdAt: 'asc' },
            include: {
              sender: {
                select: {
                  profile: { select: { fullName: true } },
                  role: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!booking) return errorResponse('Booking not found', 'NOT_FOUND', 404);
  if (booking.driverId !== user.id && booking.hostId !== user.id && user.role !== 'ADMIN') {
    return errorResponse('Forbidden', 'FORBIDDEN', 403);
  }

  return okResponse(booking.chatThread?.messages || []);
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const user = await getSessionUser(req);
  if (!user) return errorResponse('Unauthenticated', 'UNAUTHORIZED', 401);

  try {
    const body = await req.json();
    const { content } = SendMessageSchema.parse(body);

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { chatThread: true },
    });

    if (!booking) return errorResponse('Booking not found', 'NOT_FOUND', 404);
    if (booking.driverId !== user.id && booking.hostId !== user.id && user.role !== 'ADMIN') {
      return errorResponse('Forbidden', 'FORBIDDEN', 403);
    }

    // Server-side moderation: Reject phone numbers, emails, and external links
    const phoneRegex = /(?:\+?91|0)?[6-9]\d{9}|\b\d{7,}\b/;
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
    const urlRegex = /https?:\/\/[^\s]+|www\.[^\s]+/i;

    if (phoneRegex.test(content) || emailRegex.test(content) || urlRegex.test(content)) {
      // Log incident for contact sharing violation
      await prisma.incident.create({
        data: {
          bookingId: booking.id,
          reporterId: user.id,
          type: 'CONTACT_LEAK',
          description: `Disallowed contact sharing attempt blocked in chat: "${content.slice(0, 100)}"`,
          status: 'OPEN',
        },
      });

      return errorResponse(
        'For your security and community trust, sharing phone numbers, email addresses, or external links in chat is not allowed. Please keep all coordination within Kilari.',
        'CONTACT_SHARING_BLOCKED',
        400
      );
    }

    let threadId = booking.chatThread?.id;
    if (!threadId) {
      const newThread = await prisma.chatThread.create({
        data: { bookingId: booking.id },
      });
      threadId = newThread.id;
    }

    const message = await prisma.chatMessage.create({
      data: {
        threadId,
        senderId: user.id,
        senderRole: user.id === booking.driverId ? 'DRIVER' : 'HOST',
        content,
        isAi: false,
      },
    });

    return okResponse({ message }, undefined, 201);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to send message';
    return errorResponse(msg, 'CHAT_ERROR', 400);
  }
}
