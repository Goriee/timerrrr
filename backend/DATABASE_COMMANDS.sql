-- Sample SQL commands for managing the Guild Boss Timer database

-- ============================================
-- ADD NEW BOSS
-- ============================================

INSERT INTO bosses (name, attack_type, level, respawn_hours, location)
VALUES ('New Boss Name', 'melee', 75, 12, 'Location Name');

-- Example: Add a new magic boss
INSERT INTO bosses (name, attack_type, level, respawn_hours, location)
VALUES ('Frost Titan', 'magic', 90, 72, 'Frozen Wasteland');


-- ============================================
-- UPDATE BOSS INFORMATION
-- ============================================

-- Update boss level
UPDATE bosses 
SET level = 85 
WHERE name = 'Dragon Lord';

-- Update respawn time
UPDATE bosses 
SET respawn_hours = 36 
WHERE name = 'Ice Queen';

-- Update location
UPDATE bosses 
SET location = 'Dark Fortress' 
WHERE name = 'Shadow Knight';


-- ============================================
-- MANUALLY SET BOSS SPAWN TIMES
-- ============================================

-- Set last kill and next spawn for a boss
UPDATE bosses 
SET 
  last_kill_at = '2024-01-01 10:00:00+00',
  next_spawn_at = '2024-01-02 10:00:00+00',
  is_scheduled = true
WHERE id = 1;

-- Mark boss as alive (clear spawn time)
UPDATE bosses 
SET 
  next_spawn_at = NULL,
  is_scheduled = false
WHERE id = 1;


-- ============================================
-- CHANGE ADMIN PASSWORD
-- ============================================

-- First, generate a new bcrypt hash for your password
-- Use Node.js: 
-- const bcrypt = require('bcrypt');
-- console.log(await bcrypt.hash('your_new_password', 10));

-- Then update the settings table
UPDATE settings 
SET value = '$2b$10$your_new_bcrypt_hash_here'
WHERE key = 'admin_password_hash';


-- ============================================
-- VIEW QUERIES
-- ============================================

-- View all bosses with spawn status
SELECT 
  id,
  name,
  attack_type,
  level,
  location,
  respawn_hours,
  last_kill_at,
  next_spawn_at,
  CASE 
    WHEN next_spawn_at IS NULL THEN 'No spawn scheduled'
    WHEN next_spawn_at <= NOW() THEN 'ALIVE'
    ELSE 'Respawning'
  END as status
FROM bosses
ORDER BY next_spawn_at ASC NULLS LAST;

-- View bosses that are currently alive
SELECT name, location, level
FROM bosses
WHERE next_spawn_at IS NULL OR next_spawn_at <= NOW();

-- View upcoming spawns in next 24 hours
SELECT 
  name, 
  location, 
  next_spawn_at,
  EXTRACT(EPOCH FROM (next_spawn_at - NOW())) / 3600 as hours_until_spawn
FROM bosses
WHERE next_spawn_at > NOW() 
  AND next_spawn_at <= NOW() + INTERVAL '24 hours'
ORDER BY next_spawn_at;

-- View bosses by location
SELECT location, COUNT(*) as boss_count
FROM bosses
GROUP BY location
ORDER BY boss_count DESC;

-- View bosses by attack type
SELECT attack_type, COUNT(*) as boss_count
FROM bosses
GROUP BY attack_type;


-- ============================================
-- DELETE OPERATIONS
-- ============================================

-- Delete a specific boss
DELETE FROM bosses WHERE id = 1;

-- Delete all bosses (CAREFUL!)
-- DELETE FROM bosses;

-- Delete bosses by location
DELETE FROM bosses WHERE location = 'Old Location';


-- ============================================
-- RESET DATABASE
-- ============================================

-- Clear all boss spawn times
UPDATE bosses 
SET 
  last_kill_at = NULL,
  next_spawn_at = NULL,
  is_scheduled = false;

-- Drop all tables (CAREFUL!)
-- DROP TABLE IF EXISTS bosses;
-- DROP TABLE IF EXISTS settings;


-- ============================================
-- BACKUP & RESTORE
-- ============================================

-- Backup (run in terminal)
-- pg_dump -h host -U user -d database > backup.sql

-- Restore (run in terminal)
-- psql -h host -U user -d database < backup.sql


-- ============================================
-- USEFUL AGGREGATIONS
-- ============================================

-- Average respawn time by attack type
SELECT 
  attack_type,
  AVG(respawn_hours) as avg_respawn_hours,
  COUNT(*) as boss_count
FROM bosses
GROUP BY attack_type;

-- Highest level bosses
SELECT name, level, location
FROM bosses
ORDER BY level DESC
LIMIT 5;

-- Bosses with longest respawn times
SELECT name, respawn_hours, location
FROM bosses
ORDER BY respawn_hours DESC
LIMIT 5;


-- ============================================
-- MAINTENANCE
-- ============================================

-- Check table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Check number of rows
SELECT 
  'bosses' as table_name, 
  COUNT(*) as row_count 
FROM bosses
UNION ALL
SELECT 
  'settings' as table_name, 
  COUNT(*) as row_count 
FROM settings;

-- View recent updates
SELECT 
  name,
  updated_at,
  NOW() - updated_at as time_since_update
FROM bosses
ORDER BY updated_at DESC;


-- ============================================
-- BULK OPERATIONS
-- ============================================

-- Add multiple bosses at once
INSERT INTO bosses (name, attack_type, level, respawn_hours, location) VALUES
  ('Fire Drake', 'magic', 80, 24, 'Volcano Lair'),
  ('Stone Golem', 'melee', 75, 12, 'Ancient Ruins'),
  ('Wind Serpent', 'magic', 70, 8, 'Sky Citadel');

-- Update all bosses in a location
UPDATE bosses 
SET respawn_hours = 48
WHERE location = 'Dragon Peak';

-- Mark all bosses as alive
UPDATE bosses
SET 
  next_spawn_at = NULL,
  is_scheduled = false;
