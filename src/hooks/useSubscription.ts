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
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 5;

  useEffect(() => {
    let isMounted = true;
    let timeoutId: NodeJS.Timeout;

    async function fetchSubscriptionTier() {
      try {
        // Don't fetch if profile is still loading
        if (isLoadingProfile) {
          return;
        }

        // If no profile exists, set to null and return
        if (!profile) {
          if (isMounted) {
            setTier(null);
            setIsLoading(false);
          }
          return;
        }

        setIsLoading(true);
        setError(null);

        // Clear any pending retry timeout
        if (timeoutId) {
          clearTimeout(timeoutId);
        }

        // Try to fetch the tier
        const { data: tierData, error: tierError } = await supabase
          .from('subscription_tiers')
          .select('*')
          .or(`id.eq.${profile.subscription_tier_id},name.eq.Free`)
          .order('id', { ascending: true })
          .limit(1)
          .single();

        if (tierError) {
          throw tierError;
        }

        if (isMounted) {
          setTier(tierData);
          setIsLoading(false);
          setRetryCount(0); // Reset retry count on success
        }
      } catch (err) {
        console.error('Error fetching subscription tier:', err);
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to fetch subscription tier');
          setIsLoading(false);
          
          // Retry with exponential backoff
          if (retryCount < maxRetries) {
            const delay = Math.min(1000 * Math.pow(2, retryCount), 30000); // Max 30s delay
            console.log(`Retrying subscription fetch in ${delay}ms (attempt ${retryCount + 1})`);
            timeoutId = setTimeout(() => {
              setRetryCount(prev => prev + 1);
              fetchSubscriptionTier();
            }, delay);
          }
        }
      }
    }

    // Fetch immediately if we have a profile and not loading
    if (profile && !isLoadingProfile) {
      fetchSubscriptionTier();
    } else if (!profile && !isLoadingProfile) {
      // If profile loading is done but no profile exists
      setTier(null);
      setIsLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [profile, profile?.subscription_tier_id, isLoadingProfile]);

  return { 
    tier, 
    isLoading: isLoading || isLoadingProfile,
    error,
    retryCount,
    // Add helper functions to check tier capabilities
    canAddMenu: (currentCount: number) => tier ? currentCount < tier.max_menus : false,
    canAddMenuItem: (currentCount: number) => tier ? currentCount < tier.max_menu_items : false,
    canAddCategory: (currentCount: number) => tier ? currentCount < tier.max_categories : false,
  };
}
