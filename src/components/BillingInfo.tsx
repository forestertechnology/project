import React from 'react';
import { useSubscription } from '../hooks/useSubscription';
import { CreditCard, DollarSign, Crown } from 'lucide-react';

export default function BillingInfo() {
  const { tier, isLoading: isLoadingTier, error: tierError } = useSubscription();

  if (isLoadingTier) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-6 h-6 border-2 border-orange-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (tierError) {
    return (
      <div className="text-red-600 p-8">
        <p>Failed to load billing information.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Current Plan</h3>
          <div className="flex items-start space-x-4">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Crown className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">{tier?.name || 'Free'} Plan</p>
              <p className="text-sm text-gray-500">
                {tier?.discounted_price ? (
                  <>
                    <span className="line-through mr-2">${tier.regular_price}</span>
                    <span className="text-green-600">${tier.discounted_price}/month</span>
                  </>
                ) : (
                  tier?.regular_price ? `$${tier.regular_price}/month` : 'Free'
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Method</h3>
          <div className="flex items-start space-x-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <CreditCard className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <button className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors">
                Update Payment Method
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Billing History</h3>
          <div className="flex items-start space-x-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div className="flex-1">
              <div className="border rounded-lg divide-y">
                <div className="p-4 flex justify-between items-center">
                  <div>
                    <p className="font-medium">Last Payment</p>
                    <p className="text-sm text-gray-500">No payment history available</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
