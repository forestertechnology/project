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
  const { signOut, profile, isLoading: isLoadingProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [isLoadingRestaurant, setIsLoadingRestaurant] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { tier, isLoading: isLoadingTier, error: tierError } = useSubscription();

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

    async function fetchRestaurant() {
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

        if (isMounted) {
          if (data && data.length > 0) {
            setRestaurant(data[0]);
            console.log('Restaurant data:', data[0]);
          } else {
            setRestaurant(null);
            console.log('No restaurants found for this user');
          }
        }
      } catch (error: any) {
        console.error('Error:', error);
        if (isMounted) {
          setRestaurant(null);
        }
      } finally {
        if (isMounted) {
          setIsLoadingRestaurant(false);
        }
      }
    }

    fetchRestaurant();

    return () => {
      isMounted = false;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [profile]);

  // Redirect to setup if no restaurant exists
  useEffect(() => {
    if (!isLoadingRestaurant && !restaurant) {
      // Check if user is on free or advanced plan
      if (tier && ['free', 'advanced'].includes(tier.name.toLowerCase())) {
        navigate('/setup');
      } else {
        // For other plans, show error
        setError('No restaurant found for your account');
      }
    }
  }, [isLoadingRestaurant, restaurant, navigate, tier]);

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
            setError('Your plan only allows one restaurant');
            navigate('/setup');
          }
        });
    }
  }, [tier, restaurant, profile?.id, navigate]);

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
    return null; // Should never reach here due to redirection
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Restaurant Profile Section */}
          <div className="col-span-2">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {restaurant.name}
              </h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-700">Description</h3>
                  <p className="text-gray-600 mt-1">
                    {restaurant.description || 'No description provided'}
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-700">Location</h3>
                  <p className="text-gray-600 mt-1">
                    {restaurant.location || 'No location provided'}
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-700">Subscription Plan</h3>
                  {isLoadingTier ? (
                    <div className="mt-1 flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-orange-500 rounded-full animate-spin" />
                      <p className="text-gray-600">Loading plan information...</p>
                    </div>
                  ) : tierError ? (
                    <p className="text-red-600 mt-1">Failed to load plan information</p>
                  ) : tier ? (
                    <div className="mt-1 space-y-1">
                      <p className="text-gray-600">
                        {tier.name} Plan
                      </p>
                      <p className="text-sm text-gray-500">
                        {tier.discounted_price ? (
                          <>
                            <span className="line-through mr-2">${tier.regular_price}</span>
                            <span className="text-green-600">${tier.discounted_price}</span>
                          </>
                        ) : (
                          `$${tier.regular_price}`
                        )}
                      </p>
                    </div>
                  ) : (
                    <p className="text-gray-600 mt-1">No active subscription</p>
                  )}
                </div>

                <button
                  onClick={() => navigate('/setup')}
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                >
                  Edit Restaurant Info
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="col-span-1">
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-700 mb-4">
                Quick Actions
              </h3>
              
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/create-menu')}
                  className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-500 hover:bg-green-600"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create New Menu
                </button>

                <button
                  onClick={() => navigate('/setup')}
                  className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-500 hover:bg-blue-600"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Edit Restaurant
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
