-- Enable Supabase Auth Integration
-- This script prepares the database for Supabase authentication

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Update user_profiles to integrate with auth.users
ALTER TABLE user_profiles 
ADD CONSTRAINT IF NOT EXISTS fk_user_profiles_auth 
FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add missing columns for auth integration
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS last_sign_in TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_user_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_user_profiles_updated_at_trigger ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at_trigger
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_user_profiles_updated_at();

-- Add comments for documentation
COMMENT ON TABLE user_profiles IS 'User authentication profiles integrated with Supabase Auth';
COMMENT ON COLUMN user_profiles.email_verified IS 'Whether the user email has been verified';
COMMENT ON COLUMN user_profiles.last_sign_in IS 'Timestamp of last user sign in';
