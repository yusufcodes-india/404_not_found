import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { okResponse, errorResponse } from '@/lib/api/response';
import { getSessionUser } from '@/lib/auth/session';
import { PaymentAdapter } from '@/lib/adapters/payment';

const CreateOrderSchema = z.object({
  bookingId: z.string(),
});

export async function POST(req: NextRequest) {
  const user = await getSessionUser(req);
  if (!user) return errorResponse('Unauthenticated', 'UNAUTHORIZED', 401);

  try {
    const body = await req.json();
    const { bookingId } = CreateOrderSchema.parse(body);

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) return errorResponse('Booking not found', 'NOT_FOUND', 404);
    if (booking.driverId !== user.id && user.role !== 'ADMIN') {
      return errorResponse('Forbidden', 'FORBIDDEN', 403);
    }

    if (booking.status !== 'APPROVED' && process.env.ALLOW_DEV_MOCKS !== 'true') {
      return errorResponse('Payment order can only be created after host approval', 'NOT_APPROVED', 400);
    }

    // Amount is taken strictly from server-computed quotedAmountPaise
    const order = await PaymentAdapter.createOrder(booking.id, booking.quotedAmountPaise);

    await prisma.payment.create({
      data: {
        bookingId: booking.id,
        amountPaise: booking.quotedAmountPaise,
        currency: 'INR',
        provider: order.provider,
        orderId: order.orderId,
        status: 'CREATED',
      },
    });

    return okResponse(order);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to create payment order';
    return errorResponse(msg, 'PAYMENT_ERROR', 400);
  }
}
