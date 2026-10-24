# KILARI — ANTIGRAVITY MASTER BUILD INSTRUCTIONS

You are the implementation agent. Take the existing Kilari frontend in this repository and turn it into a production-ready full-stack application without changing the visual identity or user-facing flow unless required to make a flow functional.

## NON-NEGOTIABLE AI RULE
Every feature that uses AI MUST use Gemma 4 and no other generative AI model.

Default model:
- `gemma-4-31b-it`

Alternative only if the deployment cannot support 31B:
- `gemma-4-26b-a4b-it`

The model must be selected through `GEMMA_MODEL` and routed through one server-side AI service. Do not call an AI provider directly from the browser. Do not silently substitute Gemini, OpenAI, Claude, Llama, or any other model.

Create:
- `lib/ai/gemma.ts` — single Gemma 4 gateway
- `lib/ai/prompts.ts` — versioned prompts
- `lib/ai/types.ts` — typed AI contracts
- `app/api/ai/chat/route.ts`
- `app/api/ai/recommend/route.ts`
- `app/api/ai/insights/route.ts`
- `app/api/ai/moderate/route.ts`
- `app/api/ai/risk/route.ts`

All AI calls must pass through the gateway. Log model, latency, request id, token usage if available, and error state — never secrets or sensitive raw documents.

## FIRST TASK
Audit the existing `public/kilari.html` before rewriting anything. Preserve the current design, copy, colors, layout, navigation, driver/host/admin modes, KYC UX, booking UX, charger listings and existing interaction intent. Replace demo/simulated behavior with real backend calls progressively.

## TARGET ARCHITECTURE

Browser / Next.js UI
        |
        v
Next.js Server API / BFF
        |
        +--> Authentication + RBAC
        +--> PostgreSQL via Prisma
        +--> Redis/cache + rate limits
        +--> Payment adapter
        +--> KYC/DigiLocker adapter
        +--> Maps/places adapter
        +--> Charger telemetry adapter
        +--> Notification adapter
        +--> Gemma 4 AI gateway

Never expose provider API keys in client-side JavaScript.

## STACK
- Next.js App Router + TypeScript
- PostgreSQL
- Prisma ORM
- Redis-compatible cache/rate limiting
- Zod validation
- Server-side sessions/authentication with secure HTTP-only cookies
- Google Gen AI SDK for Gemma 4 where supported by the selected deployment
- Object storage for non-sensitive uploaded assets if needed
- Provider adapters so external vendors can be swapped without changing business logic

## CORE BACKEND MODULES

1. Auth & accounts
   - registration/login
   - OTP verification
   - session management
   - logout
   - account deletion
   - roles: DRIVER, HOST, ADMIN
   - server-side authorization on every protected route

2. Profiles / KYC
   - driver profile
   - vehicle profile
   - KYC status state machine
   - DigiLocker adapter interface
   - consent records
   - never store Aadhaar/OTP or full licence document unless legally required and explicitly configured
   - store only minimum verification result and provider reference

3. Chargers
   - charger CRUD
   - connector/power/current type
   - approximate public location
   - exact private address
   - availability windows
   - price per kWh
   - charger status
   - health/telemetry records

4. Search / discovery
   - charger search
   - filters
   - deterministic ranking first
   - Gemma 4 may explain/recommend, but MUST NOT override compatibility, permission, safety, price or booking rules

5. Booking engine
   State machine:
   REQUESTED -> APPROVED -> PAYMENT_PENDING -> PAID -> ACTIVE -> COMPLETED
   Alternate terminal states: DECLINED, CANCELLED, EXPIRED, DISPUTED

   Prevent double booking with database transactions and conflict checks.

6. Payments
   - create payment order only after host approval
   - verify webhook/signature server-side
   - idempotency keys
   - ledger records
   - never trust client payment status
   - keep payment provider behind an adapter

7. Sessions
   - booking-linked charging session
   - start/end timestamps
   - energy delivered
   - charger telemetry reference
   - amount calculation server-side

8. Chat
   - booking-scoped conversation
   - user messages stored with audit metadata
   - contact-sharing/moderation checked server-side
   - Gemma 4 moderation before delivery where AI moderation is enabled
   - never allow the model to authorize payments, bans or access permissions

9. AI intelligence
   Driver:
   - smart charger recommendations
   - route/convenience explanation
   - booking assistant

   Host:
   - demand forecast explanation
   - charger health explanation
   - anomaly summaries
   - reliability insights

   Admin:
   - incident summarization
   - evidence summarization
   - anomaly explanation

   AI output must be structured JSON and validated with Zod.

10. Notifications
   - in-app notifications
   - email/SMS/WhatsApp adapter interfaces
   - booking approval/payment/session/KYC events

11. Audit
   - immutable audit events for sensitive actions
   - actor id, action, entity, timestamp, request id, outcome

## AI SAFETY / CONTROL RULES

Gemma 4 is advisory, not authoritative.

The model MUST NOT:
- approve or decline bookings by itself
- move money
- verify identity by itself
- grant admin privileges
- determine legal compliance
- override charger compatibility
- override electrical/load safety rules
- ban/suspend an account automatically
- reveal private addresses or private user data

Use deterministic backend rules for all security, authorization, payments, booking conflicts, charger compatibility and safety decisions.

If Gemma is unavailable:
- the app must remain usable
- use deterministic/rule-based fallback for recommendations
- show a neutral “AI unavailable” state where an AI explanation is optional
- never fabricate an AI result

## GEMMA 4 SERVICE CONTRACT

Implement a provider interface such as:

`generateStructured<T>(input, schema, options) -> T`

Required options:
- task name
- user id / actor id when available
- request id
- temperature-like sampling controls MUST NOT be assumed; use only parameters supported by the actual Gemma 4 deployment
- timeout
- max output tokens

Use structured output / JSON schema where supported.

Recommended task names:
- `charger_recommendation`
- `booking_assistant`
- `chat_moderation`
- `demand_forecast_explanation`
- `charger_health_explanation`
- `anomaly_summary`
- `incident_summary`

Cache deterministic/repeatable insight requests when appropriate. Do not cache private user data across users.

## API CONTRACTS

Implement typed REST endpoints under `/api`:

AUTH
- POST `/api/auth/register`
- POST `/api/auth/login`
- POST `/api/auth/verify-otp`
- POST `/api/auth/logout`
- GET `/api/me`

PROFILE/KYC
- GET `/api/profile`
- PATCH `/api/profile`
- POST `/api/kyc/start`
- GET `/api/kyc/status`
- POST `/api/kyc/callback`

CHARGERS
- GET `/api/chargers`
- POST `/api/chargers`
- GET `/api/chargers/:id`
- PATCH `/api/chargers/:id`
- DELETE `/api/chargers/:id`
- GET `/api/chargers/:id/health`

BOOKINGS
- GET `/api/bookings`
- POST `/api/bookings`
- GET `/api/bookings/:id`
- POST `/api/bookings/:id/approve`
- POST `/api/bookings/:id/decline`
- POST `/api/bookings/:id/cancel`

PAYMENTS
- POST `/api/payments/create-order`
- POST `/api/payments/verify`
- POST `/api/payments/webhook`

SESSIONS
- POST `/api/sessions/start`
- POST `/api/sessions/:id/telemetry`
- POST `/api/sessions/:id/complete`
- GET `/api/sessions`

CHAT
- GET `/api/bookings/:id/messages`
- POST `/api/bookings/:id/messages`

AI
- POST `/api/ai/chat`
- POST `/api/ai/recommend`
- POST `/api/ai/insights`
- POST `/api/ai/moderate`
- POST `/api/ai/risk`

ADMIN
- GET `/api/admin/incidents`
- POST `/api/admin/incidents/:id/review`
- GET `/api/admin/audit`

HEALTH
- GET `/api/health`

## DATABASE
Use Prisma migrations. Create tables/models for:
- User
- Session
- Profile
- Vehicle
- KycVerification
- KycConsent
- Charger
- ChargerAvailability
- ChargerTelemetry
- ChargerHealthEvent
- Booking
- Payment
- ChargingSession
- ChatThread
- ChatMessage
- AiRequest
- AiInsight
- Notification
- Incident
- AuditEvent
- IdempotencyKey

Important indexes:
- User.email/phone
- Charger ownerId/status
- Charger latitude/longitude or PostGIS if selected
- Booking chargerId + start/end
- Booking driverId + createdAt
- ChargingSession bookingId
- ChatMessage threadId + createdAt
- AuditEvent actorId + createdAt
- AiRequest requestId + createdAt

Use transactions for booking approval, payment transitions and session completion.

## LOCATION / PRIVACY
- Public map/search uses approximate charger coordinates.
- Exact host address is server-side/private until business rules allow disclosure.
- Never send exact address to AI unless strictly necessary.
- Never put exact addresses into logs.
- Validate all location inputs.

## PERFORMANCE
- Server-side data fetching for initial dashboard data.
- Parallelize independent backend queries.
- Cache charger search and non-sensitive aggregates.
- Paginate chargers, bookings, messages and audit logs.
- Debounce search.
- Use optimistic UI only for reversible actions.
- Never optimistically mark payment, KYC or booking approval as successful.
- Add request IDs and structured logs.
- Add rate limits to auth, AI, chat and payment endpoints.
- Add timeouts to every external provider call.
- Use retries only for safe/idempotent operations.

## FRONTEND MIGRATION
The existing `public/kilari.html` is currently embedded by an iframe. Do not break the design during migration.

Preferred implementation sequence:
1. Keep the current UI working.
2. Add the backend/API layer.
3. Replace simulated data with API data behind a typed client.
4. Replace demo AI with Gemma 4 API calls.
5. Replace demo auth/OTP/payment/KYC with provider adapters.
6. Move the HTML UI into React components only after the functional backend is stable.

If converting the UI to React, preserve the existing visual design exactly unless improving accessibility/responsiveness.

## ENVIRONMENT
Create `.env.example` with:

DATABASE_URL=
DIRECT_URL=
REDIS_URL=
GEMMA_API_KEY=
GEMMA_MODEL=gemma-4-31b-it
GEMMA_BASE_URL=
AUTH_SECRET=
APP_URL=http://localhost:3000

# Optional provider adapters
PAYMENT_PROVIDER=
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=
OTP_PROVIDER=
OTP_API_KEY=
DIGILOCKER_CLIENT_ID=
DIGILOCKER_CLIENT_SECRET=
DIGILOCKER_REDIRECT_URI=
MAPS_PROVIDER=
MAPS_API_KEY=
EMAIL_PROVIDER=
EMAIL_API_KEY=

Do not commit `.env` or real secrets.

## TESTING
Add:
- unit tests for state machines and business rules
- API integration tests
- booking conflict test
- payment idempotency test
- authorization/RBAC tests
- AI schema validation tests
- AI unavailable fallback test
- chat moderation test
- KYC callback validation test
- webhook signature test
- Playwright smoke tests for driver, host and admin journeys

Required smoke journeys:
1. Driver logs in -> sees chargers -> opens charger -> requests booking -> sees pending.
2. Host logs in -> sees request -> approves -> payment becomes available.
3. Driver pays -> booking becomes PAID.
4. Session starts -> telemetry -> completes.
5. Driver opens assistant -> Gemma 4 response uses booking context.
6. Host opens AI insights -> Gemma 4 insight appears.
7. Admin reviews incident -> action is audited.

## ERROR HANDLING
Return consistent JSON:

`{ ok: false, error: { code, message, requestId } }`

Success:

`{ ok: true, data, requestId }`

Never expose stack traces in production.

## SECURITY CHECKLIST
- server-side RBAC
- CSRF protection where applicable
- secure cookies
- input validation with Zod
- SQL injection protection through Prisma
- output escaping
- rate limits
- webhook verification
- idempotency
- secret management
- audit trail
- least-privilege provider credentials
- no API keys in client bundle
- no sensitive data in AI prompts unless required
- no sensitive data in logs

## DONE MEANS DONE
Do not stop at a plan. Implement the backend, wire the frontend to it, add migrations, add `.env.example`, add tests, run the build and tests, fix errors, and leave clear setup instructions.

Do not claim a provider is live unless its credentials/configuration are actually present. Provider adapters may expose a clearly labeled development mock only when an environment flag enables it.

Before finishing:
1. `npm install`
2. run Prisma generation/migrations as appropriate
3. run lint/typecheck
4. run tests
5. run `npm run build`
6. verify the main pages and API health endpoint
7. provide a concise `SETUP.md` describing required keys and provider setup
