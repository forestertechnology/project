import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, Building2, MenuSquare, Share2, CreditCard } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../hooks/useSubscription';
import RestaurantProfile from '../components/RestaurantProfile';
import SocialMediaLinks from '../components/SocialMediaLinks';
import AccountProfile from '../components/AccountProfile';
import RestaurantSetup from '../components/RestaurantSetup';
import BillingInfo from '../components/BillingInfo';
import MenuManagement from '../components/MenuManagement';

interface Restaurant {
  id: string;
  name: string;
  description: string | null;
  location: string | null;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { signOut, profile, isLoading: isLoadingProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('account');
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [isLoadingRestaurant, setIsLoadingRestaurant] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { tier, isLoading: isLoadingTier, error: tierError } = useSubscription();

  // Tab configuration
  const tabs = [
    { id: 'account', label: 'Account', icon: User },
    { id: 'restaurants', label: 'Restaurant(s)', icon: Building2 },
    { id: 'menus', label: 'Menu(s)', icon: MenuSquare },
    { id: 'social', label: 'Social Links', icon: Share2 },
    { id: 'billing', label: 'Billing', icon: CreditCard }
  ];

  const fetchRestaurant = async () => {
    if (!profile?.id) {
      console.log('No profile ID found:', profile);
      return;
    }

    console.log('Fetching restaurant for profile ID:', profile.id);
    
    try {
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('owner_id', profile.id)
        .limit(1);

      if (error) throw error;

      if (data && data.length > 0) {
        setRestaurant(data[0]);
        console.log('Restaurant data:', data[0]);
      } else {
        setRestaurant(null);
        console.log('No restaurants found for this user');
      }
    } catch (error: any) {
      console.error('Error:', error);
      setRestaurant(null);
    } finally {
      setIsLoadingRestaurant(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    // Handle tab visibility changes
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // When tab becomes visible, check auth state
        supabase.auth.getSession().then(({ data: { session } }) => {
          if (!session) {
            navigate('/login');
          }
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    fetchRestaurant();

    return () => {
      isMounted = false;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [profile]);

  // Prevent multiple restaurants for free/advanced plans
  useEffect(() => {
    if (tier && ['free', 'advanced'].includes(tier.name.toLowerCase()) && restaurant && profile?.id) {
      // Check if user already has a restaurant
      supabase
        .from('restaurants')
        .select('*', { count: 'exact', head: true })
        .eq('owner_id', profile.id)
        .then(({ count }) => {
          if (count && count > 1) {
            setError('Your plan only allows one restaurant. Please delete other restaurants before creating a new one.');
          }
        });
    }
  }, [tier, restaurant, profile?.id]);

  // Show loading state while fetching data
  if (isLoadingProfile || isLoadingRestaurant || isLoadingTier) {
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

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <button
              onClick={signOut}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
            >
              <LogOut className="w-5 h-5 mr-2" />
              Log Out
            </button>
          </div>
          <div className="bg-white shadow rounded-lg p-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome to QRMenu!</h2>
            <p className="text-gray-600 mb-6">Get started by setting up your restaurant profile.</p>
            <RestaurantSetup onRestaurantCreated={() => {
              setIsLoadingRestaurant(true);
              fetchRestaurant();
            }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with logout button */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <button
            onClick={signOut}
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
          >
            <LogOut className="w-5 h-5 mr-2" />
            Log Out
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center px-4 py-2 border-b-2 font-medium text-sm
                  ${activeTab === tab.id 
                    ? 'border-orange-500 text-orange-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                `}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-white shadow rounded-lg">
          {activeTab === 'account' && <AccountProfile />}
          {activeTab === 'restaurants' && <RestaurantProfile />}
          {activeTab === 'menus' && <MenuManagement />}
          {activeTab === 'social' && <SocialMediaLinks />}
          {activeTab === 'billing' && <BillingInfo />}
        </div>
      </div>
    </div>
  );
}
