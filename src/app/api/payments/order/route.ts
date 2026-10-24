import { NextResponse } from 'next/server';
import { flags } from '@/lib/flags';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { bookingId, amountPaise } = body;

    if (!bookingId || !amountPaise) {
      return NextResponse.json({ error: 'Booking ID and amount are required' }, { status: 400 });
    }

    if (flags.demoMode || !flags.hasRazorpayKeys) {
      // Mock Razorpay Order
      return NextResponse.json({
        id: `razorpay_order_mock_${Date.now()}`,
        currency: 'INR',
        amount: amountPaise,
        receipt: `rcpt_${bookingId}`,
        isDemo: true,
      });
    }

    // Real implementation:
    // const razorpay = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
    // const order = await razorpay.orders.create({ amount: amountPaise, currency: 'INR', receipt: bookingId });
    // return NextResponse.json(order);

    return NextResponse.json({ error: 'Razorpay not configured' }, { status: 501 });
  } catch (err) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
