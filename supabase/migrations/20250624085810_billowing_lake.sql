/*
  # Update connections table for single connection per app type

  1. Schema Changes
    - Add `app_type` column to categorize connections (gmail, calendar, docs, etc.)
    - Add unique constraint to ensure one connection per user per app type
    - Update existing data to populate app_type based on provider

  2. Security
    - Maintain existing RLS policies
    - Add index for efficient app_type queries

  3. Data Migration
    - Populate app_type for existing connections
    - Handle provider mapping to app types
*/

-- Add app_type column
ALTER TABLE connections ADD COLUMN IF NOT EXISTS app_type text;

-- Update existing connections to populate app_type based on provider
UPDATE connections SET app_type = CASE
  WHEN provider = 'gmail' THEN 'gmail'
  WHEN provider = 'calendar' THEN 'calendar'
  WHEN provider = 'google_calendar' THEN 'calendar'
  WHEN provider = 'docs' THEN 'docs'
  WHEN provider = 'google_docs' THEN 'docs'
  WHEN provider = 'sheets' THEN 'sheets'
  WHEN provider = 'google_sheets' THEN 'sheets'
  WHEN provider = 'drive' THEN 'drive'
  WHEN provider = 'google_drive' THEN 'drive'
  WHEN provider = 'notion' THEN 'notion'
  WHEN provider = 'slack' THEN 'slack'
  WHEN provider = 'github' THEN 'github'
  WHEN provider = 'linear' THEN 'linear'
  ELSE provider
END
WHERE app_type IS NULL;

-- Make app_type required
ALTER TABLE connections ALTER COLUMN app_type SET NOT NULL;

-- Update the existing unique constraint to include app_type
ALTER TABLE connections DROP CONSTRAINT IF EXISTS connections_user_id_connection_id_key;

-- Drop the old unique constraint if it exists
DROP INDEX IF EXISTS connections_user_id_connection_id_key;

-- Add unique constraint for one connection per user per app type
CREATE UNIQUE INDEX IF NOT EXISTS connections_user_app_type_unique 
ON connections(user_id, app_type);

-- Create index for efficient app_type queries
CREATE INDEX IF NOT EXISTS connections_app_type_idx ON connections(app_type);