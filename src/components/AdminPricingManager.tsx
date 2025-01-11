import React, { useState, useEffect } from 'react';
import { Settings, Save, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface PricingTier {
  id: string;
  name: string;
  regular_price: number;
  discounted_price: number | null;
  discount_percentage: number | null;
  discount_ends_at: string | null;
}

export default function AdminPricingManager() {
  const [tiers, setTiers] = useState<PricingTier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { profile } = useAuth();

  useEffect(() => {
    fetchTiers();
  }, []);

  const fetchTiers = async () => {
    try {
      const { data, error } = await supabase
        .from('subscription_tiers')
        .select('*')
        .order('regular_price');

      if (error) throw error;
      setTiers(data || []);
    } catch (err) {
      console.error('Error fetching tiers:', err);
      setError('Failed to load subscription tiers');
    } finally {
      setIsLoading(false);
    }
  };

  const updateTier = async (
    tierId: string,
    updates: Partial<PricingTier>
  ) => {
    try {
      setError('');
      setSuccess('');

      const { error } = await supabase
        .from('subscription_tiers')
        .update(updates)
        .eq('id', tierId);

      if (error) throw error;

      setSuccess('Pricing updated successfully');
      fetchTiers();
    } catch (err) {
      console.error('Error updating tier:', err);
      setError('Failed to update pricing');
    }
  };

  const handleDiscountUpdate = (
    tierId: string,
    regularPrice: number,
    discountPercentage: number | null,
    durationDays: number | null
  ) => {
    const updates: Partial<PricingTier> = {
      regular_price: regularPrice,
    };

    if (discountPercentage) {
      updates.discount_percentage = discountPercentage;
      updates.discounted_price = regularPrice * (1 - discountPercentage / 100);
      updates.discount_ends_at = durationDays 
        ? new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString()
        : null;
    } else {
      updates.discount_percentage = null;
      updates.discounted_price = null;
      updates.discount_ends_at = null;
    }

    updateTier(tierId, updates);
  };

  if (!profile?.is_admin) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
        <div className="flex items-center space-x-2">
          <AlertCircle className="w-5 h-5" />
          <span>You don't have permission to manage pricing</span>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex items-center space-x-3 mb-6">
        <Settings className="w-6 h-6 text-orange-500" />
        <h2 className="text-xl font-semibold text-gray-900">Manage Subscription Pricing</h2>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}

      <div className="space-y-6">
        {tiers.map((tier) => (
          <div key={tier.id} className="border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{tier.name} Plan</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Regular Price ($)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={tier.regular_price}
                  onChange={(e) => {
                    const newPrice = parseFloat(e.target.value);
                    handleDiscountUpdate(
                      tier.id,
                      newPrice,
                      tier.discount_percentage,
                      tier.discount_ends_at 
                        ? Math.ceil((new Date(tier.discount_ends_at).getTime() - Date.now()) / (24 * 60 * 60 * 1000))
                        : null
                    );
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                  disabled={tier.name === 'Free'}
                />
              </div>

              {tier.name !== 'Free' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Discount Percentage (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={tier.discount_percentage || ''}
                      onChange={(e) => {
                        const percentage = e.target.value ? parseInt(e.target.value) : null;
                        handleDiscountUpdate(
                          tier.id,
                          tier.regular_price,
                          percentage,
                          tier.discount_ends_at 
                            ? Math.ceil((new Date(tier.discount_ends_at).getTime() - Date.now()) / (24 * 60 * 60 * 1000))
                            : 30
                        );
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>

                  {tier.discount_percentage && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Discount Duration (days)
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={tier.discount_ends_at 
                          ? Math.ceil((new Date(tier.discount_ends_at).getTime() - Date.now()) / (24 * 60 * 60 * 1000))
                          : 30}
                        onChange={(e) => {
                          const days = parseInt(e.target.value);
                          handleDiscountUpdate(
                            tier.id,
                            tier.regular_price,
                            tier.discount_percentage,
                            days
                          );
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>
                  )}
                </>
              )}
            </div>

            {tier.discounted_price && (
              <div className="mt-4 bg-orange-50 rounded-lg p-4">
                <div className="text-sm text-gray-600">
                  Current price: <span className="font-semibold text-orange-600">${tier.discounted_price.toFixed(2)}</span>
                  {tier.discount_ends_at && (
                    <> (ends {new Date(tier.discount_ends_at).toLocaleDateString()})</>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}