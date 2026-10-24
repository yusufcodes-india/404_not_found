# Kilari backend workflow

## Request flow
Browser -> Next.js route handler -> auth/RBAC -> Zod validation -> service layer -> database/provider adapter -> audit event -> typed response.

## AI flow
Browser -> `/api/ai/*` -> auth/RBAC -> minimize/redact context -> Gemma 4 gateway -> structured output validation -> deterministic post-checks -> store insight metadata -> response.

AI is advisory only. Booking, payment, KYC, authorization, charger compatibility and safety remain deterministic backend rules.

## Booking flow
REQUESTED -> host review -> APPROVED -> payment order -> verified webhook -> PAID -> session STARTED -> telemetry -> COMPLETED.

Use a database transaction for every state transition and idempotency keys for external callbacks.

## KYC flow
Driver consent -> `/api/kyc/start` -> provider adapter -> provider callback -> server validation -> minimal verification result -> audit event -> profile status update.

Never fake successful KYC in production.

## Payment flow
Host approval -> server creates order -> client completes provider checkout -> provider webhook -> signature verification -> idempotent ledger update -> booking PAID.

Never trust the browser's payment result as proof of payment.

## Chat flow
User message -> booking authorization -> server-side moderation -> Gemma 4 moderation when enabled -> persist -> deliver. Contact sharing rules are enforced server-side.

## AI insight flow
Telemetry/session history -> deterministic feature aggregation -> Gemma 4 explanation/recommendation -> schema validation -> UI. The model must not calculate or override safety-critical limits.
