import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { QrCode, Plus, Settings, LogOut, Menu as MenuIcon, Share2, BarChart3, User, Crown, DollarSign } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../hooks/useSubscription';
import Tooltip from '../components/Tooltip';
import RestaurantProfile from '../components/RestaurantProfile';
import SocialMediaLinks from '../components/SocialMediaLinks';
import AccountProfile from '../components/AccountProfile';
import RestaurantSetup from '../components/RestaurantSetup';
import AdminPricingManager from '../components/AdminPricingManager';

interface Restaurant {
  id: string;
  name: string;
  description: string | null;
  location: string | null;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { signOut, profile } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { tier, isLoading: isLoadingTier, error: tierError } = useSubscription();

  useEffect(() => {
    let isMounted = true;

    async function fetchRestaurant() {
      if (!profile) return;

      try {
        const { data, error } = await supabase
          .from('restaurants')
          .select('*')
          .eq('owner_id', profile.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching restaurant:', error);
        }

        if (isMounted) {
          setRestaurant(data);
        }
      } catch (err) {
        console.error('Error:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchRestaurant();

    return () => {
      isMounted = false;
    };
  }, [profile]);

  // Show loading state while fetching data
  if (isLoading || isLoadingTier) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-orange-500 border-r-transparent"></div>
          <p className="mt-2 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Show error state if subscription tier failed to load
  if (tierError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center text-red-600">
          <p>Failed to load subscription data.</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 text-orange-500 hover:text-orange-600 font-medium"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  // Rest of your component remains the same...
  // (keeping existing code)
}