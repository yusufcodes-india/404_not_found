import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { okResponse, errorResponse } from '@/lib/api/response';
import { getSessionUser } from '@/lib/auth/session';
import { PaymentAdapter } from '@/lib/adapters/payment';

const VerifyPaymentSchema = z.object({
  orderId: z.string(),
  paymentId: z.string(),
  signature: z.string(),
});

export async function POST(req: NextRequest) {
  const user = await getSessionUser(req);
  if (!user) return errorResponse('Unauthenticated', 'UNAUTHORIZED', 401);

  try {
    const body = await req.json();
    const { orderId, paymentId, signature } = VerifyPaymentSchema.parse(body);

    const payment = await prisma.payment.findUnique({
      where: { orderId },
      include: { booking: true },
    });

    if (!payment) return errorResponse('Order not found', 'NOT_FOUND', 404);

    // Verify cryptographic signature
    const isValid = PaymentAdapter.verifySignature(orderId, paymentId, signature);
    if (!isValid) {
      return errorResponse('Invalid payment signature', 'INVALID_SIGNATURE', 400);
    }

    // Single atomic transaction to transition payment & booking to PAID
    const result = await prisma.$transaction(async (tx) => {
      const p = await tx.payment.update({
        where: { id: payment.id },
        data: {
          paymentId,
          signature,
          status: 'PAID',
        },
      });

      const b = await tx.booking.update({
        where: { id: payment.bookingId },
        data: {
          status: 'PAID',
          paymentStatus: 'PAID',
          paidAmountPaise: payment.amountPaise,
        },
      });

      // Notify host and driver
      await tx.notification.create({
        data: {
          userId: b.hostId,
          type: 'PAYMENT_CONFIRMED',
          title: 'Booking Payment Received',
          body: `Payment of ₹${payment.amountPaise / 100} confirmed for booking. Gate pass issued to driver.`,
        },
      });

      await tx.auditEvent.create({
        data: {
          actorId: user.id,
          action: 'PAYMENT_CAPTURED',
          entity: 'Booking',
          entityId: b.id,
          outcome: 'SUCCESS',
          metadata: JSON.stringify({ amountPaise: payment.amountPaise, orderId, paymentId }),
        },
      });

      return { payment: p, booking: b };
    });

    return okResponse({
      verified: true,
      bookingId: result.booking.id,
      status: result.booking.status,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Payment verification failed';
    return errorResponse(msg, 'VERIFY_ERROR', 400);
  }
}
