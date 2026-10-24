import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { okResponse, errorResponse } from '@/lib/api/response';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const event = JSON.parse(rawBody || '{}');

    // Idempotency check: prevent duplicate event processing
    const eventId = event.id || req.headers.get('x-razorpay-event-id');
    if (eventId) {
      const exists = await prisma.idempotencyKey.findUnique({
        where: { key: `wh_${eventId}` },
      });
      if (exists) {
        return okResponse({ duplicate: true });
      }

      await prisma.idempotencyKey.create({
        data: {
          key: `wh_${eventId}`,
          result: 'PROCESSED',
        },
      });
    }

    if (event.event === 'payment.captured') {
      const paymentEntity = event.payload?.payment?.entity;
      const orderId = paymentEntity?.order_id;

      if (orderId) {
        const payment = await prisma.payment.findUnique({ where: { orderId } });
        if (payment && payment.status !== 'PAID') {
          await prisma.$transaction([
            prisma.payment.update({
              where: { id: payment.id },
              data: {
                status: 'PAID',
                paymentId: paymentEntity.id,
              },
            }),
            prisma.booking.update({
              where: { id: payment.bookingId },
              data: {
                status: 'PAID',
                paymentStatus: 'PAID',
                paidAmountPaise: payment.amountPaise,
              },
            }),
          ]);
        }
      }
    }

    return okResponse({ received: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Webhook error';
    return errorResponse(msg, 'WEBHOOK_ERROR', 400);
  }
}
