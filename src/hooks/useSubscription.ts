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
  max_restaurants: number;
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
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 5;

  useEffect(() => {
    let isMounted = true;
    let timeoutId: NodeJS.Timeout | null = null;

    async function fetchSubscriptionTier() {
      // Prevent multiple concurrent fetches
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      // Skip if still loading profile or no profile exists
      if (isLoadingProfile || !profile) {
        if (isMounted) {
          setTier(null);
          setIsLoading(false);
        }
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Fetch default Free tier if no specific tier is assigned
        const tierId = profile.subscription_tier_id || 'free';
        
        // First try to get the specific tier
        let { data: tierData, error: tierError } = await supabase
          .from('subscription_tiers')
          .select()
          .eq('id', tierId)
          .single();

        // If not found, try to get the Free tier
        if (tierError) {
          const freeResult = await supabase
            .from('subscription_tiers')
            .select()
            .ilike('name', 'free')
            .single();
            
          tierData = freeResult.data;
          tierError = freeResult.error;
        }

        if (tierError) {
          // Fallback to default Free tier if fetch fails
          const defaultFreeTier = {
            id: 'free',
            name: 'Free',
            max_menu_items: 10,
            max_menus: 1,
            max_categories: 3,
            max_backgrounds: 1,
            max_custom_links: 0,
            max_restaurants: 1,
            custom_qr_codes: false,
            special_offers: false,
            regular_price: 0,
            discounted_price: null,
            discount_percentage: null,
            discount_ends_at: null
          };

          if (isMounted) {
            setTier(defaultFreeTier);
            setError('Could not fetch subscription tier. Using default Free tier.');
          }
        } else if (isMounted) {
          setTier(tierData);
        }
      } catch (err) {
        console.error('Unexpected error in subscription tier fetch:', err);
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Unexpected error fetching subscription tier');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    // Trigger fetch when profile changes or loading completes
    if (!isLoadingProfile) {
      fetchSubscriptionTier();
    }

    return () => {
      isMounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [profile, isLoadingProfile]);

  return { 
    tier, 
    isLoading: isLoading || isLoadingProfile,
    error,
    retryCount,
    // Add helper functions to check tier capabilities
    canAddMenu: (currentCount: number) => tier ? currentCount < tier.max_menus : false,
    canAddMenuItem: (currentCount: number) => tier ? currentCount < tier.max_menu_items : false,
    canAddCategory: (currentCount: number) => tier ? currentCount < tier.max_categories : false,
    canAddRestaurant: (currentCount: number) => tier ? currentCount < tier.max_restaurants : false,
  };
}
