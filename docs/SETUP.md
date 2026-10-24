# Kilari Full-Stack EV Charging Application — Setup Guide

## Quick Start (Local Run)

The application is pre-configured with a self-contained SQLite database and dev mocks so you can run it out of the box with zero external dependencies.

1. **Install dependencies** (already done):
   ```bash
   npm install
   ```
2. **Database setup & seed**:
   ```bash
   npx prisma db push
   npm run seed
   ```
3. **Run tests**:
   ```bash
   npm test
   ```
4. **Start the development server**:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Pre-seeded Demo Accounts

- **Driver**: Honey Kumar (`+91 98765 43210`), vehicle `MH 12 AB 1234` (Tata Nexon EV), KYC Verified.
- **Host**: Priya Sharma (`+91 98765 00001`), owner of Green Hive Society charger (Baner, Pune).
- **Admin**: Kilari Admin (`+91 99999 00001`).
- **OTP**: In demo mode, use `123456`.

---

## Environment Configuration (`.env`)

| Variable | Default / Format | Purpose |
|---|---|---|
| `DATABASE_URL` | `file:./dev.db` (or PostgreSQL URL) | Prisma database connection |
| `AUTH_SECRET` | 32+ character random string | Session tokens and gate pass signing |
| `APP_URL` | `http://localhost:3000` | Application base URL |
| `GEMMA_API_KEY` | *(Optional)* Google AI API key | Powers Gemma 4 generative AI features |
| `GEMMA_MODEL` | `gemma-4-31b-it` (or `gemma-4-26b-a4b-it`) | Mandatory model |
| `GEMMA_BASE_URL` | *(Optional)* Custom endpoint | Self-hosted Gemma (Ollama/vLLM) endpoint |
| `ALLOW_DEV_MOCKS` | `true` | Allows dev OTP and mock payments |
| `PAYMENT_PROVIDER` | `mock` / `razorpay` | Razorpay payment gateway integration |
| `RAZORPAY_KEY_ID` | `rzp_test_...` | Razorpay Test Key ID |
| `RAZORPAY_KEY_SECRET` | Secret key | Razorpay Key Secret |
| `KYC_PROVIDER` | `mock` / `digilocker` | Driving Licence KYC provider |

---

## Gemma 4 AI Gateway Behavior

Kilari follows strict safety guidelines for generative AI:
- **Offline / No API Key**: When `GEMMA_API_KEY` is empty, the app automatically and deterministically falls back to safe rule-based assistant answers and recommendations with `source: "rules_fallback"`.
- **Online**: When `GEMMA_API_KEY` is provided, requests are structured and validated against strict Zod schemas via `lib/ai/gemma.ts`.
- **Safety**: Gemma 4 is strictly advisory. It cannot move money, approve bookings, or disclose private addresses. Server-side rules always override model outputs.
