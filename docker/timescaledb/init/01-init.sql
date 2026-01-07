-- Initialize TimescaleDB database for time-series data
-- This script runs automatically when the container starts for the first time

-- Create TimescaleDB extension
CREATE EXTENSION IF NOT EXISTS timescaledb;

-- Create extensions for UUID and crypto
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Note: The animal_health_records table will be created by Drizzle migrations
-- After migration, convert to hypertable with this command:
-- SELECT create_hypertable('animal_health_records', 'record_date', if_not_exists => TRUE);

-- Create function to convert health records to hypertable
-- This will be called after the Drizzle migration creates the table
CREATE OR REPLACE FUNCTION convert_health_records_to_hypertable()
RETURNS void AS $$
BEGIN
  -- Check if table exists
  IF EXISTS (
    SELECT FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename = 'animal_health_records'
  ) THEN
    -- Convert to hypertable
    PERFORM create_hypertable(
      'animal_health_records',
      'record_date',
      if_not_exists => TRUE,
      migrate_data => TRUE
    );
    
    -- Create TimescaleDB-specific indexes for time-series queries
    CREATE INDEX IF NOT EXISTS idx_health_records_time_animal 
      ON animal_health_records (record_date DESC, animal_id);
    
    CREATE INDEX IF NOT EXISTS idx_health_records_time_holding 
      ON animal_health_records (record_date DESC, holding_id);
    
    RAISE NOTICE 'animal_health_records converted to TimescaleDB hypertable successfully';
  ELSE
    RAISE NOTICE 'animal_health_records table does not exist yet. Run Drizzle migrations first.';
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Log initialization
DO $$
BEGIN
  RAISE NOTICE 'Pet-Chip TimescaleDB initialized successfully';
  RAISE NOTICE 'After running migrations, execute: SELECT convert_health_records_to_hypertable();';
END $$;
