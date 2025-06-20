/*
  # Create voice_logs table for conversation history

  1. New Tables
    - `voice_logs`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `input_type` (text, 'voice' or 'text')
      - `input_text` (text, what the user said/typed)
      - `output_text` (text, the assistant's response)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `voice_logs` table
    - Add policy for users to read/write their own logs
*/

CREATE TABLE IF NOT EXISTS voice_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  input_type text NOT NULL CHECK (input_type IN ('voice', 'text')),
  input_text text NOT NULL,
  output_text text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE voice_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own voice logs"
  ON voice_logs
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own voice logs"
  ON voice_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create an index for faster queries
CREATE INDEX IF NOT EXISTS voice_logs_user_id_created_at_idx ON voice_logs(user_id, created_at DESC);