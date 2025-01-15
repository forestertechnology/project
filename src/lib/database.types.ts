export interface Database {
  public: {
    Tables: {
      subscription_tiers: {
        Row: {
          id: string;
          name: string;
          max_menu_items: number;
          max_menus: number;
          max_categories: number;
          max_backgrounds: number;
          max_custom_links: number;
          max_restaurants: number;
          custom_qr_codes: boolean;
          special_offers: boolean;
          regular_price: number; // Changed to non-nullable with default 0
          discounted_price?: number | null;
          discount_percentage?: number | null; // Constrained between 0-100
          discount_ends_at?: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          max_menu_items: number;
          max_menus: number;
          max_categories: number;
          max_backgrounds: number;
          max_custom_links: number;
          max_restaurants: number;
          custom_qr_codes: boolean;
          special_offers: boolean;
          regular_price?: number; // Optional during insert, defaults to 0
          discounted_price?: number | null;
          discount_percentage?: number | null; // Optional, must be between 0-100 if provided
          discount_ends_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          max_menu_items?: number;
          max_menus?: number;
          max_categories?: number;
          max_backgrounds?: number;
          max_custom_links?: number;
          max_restaurants?: number;
          custom_qr_codes?: boolean;
          special_offers?: boolean;
          regular_price?: number;
          discounted_price?: number | null;
          discount_percentage?: number | null; // Optional, must be between 0-100 if provided
          discount_ends_at?: string | null;
          updated_at?: string;
        };
      };
      user_profiles: {
        Row: {
          id: string;
          first_name: string;
          last_name: string;
          phone_number: string | null;
          subscription_tier_id: string;
          is_admin: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          first_name: string;
          last_name: string;
          phone_number?: string | null;
          subscription_tier_id: string;
          is_admin?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          first_name?: string;
          last_name?: string;
          phone_number?: string | null;
          subscription_tier_id?: string;
          is_admin?: boolean;
          updated_at?: string;
        };
      };
      restaurants: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          location: string | null;
          logo_url: string | null;
          owner_id: string;
          facebook_url: string | null;
          twitter_url: string | null;
          instagram_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          location?: string | null;
          logo_url?: string | null;
          owner_id: string;
          facebook_url?: string | null;
          twitter_url?: string | null;
          instagram_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          location?: string | null;
          logo_url?: string | null;
          owner_id?: string;
          facebook_url?: string | null;
          twitter_url?: string | null;
          instagram_url?: string | null;
          updated_at?: string;
        };
      };
      menu_categories: {
        Row: {
          id: string;
          name: string;
          restaurant_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          restaurant_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          restaurant_id?: string;
          updated_at?: string;
        };
      };
      menu_items: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          price: number;
          category: string;
          restaurant_id: string;
          image_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          price: number;
          category: string;
          restaurant_id: string;
          image_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          price?: number;
          category?: string;
          restaurant_id?: string;
          image_url?: string | null;
          updated_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
