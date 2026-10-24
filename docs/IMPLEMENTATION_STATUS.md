# Kilari Implementation Status

## 1. Implemented and Tested
- **Authentication**: Phone OTP login, Bearer token sessions, HTTP-only cookie support.
- **Twilio SMS Adapter**: `lib/adapters/otp.ts` with basic auth via API Key SID/Secret + Account SID, 6-digit numeric OTP generation, 10-minute expiry window, and dev demo fallback (`123456`).
- **Chargers & Discovery**: Public listings with approx coordinates (jittered 250m for host privacy). Exact physical address withheld until payment.
- **Smart Ranking**: Server-side multi-factor scoring (balanced, distance, price, route, host rating, health).
- **Bookings Engine**: Server-side pricing strictly fixed at ₹14/kWh (1400 paise) + 10% platform fee. Host approval workflow.
- **Razorpay Payments**: Live test order creation via Razorpay REST API, client-side checkout integration, HMAC SHA256 signature verification.
- **Gate Pass**: Cryptographically signed HS256 JWT, unique human-readable pass codes (`KIL-XXXX-XXXX`), dynamic QR code data URLs generated via `qrcode`.
- **Gemma 4 AI Gateway**: Powered by `gemma-4-26b-a4b-it` on Google Generative Language API, reasoning thought-block stripping, structured JSON schema validation via Zod, and deterministic offline rule fallback.
- **Chat Moderation**: Rejects phone numbers, email addresses, and URLs in coordination messages.

## 2. Implemented but not Fully Tested against Live External Services
- **Real Twilio SMS delivery to non-verified Indian mobile numbers**: Twilio account is currently in Trial status with no purchased sender phone number. Once a number is bought and added to `.env` as `TWILIO_FROM_NUMBER`, real SMS is dispatched. In the meantime, dev demo fallback code is returned seamlessly.
- **Google Maps JS API**: Key is configured (`NEXT_PUBLIC_GOOGLE_MAPS_KEY`), but billing must be enabled on the Google Cloud project to avoid `REQUEST_DENIED`. Integrated Leaflet + OpenStreetMap runs interactively without requiring billing.

## 3. Mocked
- **DigiLocker KYC**: Mock verification adapter returns verified status for testing.
- **Smart EV Meter Hardware**: Meter telemetry simulated in `/api/sessions/[id]/telemetry`.

## 4. Not Implemented / Out of Scope
- Automated bank payouts for hosts (manual bank transfers).
- Web Push / WhatsApp notifications.
- Real-time WebSockets (REST polling is used).
