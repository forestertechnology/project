/*
  # Initial Database Schema Setup

  1. New Tables
    - `subscription_tiers`
      - `id` (uuid, primary key)
      - `name` (text)
      - `max_menu_items` (integer)
      - `max_item_images` (integer)
      - `max_menus` (integer)
      - `max_categories` (integer)
      - `custom_qr_codes` (boolean)
      - `special_offers` (boolean)
      - `created_at` (timestamptz)

    - `user_profiles`
      - `id` (uuid, primary key)
      - `first_name` (text)
      - `last_name` (text)
      - `phone_number` (text, nullable)
      - `subscription_tier_id` (uuid, foreign key)
      - `is_admin` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `restaurants`
      - `id` (uuid, primary key)
      - `owner_id` (uuid, foreign key)
      - `name` (text)
      - `description` (text, nullable)
      - `logo_url` (text, nullable)
      - `location` (text, nullable)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `menus`
      - `id` (uuid, primary key)
      - `restaurant_id` (uuid, foreign key)
      - `name` (text)
      - `description` (text, nullable)
      - `is_active` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `menu_categories`
      - `id` (uuid, primary key)
      - `menu_id` (uuid, foreign key)
      - `name` (text)
      - `display_order` (integer)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `menu_items`
      - `id` (uuid, primary key)
      - `category_id` (uuid, foreign key)
      - `name` (text)
      - `description` (text, nullable)
      - `price` (numeric)
      - `image_url` (text, nullable)
      - `is_available` (boolean)
      - `display_order` (integer)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add appropriate policies for each table
*/

-- Create subscription_tiers table
CREATE TABLE IF NOT EXISTS subscription_tiers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  max_menu_items integer NOT NULL,
  max_item_images integer NOT NULL,
  max_menus integer NOT NULL,
  max_categories integer NOT NULL,
  custom_qr_codes boolean NOT NULL DEFAULT false,
  special_offers boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE subscription_tiers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to subscription_tiers"
  ON subscription_tiers
  FOR SELECT
  TO public
  USING (true);

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  first_name text NOT NULL,
  last_name text NOT NULL,
  phone_number text,
  subscription_tier_id uuid REFERENCES subscription_tiers NOT NULL,
  is_admin boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create restaurants table
CREATE TABLE IF NOT EXISTS restaurants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid REFERENCES user_profiles NOT NULL,
  name text NOT NULL,
  description text,
  logo_url text,
  location text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Restaurant owners can manage their restaurants"
  ON restaurants
  FOR ALL
  TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Public can view restaurants"
  ON restaurants
  FOR SELECT
  TO public
  USING (true);

-- Create menus table
CREATE TABLE IF NOT EXISTS menus (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid REFERENCES restaurants NOT NULL,
  name text NOT NULL,
  description text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE menus ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Restaurant owners can manage their menus"
  ON menus
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM restaurants
    WHERE restaurants.id = restaurant_id
    AND restaurants.owner_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM restaurants
    WHERE restaurants.id = restaurant_id
    AND restaurants.owner_id = auth.uid()
  ));

CREATE POLICY "Public can view active menus"
  ON menus
  FOR SELECT
  TO public
  USING (is_active = true);

-- Create menu_categories table
CREATE TABLE IF NOT EXISTS menu_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_id uuid REFERENCES menus NOT NULL,
  name text NOT NULL,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE menu_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Restaurant owners can manage their menu categories"
  ON menu_categories
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM menus
    JOIN restaurants ON restaurants.id = menus.restaurant_id
    WHERE menus.id = menu_id
    AND restaurants.owner_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM menus
    JOIN restaurants ON restaurants.id = menus.restaurant_id
    WHERE menus.id = menu_id
    AND restaurants.owner_id = auth.uid()
  ));

CREATE POLICY "Public can view menu categories"
  ON menu_categories
  FOR SELECT
  TO public
  USING (EXISTS (
    SELECT 1 FROM menus
    WHERE menus.id = menu_id
    AND menus.is_active = true
  ));

-- Create menu_items table
CREATE TABLE IF NOT EXISTS menu_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES menu_categories NOT NULL,
  name text NOT NULL,
  description text,
  price numeric NOT NULL,
  image_url text,
  is_available boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Restaurant owners can manage their menu items"
  ON menu_items
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM menu_categories
    JOIN menus ON menus.id = menu_categories.menu_id
    JOIN restaurants ON restaurants.id = menus.restaurant_id
    WHERE menu_categories.id = category_id
    AND restaurants.owner_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM menu_categories
    JOIN menus ON menus.id = menu_categories.menu_id
    JOIN restaurants ON restaurants.id = menus.restaurant_id
    WHERE menu_categories.id = category_id
    AND restaurants.owner_id = auth.uid()
  ));

CREATE POLICY "Public can view menu items"
  ON menu_items
  FOR SELECT
  TO public
  USING (EXISTS (
    SELECT 1 FROM menu_categories
    JOIN menus ON menus.id = menu_categories.menu_id
    WHERE menu_categories.id = category_id
    AND menus.is_active = true
  ));

-- Insert default subscription tiers
INSERT INTO subscription_tiers (name, max_menu_items, max_item_images, max_menus, max_categories, custom_qr_codes, special_offers)
VALUES
  ('Free', 20, 20, 1, 5, false, false),
  ('Advanced', 50, 50, 5, 20, true, true)
ON CONFLICT DO NOTHING;