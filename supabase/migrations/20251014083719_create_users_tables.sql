/*
  # Create User Tables for Pipedrive and TeamLeader

  1. New Tables
    - `pipedrive_users`
      - `id` (uuid, primary key) - References auth.users
      - `email` (text, unique, not null) - User email
      - `phone_number` (text) - User phone number
      - `created_at` (timestamptz) - Account creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp
    
    - `teamleader_users`
      - `id` (uuid, primary key) - References auth.users
      - `email` (text, unique, not null) - User email
      - `phone_number` (text) - User phone number
      - `created_at` (timestamptz) - Account creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to read their own data
    - Add policies for authenticated users to update their own data

  3. Important Notes
    - Both tables reference auth.users(id) for authentication integration
    - Email field is unique to prevent duplicate registrations
    - Phone numbers are optional but stored for user profiles
    - Timestamps track account lifecycle
*/

-- Create pipedrive_users table
CREATE TABLE IF NOT EXISTS pipedrive_users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  phone_number text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create teamleader_users table
CREATE TABLE IF NOT EXISTS teamleader_users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  phone_number text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS on pipedrive_users
ALTER TABLE pipedrive_users ENABLE ROW LEVEL SECURITY;

-- Enable RLS on teamleader_users
ALTER TABLE teamleader_users ENABLE ROW LEVEL SECURITY;

-- Policies for pipedrive_users
CREATE POLICY "Users can view own pipedrive profile"
  ON pipedrive_users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own pipedrive profile"
  ON pipedrive_users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policies for teamleader_users
CREATE POLICY "Users can view own teamleader profile"
  ON teamleader_users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own teamleader profile"
  ON teamleader_users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_pipedrive_users_email ON pipedrive_users(email);
CREATE INDEX IF NOT EXISTS idx_teamleader_users_email ON teamleader_users(email);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_pipedrive_users_updated_at
  BEFORE UPDATE ON pipedrive_users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teamleader_users_updated_at
  BEFORE UPDATE ON teamleader_users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();