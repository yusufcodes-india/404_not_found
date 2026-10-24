-- Core Auth and Profiles
CREATE TYPE user_role AS ENUM ('renter', 'host', 'admin', 'guard');
CREATE TYPE onboarding_step AS ENUM ('mode', 'profile', 'vehicle', 'consent', 'kyc', 'done');

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role DEFAULT 'renter',
  full_name TEXT NOT NULL,
  phone TEXT UNIQUE NOT NULL,
  kyc_status TEXT DEFAULT 'pending', -- 'pending', 'verified', 'rejected'
  onboarding_step onboarding_step DEFAULT 'mode',
  default_mode user_role DEFAULT 'renter',
  consent_location BOOLEAN DEFAULT false,
  consent_location_at TIMESTAMPTZ,
  consent_terms BOOLEAN DEFAULT false,
  consent_terms_at TIMESTAMPTZ,
  terms_version TEXT,
  created_via TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  make_model TEXT NOT NULL,
  vehicle_type TEXT NOT NULL, -- '2-wheeler', '3-wheeler', '4-wheeler'
  connector TEXT NOT NULL,
  battery_capacity_kwh NUMERIC,
  registration_number TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE kyc_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  provider TEXT NOT NULL, -- 'mock', 'digilocker'
  reference_id TEXT NOT NULL,
  masked_licence_last4 TEXT NOT NULL,
  verified_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(profile_id, provider)
);

-- Trigger to create profile on auth.users insert
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, phone, role, onboarding_step)
  VALUES (new.id, new.raw_user_meta_data->>'phone', 'renter', 'mode');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
