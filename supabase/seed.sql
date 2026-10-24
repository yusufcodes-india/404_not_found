-- Seed data for Kilari Demo (Pune)

-- 1. Profiles
INSERT INTO profiles (id, phone, full_name, role, onboarding_step, kyc_status) VALUES
('00000000-0000-0000-0000-000000000001', '+919876543210', 'Yusuf Tarwala', 'renter', 'done', 'verified'),
('00000000-0000-0000-0000-000000000002', '+919876543211', 'Amit Sharma', 'host', 'done', 'verified'),
('00000000-0000-0000-0000-000000000003', '+919876543212', 'Priya Patil', 'host', 'done', 'verified'),
('00000000-0000-0000-0000-000000000004', '+919876543213', 'Suresh Iyer', 'host', 'done', 'verified'),
('00000000-0000-0000-0000-000000000005', '+919876543214', 'Rahul Gupta', 'renter', 'done', 'verified'),
('00000000-0000-0000-0000-000000000006', '+919876543215', 'Sneha Kulkarni', 'renter', 'done', 'verified'),
('00000000-0000-0000-0000-000000000007', '+919876543216', 'Admin User', 'admin', 'done', 'verified'),
('00000000-0000-0000-0000-000000000008', '+919876543217', 'Guard User', 'guard', 'done', 'verified');

-- 2. Hosts
INSERT INTO hosts (id, bio, avg_rating, total_sessions) VALUES
('00000000-0000-0000-0000-000000000002', 'Home charger in Baner, easy access.', 4.8, 12),
('00000000-0000-0000-0000-000000000003', 'Society charger in Aundh. Fast charging.', 4.5, 45),
('00000000-0000-0000-0000-000000000004', 'Office charger in Hinjawadi. Available 9-6.', 4.9, 8),

-- 3. Chargers
INSERT INTO chargers (id, host_id, name, type, current, power_kw, connector, parking, cable_provided, rules, approx_lat, approx_lng, price_per_kwh, status) VALUES
(gen_random_uuid(), '00000000-0000-0000-0000-000000000002', 'Baner Home Power', 'home', 'AC', 7.2, 'Type 2', 'Private Driveway', true, 'Please park inside the gate.', 18.5597, 73.8100, 14, 'active'),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000003', 'Aundh Society Hub', 'society', 'DC', 25, 'CCS2', 'Society Parking B2', true, 'Register with security first.', 18.5600, 73.8200, 14, 'active'),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000004', 'Hinjawadi Office Spot', 'office', 'AC', 7.2, 'Type 2', 'Employee Parking', true, 'Booking required 24h in advance.', 18.5913, 73.7389, 14, 'active');

-- 4. Demand History (Fake data for forecasting)
INSERT INTO demand_history (area, hour_of_week, request_count)
SELECT
  area,
  h,
  (random() * 10)::int
FROM (VALUES ('Baner'), ('Aundh'), ('Hinjawadi'), ('Wakad'), ('Balewadi')) as t(area),
     generate_series(0, 167) as h;
