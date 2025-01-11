/*
  # Update subscription tiers schema and data

  1. Changes
    - Add new columns for background limits and custom links
    - Update existing subscription tiers with new features

  2. Security
    - Maintains existing RLS policies
*/

-- Add new columns
ALTER TABLE subscription_tiers 
ADD COLUMN IF NOT EXISTS max_backgrounds integer NOT NULL DEFAULT 5,
ADD COLUMN IF NOT EXISTS max_custom_links integer NOT NULL DEFAULT 0;

-- Update existing tiers with new values
UPDATE subscription_tiers
SET 
  max_menu_items = 20,
  max_menus = 1,
  max_categories = 5,
  max_backgrounds = 5,
  max_custom_links = 0,
  custom_qr_codes = false,
  special_offers = false
WHERE name = 'Free';

UPDATE subscription_tiers
SET 
  max_menu_items = 50,
  max_menus = 5,
  max_categories = 10,
  max_backgrounds = 15,
  max_custom_links = 1,
  custom_qr_codes = true,
  special_offers = false
WHERE name = 'Advanced';