# ⚡ Kilari — Community EV Charging Marketplace

**Turning idle community chargers into reliable local power.**

Kilari is an AI-powered, community-driven EV charging network designed for the unique challenges of Indian urban infrastructure. Instead of waiting for expensive public charging stations, Kilari allows homeowners and businesses to rent out their idle chargers to verified EV drivers.

## 🌟 Key Features

- **AI-Powered Trust (Kilari Score)**: A proprietary scoring engine that ranks chargers based on reliability, condition, owner reputation, and ease of travel.
- **Secure Access (Gate Pass)**: Signed, time-limited QR passes that ensure only paid renters enter a host's property.
- **Community Safety**: Integrated DigiLocker KYC verification and a server-side chat moderation engine that prevents off-platform transactions.
- **Intelligent Discovery**: Map-based search with AI-driven demand prediction to help renters find vacant slots.
- **Fair Pricing**: Transparent ₹14/kWh pricing with a small 10% platform fee to keep the community running.

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS.
- **Backend**: Supabase (Auth, Postgres, RLS, Realtime).
- **AI**: Custom scoring and anomaly detection engines.
- **Payments**: Razorpay (Test Mode).
- **Maps**: Google Maps JavaScript API.
- **PWA**: Installable manifest and service workers for a native mobile experience.

## 🚀 Quick Start

### 1. Environment Setup
Create a `.env.local` file in the root directory:
```bash
cp .env.example .env.local
```
*Note: The app runs in **Demo Mode** by default (`NEXT_PUBLIC_DEMO_MODE=true`), so it will work even without real API keys.*

### 2. Install & Run
```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📖 Demo Script (5 Minutes)
1. **The Renter**: Login $\to$ Onboard $\to$ Map $\to$ Book a "High Score" charger $\to$ Pay $\to$ Generate Gate Pass.
2. **The Host**: Switch to Lend Mode $\to$ List a Charger $\to$ Approve the booking request $\to$ Start/End a session.
3. **The Admin**: Visit `/admin` $\to$ Approve KYC $\to$ Moderate a chat violation.

## ⚠️ Honest Limitations & Roadmap
- **Payment Payouts**: Currently manual in MVP. Automated payouts are in the roadmap.
- **Live Hardware**: Uses a `MeterAdapter` mock. Integration with smart-socket hardware is next.
- **KYC**: uses a DigiLocker mock. Real government API approval is required for production.

**Built with ❤️ by Yusuf Tarwala (@yusufcodes-india)**
