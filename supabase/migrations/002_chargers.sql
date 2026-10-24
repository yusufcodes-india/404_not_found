-- Chargers and Availability
CREATE TYPE charger_type AS ENUM ('home', 'society', 'office', 'business', 'fleet');
CREATE TYPE charger_status AS ENUM ('draft', 'review', 'active', 'paused');
CREATE TYPE slot_type AS ENUM ('overnight', 'daytime', 'both');

CREATE TABLE hosts (
  id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  bio TEXT,
  avg_rating NUMERIC DEFAULT 5.0,
  total_sessions INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE chargers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id UUID NOT NULL REFERENCES hosts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type charger_type NOT NULL,
  current TEXT NOT NULL, -- 'AC', 'DC'
  power_kw NUMERIC NOT NULL,
  connector TEXT NOT NULL,
  parking_details TEXT,
  cable_provided BOOLEAN DEFAULT false,
  rules TEXT,
  approx_lat NUMERIC NOT NULL,
  approx_lng NUMERIC NOT NULL,
  exact_address TEXT NOT NULL,
  price_per_kwh NUMERIC DEFAULT 14,
  status charger_status DEFAULT 'draft',
  society_load_limit_kw NUMERIC,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE availability_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  charger_id UUID NOT NULL REFERENCES chargers(id) ON DELETE CASCADE,
  slot_type slot_type NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  days_of_week INTEGER[] NOT NULL, -- [0-6]
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_chargers_status ON chargers(status);
CREATE INDEX idx_chargers_location ON chargers(approx_lat, approx_lng);
