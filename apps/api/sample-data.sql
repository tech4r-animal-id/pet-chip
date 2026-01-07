-- Sample Data for Pet-Chip API Testing
-- Run this in your PostgreSQL database before testing the API

-- ============================================================================
-- 1. Administrative Areas
-- ============================================================================

INSERT INTO administrative_areas (area_name, area_type, parent_area_id, code, created_at)
VALUES 
  ('Tashkent', 'Region', NULL, 'TAS-01', CURRENT_TIMESTAMP),
  ('Samarkand', 'Region', NULL, 'SAM-01', CURRENT_TIMESTAMP),
  ('Bukhara', 'Region', NULL, 'BUK-01', CURRENT_TIMESTAMP);

-- Get the area IDs for districts
-- Tashkent districts
INSERT INTO administrative_areas (area_name, area_type, parent_area_id, code, created_at)
VALUES 
  ('Yunusabad District', 'District', 1, 'TAS-YUN-01', CURRENT_TIMESTAMP),
  ('Mirzo Ulugbek District', 'District', 1, 'TAS-MIR-01', CURRENT_TIMESTAMP),
  ('Chilanzar District', 'District', 1, 'TAS-CHI-01', CURRENT_TIMESTAMP);

-- ============================================================================
-- 2. Holdings (Farms/Households)
-- ============================================================================

INSERT INTO holdings (holding_name, holding_type, owner_name, contact_phone, address, status, area_id, registration_date, created_at)
VALUES 
  ('Green Valley Farm', 'Farm', 'Aziz Karimov', '+998901234567', 'Tashkent Region, Yunusabad District, Street 15', 'Active', 4, CURRENT_DATE, CURRENT_TIMESTAMP),
  ('Sunrise Dairy', 'Commercial Enterprise', 'Dilshod Rashidov', '+998901234568', 'Tashkent Region, Mirzo Ulugbek District', 'Active', 5, CURRENT_DATE, CURRENT_TIMESTAMP),
  ('Family Household - Alimov', 'Household', 'Jamshid Alimov', '+998901234569', 'Chilanzar District, Block 12', 'Active', 6, CURRENT_DATE, CURRENT_TIMESTAMP),
  ('Mountain View Ranch', 'Pastoral', 'Rustam Ibragimov', '+998901234570', 'Samarkand Region', 'Active', 2, CURRENT_DATE, CURRENT_TIMESTAMP),
  ('City Veterinary Clinic', 'Commercial Enterprise', 'Dr. Nargiza Yusupova', '+998901234571', 'Tashkent City Center', 'Active', 1, CURRENT_DATE, CURRENT_TIMESTAMP);

-- ============================================================================
-- 3. Users (Optional - for ownership tracking)
-- ============================================================================

INSERT INTO users (username, email, phone_number, full_name, user_role, area_id, status, created_at)
VALUES 
  ('aziz.karimov', 'aziz.karimov@example.uz', '+998901234567', 'Aziz Karimov', 'Farmer', 4, 'Active', CURRENT_TIMESTAMP),
  ('dilshod.rashidov', 'dilshod.r@example.uz', '+998901234568', 'Dilshod Rashidov', 'Farmer', 5, 'Active', CURRENT_TIMESTAMP),
  ('dr.alimov', 'j.alimov@vet.uz', '+998901234569', 'Dr. Jamshid Alimov', 'Veterinarian', 6, 'Active', CURRENT_TIMESTAMP),
  ('rustam.ibragimov', 'rustam.i@example.uz', '+998901234570', 'Rustam Ibragimov', 'Farmer', 2, 'Active', CURRENT_TIMESTAMP),
  ('dr.yusupova', 'n.yusupova@vet.uz', '+998901234571', 'Dr. Nargiza Yusupova', 'Veterinarian', 1, 'Active', CURRENT_TIMESTAMP),
  ('gov.officer', 'officer@gov.uz', '+998901234572', 'Government Officer', 'Government Officer', 1, 'Active', CURRENT_TIMESTAMP);

-- ============================================================================
-- 4. Verification Queries
-- ============================================================================

-- Check administrative areas
SELECT area_id, area_name, area_type, code FROM administrative_areas ORDER BY area_id;

-- Check holdings
SELECT holding_id, holding_name, holding_type, owner_name, area_id FROM holdings ORDER BY holding_id;

-- Check users
SELECT user_id, username, full_name, user_role FROM users ORDER BY created_at;

-- ============================================================================
-- NOTES FOR TESTING
-- ============================================================================

-- After running this script, you can test the API with:
--
-- 1. Register Animal (use holding_id 1, 2, 3, 4, or 5)
-- 2. Use these microchip numbers that will validate:
--    - 981200012345678 (HomeAgain)
--    - 981200012345679 (PetLink)
--    - 981200012345680 (AKC Reunite)
--    - Any 15-digit number starting with 981 will work
--
-- 3. Sample official IDs to use:
--    - UZB-2024-001
--    - UZB-2024-002
--    - UZB-CAT-001
--    - UZB-DOG-001
