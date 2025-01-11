/*
  # Update subscription tiers schema

  1. Changes
    - Remove max_item_images column
    - Add max_backgrounds and max_custom_links columns
    - Update subscription tier data
  
  2. Security
    - Maintain existing RLS policies
*/

-- Drop max_item_images column if it exists
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'subscription_tiers' 
    AND column_name = 'max_item_images'
  ) THEN
    ALTER TABLE subscription_tiers DROP COLUMN max_item_images;
  END IF;
END $$;

-- Add new columns if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'subscription_tiers' 
    AND column_name = 'max_backgrounds'
  ) THEN
    ALTER TABLE subscription_tiers ADD COLUMN max_backgrounds integer NOT NULL DEFAULT 5;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'subscription_tiers' 
    AND column_name = 'max_custom_links'
  ) THEN
    ALTER TABLE subscription_tiers ADD COLUMN max_custom_links integer NOT NULL DEFAULT 0;
  END IF;
END $$;

-- Add unique constraint on name if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'subscription_tiers_name_key'
  ) THEN
    ALTER TABLE subscription_tiers ADD CONSTRAINT subscription_tiers_name_key UNIQUE (name);
  END IF;
END $$;

-- Update or insert subscription tiers
INSERT INTO subscription_tiers (
  name,
  max_menu_items,
  max_menus,
  max_categories,
  max_backgrounds,
  max_custom_links,
  custom_qr_codes,
  special_offers
)
VALUES
  ('Free', 20, 1, 5, 5, 0, false, false),
  ('Advanced', 50, 5, 10, 15, 1, true, false)
ON CONFLICT (name) 
DO UPDATE SET
  max_menu_items = EXCLUDED.max_menu_items,
  max_menus = EXCLUDED.max_menus,
  max_categories = EXCLUDED.max_categories,
  max_backgrounds = EXCLUDED.max_backgrounds,
  max_custom_links = EXCLUDED.max_custom_links,
  custom_qr_codes = EXCLUDED.custom_qr_codes,
  special_offers = EXCLUDED.special_offers;