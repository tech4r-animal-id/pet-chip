-- Initialize PostgreSQL database for pet-chip application
-- This script runs automatically when the container starts for the first time

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "postgis";  -- For geospatial queries (alerts)

-- Create schemas
CREATE SCHEMA IF NOT EXISTS public;

-- Grant permissions
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;

-- Create function for updating updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Log initialization
DO $$
BEGIN
  RAISE NOTICE 'Pet-Chip PostgreSQL database initialized successfully';
  RAISE NOTICE 'Extensions: uuid-ossp, pgcrypto, postgis';
  RAISE NOTICE 'Ready for Drizzle ORM migrations';
END $$;
