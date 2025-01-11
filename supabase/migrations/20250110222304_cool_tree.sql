/*
  # Add error logging and subscription tier validation

  1. Changes
    - Add unique constraint on subscription tier name
    - Add error logging function
    - Add subscription tier validation
    - Update subscription tiers with correct values
  
  2. Security
    - Maintain existing RLS policies
    - Add validation for subscription tiers
*/

-- Add unique constraint on subscription tier name
ALTER TABLE subscription_tiers ADD CONSTRAINT subscription_tiers_name_key UNIQUE (name);

-- Create error logging function
CREATE OR REPLACE FUNCTION log_auth_error(
  p_error text,
  p_context jsonb
)
RETURNS void AS $$
BEGIN
  INSERT INTO auth.audit_log_entries (
    instance_id,
    ip_address,
    payload,
    created_at,
    error_message
  )
  VALUES (
    gen_random_uuid(),
    '0.0.0.0',
    p_context,
    now(),
    p_error
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create subscription tier validation function
CREATE OR REPLACE FUNCTION validate_subscription_tier()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM subscription_tiers 
    WHERE id = NEW.subscription_tier_id
  ) THEN
    -- Log the error
    PERFORM log_auth_error(
      'Invalid subscription tier ID',
      jsonb_build_object(
        'user_id', NEW.id,
        'subscription_tier_id', NEW.subscription_tier_id
      )
    );
    
    -- Set to Free tier
    NEW.subscription_tier_id := (
      SELECT id FROM subscription_tiers 
      WHERE name = 'Free' 
      LIMIT 1
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for subscription tier validation
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'validate_subscription_tier_trigger'
  ) THEN
    CREATE TRIGGER validate_subscription_tier_trigger
    BEFORE INSERT OR UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION validate_subscription_tier();
  END IF;
END $$;

-- Ensure subscription tiers exist
DO $$ 
DECLARE
  free_tier_id uuid;
  advanced_tier_id uuid;
BEGIN
  -- Insert Free tier if it doesn't exist
  INSERT INTO subscription_tiers (
    name, 
    max_menu_items,
    max_item_images,
    max_menus,
    max_categories,
    max_backgrounds,
    max_custom_links,
    custom_qr_codes,
    special_offers
  )
  VALUES (
    'Free',
    20,
    20,
    1,
    5,
    5,
    0,
    false,
    false
  )
  ON CONFLICT (name) DO NOTHING
  RETURNING id INTO free_tier_id;

  -- Insert Advanced tier if it doesn't exist
  INSERT INTO subscription_tiers (
    name,
    max_menu_items,
    max_item_images,
    max_menus,
    max_categories,
    max_backgrounds,
    max_custom_links,
    custom_qr_codes,
    special_offers
  )
  VALUES (
    'Advanced',
    50,
    50,
    5,
    10,
    15,
    1,
    true,
    false
  )
  ON CONFLICT (name) DO NOTHING
  RETURNING id INTO advanced_tier_id;
END $$;