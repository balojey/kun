/*
  # Create connections table for PicaOS tool integrations

  1. New Tables
    - `connections`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `connection_id` (text, unique identifier from PicaOS)
      - `provider` (text, the tool provider name like 'gmail', 'notion', etc.)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `connections` table
    - Add policy for users to read/write their own connections
*/

CREATE TABLE IF NOT EXISTS connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  connection_id text NOT NULL,
  provider text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, connection_id)
);

ALTER TABLE connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own connections"
  ON connections
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own connections"
  ON connections
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own connections"
  ON connections
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own connections"
  ON connections
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create an index for faster queries
CREATE INDEX IF NOT EXISTS connections_user_id_idx ON connections(user_id);
CREATE INDEX IF NOT EXISTS connections_connection_id_idx ON connections(connection_id);