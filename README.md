# Kilari — community EV charging marketplace

This repository is a **starter implementation**, not a production-ready marketplace. It includes a responsive dashboard foundation, fixed-price calculation utilities, a health endpoint and starter tests. It does not yet implement the complete booking, Supabase/RLS, Razorpay, KYC, meter, gate-pass, admin or AI-chat systems described in `KILARI_MASTER_BUILD.md`.

## Requirements
- Node.js 20.9+ (Node 22 LTS recommended)
- npm

## Run locally
1. Copy `.env.example` to `.env.local`.
2. Keep `NEXT_PUBLIC_DEMO_MODE=true` for the local demo.
3. Install dependencies: `npm install`
4. Run checks: `npm run typecheck`, `npm run lint`, `npm test`
5. Start: `npm run dev`
6. Open `http://localhost:3000`; health endpoint: `http://localhost:3000/api/health`

## Important safety notes
- Demo charger data is static and no booking or payment is performed.
- Do not add real secrets to client code or commit `.env.local`.
- Never deploy until server-side authorization, Supabase RLS/migrations, payment verification, webhook idempotency, privacy checks and tests are implemented.
- `NEXT_PUBLIC_*` values are exposed to the browser. Only use them for public configuration.
- The frontend currently uses demo copy and illustrative charger scores; these are not live availability or navigation data.

## Build plan
Use `KILARI_MASTER_BUILD.md` as the source of truth and implement one phase at a time. The original starter repo and `public/kilari.html` prototype were not included with this generated starter, so exact 1:1 prototype parity has not been verified.