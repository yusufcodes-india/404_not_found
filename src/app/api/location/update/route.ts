import { NextResponse } from 'next/server';
import { flags } from '@/lib/flags';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { bookingId, lat, lng } = body;

    if (!bookingId || !lat || !lng) {
      return NextResponse.json({ error: 'Booking ID, lat and lng are required' }, { status: 400 });
    }

    if (flags.demoMode) {
      console.log(`Demo Location Update: Booking ${bookingId} at ${lat}, ${lng}`);
      return NextResponse.json({ success: true });
    }

    // Real implementation:
    // 1. Verify that the user updating is the renter of the booking
    // 2. Verify that the booking is currently 'paid' or 'active'
    // 3. Verify that we are within the booking window
    // 4. Insert/Update in 'live_locations' table in Supabase

    return NextResponse.json({ error: 'Location service not configured' }, { status: 501 });
  } catch (err) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
