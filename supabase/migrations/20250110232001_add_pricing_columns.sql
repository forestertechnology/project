/*
  # Add pricing columns to subscription_tiers

  1. Changes
    - Add regular_price column
    - Add discounted_price column
    - Add discount_percentage column
    - Add discount_ends_at column
    - Update existing tiers with pricing data
  
  2. Security
    - Maintain existing RLS policies
*/

-- Add pricing columns
ALTER TABLE subscription_tiers
ADD COLUMN IF NOT EXISTS regular_price numeric NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS discounted_price numeric,
ADD COLUMN IF NOT EXISTS discount_percentage integer,
ADD COLUMN IF NOT EXISTS discount_ends_at timestamptz;

-- Update existing tiers with pricing
UPDATE subscription_tiers
SET regular_price = CASE
    WHEN name = 'Free' THEN 0
    WHEN name = 'Advanced' THEN 19.97
    ELSE 0
  END,
  discounted_price = CASE
    WHEN name = 'Advanced' THEN 14.97
    ELSE NULL
  END,
  discount_percentage = CASE
    WHEN name = 'Advanced' THEN 25
    ELSE NULL
  END,
  discount_ends_at = CASE
    WHEN name = 'Advanced' THEN NOW() + INTERVAL '30 days'
    ELSE NULL
  END;
