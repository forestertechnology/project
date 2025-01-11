import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { useEffect, useState } from 'react';

interface SubscriptionTier {
  id: string;
  name: string;
  max_menu_items: number;
  max_menus: number;
  max_categories: number;
  max_backgrounds: number;
  max_custom_links: number;
  custom_qr_codes: boolean;
  special_offers: boolean;
  regular_price: number;
  discounted_price: number | null;
  discount_percentage: number | null;
  discount_ends_at: string | null;
}

export function useSubscription() {
  const { profile, isLoading: isLoadingProfile } = useAuth();
  const [tier, setTier] = useState<SubscriptionTier | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchSubscriptionTier() {
      try {
        // Don't fetch if profile is still loading
        if (isLoadingProfile) return;

        setIsLoading(true);
        setError(null);

        // First try to fetch by subscription_tier_id if available
        if (profile?.subscription_tier_id) {
          const { data: tierData, error: tierError } = await supabase
            .from('subscription_tiers')
            .select('*')
            .eq('id', profile.subscription_tier_id)
            .single();

          if (tierError) {
            console.error('Error fetching tier by ID:', tierError);
            // If tier not found by ID, fallback to free tier
          } else if (tierData && isMounted) {
            setTier(tierData);
            setIsLoading(false);
            return;
          }
        }

        // Fallback to free tier
        const { data: freeData, error: freeError } = await supabase
          .from('subscription_tiers')
          .select('*')
          .eq('name', 'Free')
          .single();

        if (freeError) {
          throw new Error('Failed to fetch subscription tier');
        }

        if (isMounted) {
          setTier(freeData);
        }
      } catch (err) {
        console.error('Error fetching subscription tier:', err);
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to fetch subscription tier');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchSubscriptionTier();

    return () => {
      isMounted = false;
    };
  }, [profile?.subscription_tier_id, isLoadingProfile]);

  return { 
    tier, 
    isLoading: isLoading || isLoadingProfile,
    error,
    // Add helper functions to check tier capabilities
    canAddMenu: (currentCount: number) => tier ? currentCount < tier.max_menus : false,
    canAddMenuItem: (currentCount: number) => tier ? currentCount < tier.max_menu_items : false,
    canAddCategory: (currentCount: number) => tier ? currentCount < tier.max_categories : false,
  };
}