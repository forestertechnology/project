/*
  # Add restaurant limits per subscription tier

  1. Changes
    - Add max_restaurants column to subscription_tiers
    - Add validation trigger for restaurant limits
    - Update existing subscription tiers with max_restaurants = 1
  
  2. Security
    - Maintain existing RLS policies
*/

-- Add max_restaurants column
ALTER TABLE subscription_tiers ADD COLUMN max_restaurants integer NOT NULL DEFAULT 1;

-- Create validation function
CREATE OR REPLACE FUNCTION validate_restaurant_count()
RETURNS TRIGGER AS $$
DECLARE
  max_count integer;
  current_count integer;
BEGIN
  -- Get user's subscription tier max restaurants
  SELECT max_restaurants INTO max_count
  FROM subscription_tiers
  WHERE id = (
    SELECT subscription_tier_id
    FROM user_profiles
    WHERE id = NEW.owner_id
  );

  -- Get current restaurant count
  SELECT COUNT(*) INTO current_count
  FROM restaurants
  WHERE owner_id = NEW.owner_id;

  -- Validate count
  IF current_count >= max_count THEN
    RAISE EXCEPTION 'Restaurant limit reached for subscription tier'
      USING ERRCODE = 'check_violation';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'validate_restaurant_count_trigger'
  ) THEN
    CREATE TRIGGER validate_restaurant_count_trigger
    BEFORE INSERT OR UPDATE ON restaurants
    FOR EACH ROW
    EXECUTE FUNCTION validate_restaurant_count();
  END IF;
END $$;

-- Update existing subscription tiers
UPDATE subscription_tiers
SET max_restaurants = 1
WHERE name IN ('Free', 'Advanced');
