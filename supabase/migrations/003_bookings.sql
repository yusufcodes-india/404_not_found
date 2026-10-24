-- Bookings, Payments, and Sessions
CREATE TYPE booking_status AS ENUM ('requested', 'approved', 'declined', 'paid', 'active', 'completed', 'cancelled', 'no_show', 'disputed');

CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  renter_id UUID NOT NULL REFERENCES profiles(id),
  charger_id UUID NOT NULL REFERENCES chargers(id),
  status booking_status DEFAULT 'requested',
  window_start TIMESTAMPTZ NOT NULL,
  window_end TIMESTAMPTZ NOT NULL,
  est_kwh NUMERIC,
  cancel_metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id),
  amount_paise INTEGER NOT NULL,
  status TEXT NOT NULL, -- 'created', 'captured', 'refunded'
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  signature TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE sessions_meter (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id),
  start_reading NUMERIC NOT NULL,
  end_reading NUMERIC,
  kwh_consumed NUMERIC,
  total_amount NUMERIC,
  platform_fee NUMERIC,
  host_earnings NUMERIC,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_charger ON bookings(charger_id);
CREATE INDEX idx_bookings_renter ON bookings(renter_id);
