/*
  # Fix database policies and constraints

  1. Changes
    - Add missing policies for user profile creation
    - Add missing policies for subscription tier access
    - Add default subscription tier trigger
  
  2. Security
    - Enable RLS policies for user profile creation
    - Ensure proper access control for subscription tiers
*/

-- Add policy to allow users to insert their own profile
CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Add policy to allow public to read subscription tiers
CREATE POLICY "Public can read subscription tiers"
  ON subscription_tiers
  FOR SELECT
  TO public
  USING (true);

-- Create function to set default subscription tier
CREATE OR REPLACE FUNCTION set_default_subscription_tier()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.subscription_tier_id IS NULL THEN
    NEW.subscription_tier_id := (
      SELECT id FROM subscription_tiers 
      WHERE name = 'Free' 
      LIMIT 1
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to set default subscription tier
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'set_default_subscription_tier_trigger'
  ) THEN
    CREATE TRIGGER set_default_subscription_tier_trigger
    BEFORE INSERT ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION set_default_subscription_tier();
  END IF;
END $$;