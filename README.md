# Kilari — Next.js prototype with DigiLocker KYC UX

This Next.js project preserves the supplied Kilari prototype inside a full-screen iframe so its existing design, navigation, workflows, and demo interactions remain intact.

## Run locally

1. Install Node.js LTS.
2. Extract this ZIP and open a terminal in the `kilari-next` folder.
3. Run `npm install`.
4. Run `npm run dev`.
5. Open http://localhost:3000.

## What changed

- Added a Driving Licence KYC information card on the shared login screen.
- Added a DigiLocker verification journey in the driver profile/onboarding area with clear steps and a status area.
- Added a responsive explanation modal describing consent, the official DigiLocker flow, and privacy expectations.
- Kept the shared login and the existing “Rent a charger” / “Lend the charger” workspace choice.
- Added clear prototype messaging so customers are not told that a licence was genuinely verified when no verification service is connected.

## Important: live DigiLocker connection is not enabled

The included DigiLocker UI is a front-end prototype only. It does not redirect to DigiLocker, retrieve documents, or verify a driving licence. A production integration requires approved DigiLocker access, backend-managed authorization/state and callback handling, server-side validation, consent handling, and secure storage of only the necessary verification result. Do not collect Aadhaar numbers, licence numbers, or OTPs in this demo UI.

The existing OTP, payments, maps, AI, and sample records also remain demo/simulated where indicated. This project is a Next.js shell around the original HTML prototype, not a complete React rewrite.
