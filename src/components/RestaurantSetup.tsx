import React, { useState, useEffect } from 'react';
import { Building, MapPin } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../hooks/useSubscription';

interface RestaurantSetupProps {
  onRestaurantCreated?: () => void;
}

export default function RestaurantSetup({ onRestaurantCreated }: RestaurantSetupProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { profile } = useAuth();
  const { tier, isLoading: isLoadingTier, canAddRestaurant } = useSubscription();
  const [restaurantCount, setRestaurantCount] = useState(0);
  const [isLoadingCount, setIsLoadingCount] = useState(true);

  useEffect(() => {
    async function fetchRestaurantCount() {
      if (!profile) return;
      
      try {
        const { count, error } = await supabase
          .from('restaurants')
          .select('*', { count: 'exact', head: true })
          .eq('owner_id', profile.id);

        if (error) throw error;
        setRestaurantCount(count || 0);
      } catch (err) {
        console.error('Error fetching restaurant count:', err);
      } finally {
        setIsLoadingCount(false);
      }
    }

    fetchRestaurantCount();
  }, [profile]);

  const canCreate = canAddRestaurant(restaurantCount);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const { error: insertError } = await supabase
        .from('restaurants')
        .insert([
          {
            owner_id: profile!.id,
            name,
            description,
            location,
          },
        ]);

      if (insertError) throw insertError;
      if (onRestaurantCreated) {
        onRestaurantCreated();
      }
    } catch (err: any) {
      console.error('Error creating restaurant:', err);
      if (err.code === 'check_violation') {
        setError('You have reached the maximum number of restaurants for your subscription plan. Please upgrade your plan to add more restaurants.');
      } else {
        setError('Failed to create restaurant. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-md p-8 max-w-md w-full">
        <div className="flex items-center space-x-3 mb-6">
          <Building className="w-8 h-8 text-orange-500" />
          <h2 className="text-2xl font-bold text-gray-900">Set Up Your Restaurant</h2>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="restaurant-name" className="block text-sm font-medium text-gray-700">
              Restaurant Name
            </label>
            <input
              type="text"
              id="restaurant-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
              placeholder="Enter restaurant name"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
              placeholder="Brief description of your restaurant"
            />
          </div>

          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700">
              Location
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MapPin className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="block w-full pl-10 rounded-md border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                placeholder="Enter restaurant location"
              />
            </div>
          </div>

          {!isLoadingCount && !canCreate && (
            <div className="mb-6 bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg">
              You have reached the maximum number of restaurants ({tier?.max_restaurants}) for your subscription tier. 
              Please upgrade your plan to add more restaurants.
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !canCreate || isLoadingCount}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Creating...' : 'Create Restaurant'}
          </button>
        </form>
      </div>
    </div>
  );
}
