import { NextResponse } from "next/server";

export async function GET() {
  const demoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true";
  return NextResponse.json({
    data: {
      status: "ok",
      mode: demoMode ? "demo" : "configured",
      integrations: {
        supabase: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
        razorpayTest: Boolean(process.env.RAZORPAY_KEY_ID?.startsWith("rzp_test_") && process.env.RAZORPAY_KEY_SECRET),
        aiProvider: process.env.AI_PROVIDER || "rules"
      }
    }
  }, { headers: { "x-request-id": crypto.randomUUID(), "cache-control": "no-store" } });
}