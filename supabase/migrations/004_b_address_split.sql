-- Adjusting chargers table and adding addresses table for better RLS
ALTER TABLE chargers DROP COLUMN exact_address;

CREATE TABLE charger_addresses (
  charger_id UUID PRIMARY KEY REFERENCES chargers(id) ON DELETE CASCADE,
  address TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Move any data if existed (none yet)
