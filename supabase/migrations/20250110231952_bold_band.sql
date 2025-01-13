-- Add pricing columns to subscription_tiers
ALTER TABLE subscription_tiers
ADD COLUMN IF NOT EXISTS regular_price numeric(10,2) NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS discounted_price numeric(10,2),
ADD COLUMN IF NOT EXISTS discount_percentage integer,
ADD COLUMN IF NOT EXISTS discount_ends_at timestamptz;

-- Constraint handled in earlier migration (20250110231559_summer_mouse.sql)

-- Update existing tiers with pricing
UPDATE subscription_tiers
SET 
  regular_price = 0,
  discounted_price = NULL,
  discount_percentage = NULL,
  discount_ends_at = NULL
WHERE name = 'Free';

UPDATE subscription_tiers
SET 
  regular_price = 19.97,
  discounted_price = 9.97,
  discount_percentage = 50,
  discount_ends_at = NOW() + INTERVAL '30 days'
WHERE name = 'Advanced';

-- Policy already exists in earlier migration (20250110231559_summer_mouse.sql)
