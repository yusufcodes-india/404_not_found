import { NextResponse } from 'next/server';
import { flags } from '@/lib/flags';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const origin = searchParams.get('origin');
  const destination = searchParams.get('destination');

  if (!origin || !destination) {
    return NextResponse.json({ error: 'Origin and destination are required' }, { status: 400 });
  }

  if (flags.demoMode || !flags.hasMapsKey) {
    // Mock distance and duration based on coords or names
    // In a real app, we would call Google Distance Matrix API
    const distance = Math.floor(Math.random() * 15) + 1; // 1-15 km
    const duration = Math.floor(Math.random() * 30) + 10; // 10-40 mins

    return NextResponse.json({
      distance: `${distance} km`,
      duration: `${duration} mins`,
      easeOfTravelScore: Math.floor(100 - (distance * 2 + duration * 0.5)),
      isDemo: true,
    });
  }

  try {
    // Real implementation:
    // const res = await fetch(`https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin}&destinations=${destination}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY}`);
    // const data = await res.json();
    // ... parse data ...
    return NextResponse.json({ error: 'Real API not implemented yet' }, { status: 501 });
  } catch (err) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
