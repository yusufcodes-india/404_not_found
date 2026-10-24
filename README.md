# ⚡ Kilari — EV Community Charging Marketplace

Kilari is a community EV charging platform that connects EV drivers with private charger hosts in residential societies, apartments, and commercial hubs.

---

## 🌟 Key Features

1. **⚡ Live Interactive Map (Geoapify & Leaflet)**:
   - High-resolution OpenStreetMap Bright raster tiles with automatic Retina (`@2x`) support.
   - Real-time custom EV lightning bolt pins with power output, connector type, and fixed rate details.
   - Interactive popups with direct *"Select Charger"* booking trigger.

2. **🤖 Gemma 4 AI Assistant (`gemma-4-26b-a4b-it`)**:
   - Integrated with Google's Gemma 4 26B instruct model via Google AI Studio API.
   - Provides charging recommendations, trip planning, safety guidance, and connector compatibility advice.
   - Intelligent thought/reasoning part extraction with strict JSON parsing.

3. **💳 Test Payments (Razorpay)**:
   - Live Razorpay order creation via REST API.
   - Automatic order generation with HMAC-SHA256 signature verification.
   - Fixed rate policy: ₹14/kWh (1400 paise) across all calculations.

4. **📱 Real Phone OTP Authentication (Twilio)**:
   - Phone verification via Twilio SMS REST API.
   - Server-side in-memory OTP cache with dev fallback (`123456`) for local testing.

5. **🎫 Secure Gate Pass with Signed QR Code**:
   - HS256 JWT tokens unlock private host addresses only upon confirmed booking.
   - Generates human-readable pass codes (`KIL-XXXX-XXXX`) and dynamic QR code data URLs.

6. **📱 Universal Mobile Responsiveness**:
   - Pixel-perfect rendering across iPhone SE (16:9), iPhone 12–16 (19.5:9), Pixel/Galaxy (20:9), and desktop screens.
   - Prevents iOS auto-zoom stretching (`font-size: 16px` inputs) and eliminates horizontal overflow.
   - Safe-area insets (`env(safe-area-inset-bottom)`) for modern notch and dynamic island devices.

7. **🗄️ Fullstack SQLite & Prisma Schema**:
   - 14 relational models seeded with Pune EV chargers (Green Hive, Skyline Residency, Balewadi Business Hub), vehicles, users, and sessions.

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 18+ LTS
- npm or pnpm

### 2. Installation
```bash
git clone https://github.com/yusufcodes-india/404_not_found.git
cd 404_not_found
npm install
```

### 3. Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Configure your API keys in `.env`:
```env
DATABASE_URL="file:./dev.db"
GEMMA_API_KEY="your-gemini-api-key"
GEMMA_MODEL="gemma-4-26b-a4b-it"

RAZORPAY_KEY_ID="rzp_test_..."
RAZORPAY_KEY_SECRET="..."

TWILIO_ACCOUNT_SID="AC..."
TWILIO_API_KEY_SID="SK..."
TWILIO_API_KEY_SECRET="..."

MAPS_PROVIDER="geoapify"
GEOAPIFY_API_KEY="a3b6cbc4ec4248a49338566cc87eaa60"
```

### 4. Database Setup
```bash
npx prisma generate
npx prisma migrate dev
```

### 5. Run Dev Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing

Run unit & integration tests:
```bash
npm run test
```

Run TypeScript verification:
```bash
npm run typecheck
```
