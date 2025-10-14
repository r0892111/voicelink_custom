/*
  # Add WhatsApp Fields to User Tables

  1. Changes to Tables
    - `pipedrive_users`
      - Add `whatsapp_number` (text) - User's WhatsApp number
      - Add `whatsapp_status` (text, default 'active') - WhatsApp status
      - Remove `phone_number` column (replaced by whatsapp_number)
    
    - `teamleader_users`
      - Add `whatsapp_number` (text) - User's WhatsApp number
      - Add `whatsapp_status` (text, default 'active') - WhatsApp status
      - Remove `phone_number` column (replaced by whatsapp_number)

  2. Important Notes
    - WhatsApp status defaults to 'active' for all new users
    - Phone numbers are now stored in whatsapp_number field
    - Existing data migration: phone_number values copied to whatsapp_number before column drop
*/

-- Update pipedrive_users table
DO $$
BEGIN
  -- Add whatsapp_number column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pipedrive_users' AND column_name = 'whatsapp_number'
  ) THEN
    ALTER TABLE pipedrive_users ADD COLUMN whatsapp_number text;
  END IF;

  -- Add whatsapp_status column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pipedrive_users' AND column_name = 'whatsapp_status'
  ) THEN
    ALTER TABLE pipedrive_users ADD COLUMN whatsapp_status text DEFAULT 'active' NOT NULL;
  END IF;

  -- Migrate existing data from phone_number to whatsapp_number
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pipedrive_users' AND column_name = 'phone_number'
  ) THEN
    UPDATE pipedrive_users SET whatsapp_number = phone_number WHERE phone_number IS NOT NULL;
    ALTER TABLE pipedrive_users DROP COLUMN phone_number;
  END IF;
END $$;

-- Update teamleader_users table
DO $$
BEGIN
  -- Add whatsapp_number column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'teamleader_users' AND column_name = 'whatsapp_number'
  ) THEN
    ALTER TABLE teamleader_users ADD COLUMN whatsapp_number text;
  END IF;

  -- Add whatsapp_status column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'teamleader_users' AND column_name = 'whatsapp_status'
  ) THEN
    ALTER TABLE teamleader_users ADD COLUMN whatsapp_status text DEFAULT 'active' NOT NULL;
  END IF;

  -- Migrate existing data from phone_number to whatsapp_number
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'teamleader_users' AND column_name = 'phone_number'
  ) THEN
    UPDATE teamleader_users SET whatsapp_number = phone_number WHERE phone_number IS NOT NULL;
    ALTER TABLE teamleader_users DROP COLUMN phone_number;
  END IF;
END $$;