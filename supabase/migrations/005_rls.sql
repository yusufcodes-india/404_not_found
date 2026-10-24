-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE kyc_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE hosts ENABLE ROW LEVEL SECURITY;
ALTER TABLE chargers ENABLE ROW LEVEL SECURITY;
ALTER TABLE charger_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE gate_passes ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE violations ENABLE ROW LEVEL SECURITY;
ALTER TABLE blacklist ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions_meter ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE reliability_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE demand_history ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "Users can view their own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Vehicles
CREATE POLICY "Users can manage their own vehicles" ON vehicles FOR ALL USING (auth.uid() = profile_id);

-- KYC
CREATE POLICY "Users can view their own KYC" ON kyc_records FOR SELECT USING (auth.uid() = profile_id);

-- Chargers
CREATE POLICY "Anyone can view chargers" ON chargers FOR SELECT USING (true);
CREATE POLICY "Hosts can manage their own chargers" ON chargers FOR ALL USING (
  EXISTS (SELECT 1 FROM hosts WHERE id = chargers.host_id AND id = auth.uid())
);

-- Charger Addresses (The Private Part)
CREATE POLICY "Host, Admin, and Active Renters can view exact address" ON charger_addresses FOR SELECT USING (
  auth.uid() = (SELECT host_id FROM chargers WHERE id = charger_addresses.charger_id)
  OR
  EXISTS (
    SELECT 1 FROM bookings
    WHERE charger_id = charger_addresses.charger_id
    AND renter_id = auth.uid()
    AND status IN ('paid', 'active')
  )
  OR
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

-- Bookings
CREATE POLICY "Users can view their own bookings" ON bookings FOR SELECT USING (
  auth.uid() = renter_id
  OR auth.uid() = (SELECT host_id FROM chargers WHERE id = charger_id)
);
CREATE POLICY "Users can create bookings" ON bookings FOR INSERT WITH CHECK (auth.uid() = renter_id);

-- Messages
CREATE POLICY "Participants can view messages" ON messages FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM bookings
    WHERE id = messages.booking_id
    AND (renter_id = auth.uid() OR (SELECT host_id FROM chargers WHERE id = charger_id) = auth.uid())
  )
);

-- Notifications & Push
CREATE POLICY "Users can manage their own notifications" ON notifications FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own push subs" ON push_subscriptions FOR ALL USING (auth.uid() = user_id);

-- Admin Tables
CREATE POLICY "Admins only" ON violations FOR ALL USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');
CREATE POLICY "Admins only" ON blacklist FOR ALL USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- Public View for discovery
CREATE VIEW public_chargers AS
SELECT
  c.id, c.name, c.type, c.current, c.power_kw, c.connector, c.approx_lat, c.approx_lng, c.price_per_kwh, c.status
FROM chargers c
WHERE c.status = 'active';
