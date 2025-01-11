/*
  # Update subscription tiers with new features

  1. Changes
    - Updates the Advanced subscription tier with new features and limits
    - Ensures all required columns exist
    - Updates both Free and Advanced tiers with correct values

  2. Details
    Advanced tier:
    - 50 Menu Items (per menu)
    - 5 Menus
    - 10 Menu Categories (per menu)
    - Social Share Icon (enabled by default)
    - Item Image Upload (enabled by default)
    - 1 QR Code to Menus
    - 15 Backgrounds
    - 1 Custom Link
    - Specials Notice Section
*/

-- Update subscription tiers with new values
UPDATE subscription_tiers
SET 
  max_menu_items = 20,
  max_menus = 1,
  max_categories = 5,
  max_backgrounds = 5,
  max_custom_links = 0
WHERE name = 'Free';

UPDATE subscription_tiers
SET 
  max_menu_items = 50,
  max_menus = 5,
  max_categories = 10,
  max_backgrounds = 15,
  max_custom_links = 1
WHERE name = 'Advanced';