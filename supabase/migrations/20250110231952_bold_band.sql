-- Add pricing columns to subscription_tiers
ALTER TABLE subscription_tiers
ADD COLUMN IF NOT EXISTS regular_price numeric(10,2) NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS discounted_price numeric(10,2),
ADD COLUMN IF NOT EXISTS discount_percentage integer,
ADD COLUMN IF NOT EXISTS discount_ends_at timestamptz;

-- Add constraint to ensure discount percentage is between 0 and 100
ALTER TABLE subscription_tiers
ADD CONSTRAINT valid_discount_percentage 
CHECK (discount_percentage IS NULL OR (discount_percentage >= 0 AND discount_percentage <= 100));

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

-- Add policy for admin pricing management
CREATE POLICY "Only admins can update subscription pricing"
  ON subscription_tiers
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.is_admin = true
    )
  );