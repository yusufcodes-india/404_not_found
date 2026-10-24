import { NextResponse } from 'next/server';
import { flags } from '@/lib/flags';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderId, paymentId, signature, bookingId } = body;

    if (!orderId || !paymentId || !signature || !bookingId) {
      return NextResponse.json({ error: 'Missing payment details' }, { status: 400 });
    }

    if (flags.demoMode || !flags.hasRazorpayKeys) {
      // Demo mode: automatically verify
      console.log(`Demo Payment Verified: Booking ${bookingId}`);

      // In a real app, here we would:
      // 1. Verify signature using crypto.createHmac
      // 2. Update booking status to 'paid' in Supabase
      // 3. Create a payment record in the 'payments' table

      return NextResponse.json({ success: true, message: 'Payment verified in demo mode' });
    }

    // Real implementation:
    // const crypto = require('crypto');
    // const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    //   .update(orderId + "|" + paymentId)
    //   .digest('hex');
    // if (signature !== expectedSignature) return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });

    return NextResponse.json({ error: 'Razorpay not configured' }, { status: 501 });
  } catch (err) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
