import React, { useState, useEffect, ChangeEvent } from 'react';
import { QrCode, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface SubscriptionTier {
  id: string;
  name: string;
  max_menu_items: number;
  max_item_images: number;
  max_menus: number;
  max_categories: number;
  custom_qr_codes: boolean;
  special_offers: boolean;
  regular_price: number;
  discounted_price: number | null;
  discount_percentage: number | null;
  discount_ends_at: string | null;
}

export default function SignUp() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingTiers, setIsLoadingTiers] = useState(true);
  const [subscriptionTiers, setSubscriptionTiers] = useState<SubscriptionTier[]>([]);
  const navigate = useNavigate();
  const { signUp } = useAuth();

  useEffect(() => {
    let isMounted = true;

    async function fetchSubscriptionTiers() {
      try {
        const { data, error } = await supabase
          .from('subscription_tiers')
          .select('*')
          .order('max_menu_items');

        if (error) throw error;

        if (isMounted && data) {
          setSubscriptionTiers(data);
          if (data.length > 0) {
            const freeTier = data.find(tier => tier.name.toLowerCase() === 'free');
            setSelectedPlan(freeTier?.id || data[0].id);
          }
        }
      } catch (err) {
        console.error('Error fetching subscription tiers:', err);
        if (isMounted) {
          setError('Failed to load subscription plans. Please try again.');
        }
      } finally {
        if (isMounted) {
          setIsLoadingTiers(false);
        }
      }
    }

    fetchSubscriptionTiers();

    return () => {
      isMounted = false;
    };
  }, []);

  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (!selectedPlan) {
      setError('Please select a subscription plan');
      setIsLoading(false);
      return;
    }

    try {
      const result = await signUp(email, password, {
        first_name: firstName,
        last_name: lastName,
        phone_number: mobileNumber || null,
        subscription_tier_id: selectedPlan,
        is_admin: false,
      });

      if (result?.emailConfirmation) {
        setEmailSent(true);
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Signup error:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to create account. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<string>>) => {
    setter(e.target.value);
  };

  const getFeatures = (tier: SubscriptionTier): string[] => {
    if (tier.name.toLowerCase() === 'free') {
      return [
        `${tier.max_menus} Menu`,
        `${tier.max_menu_items} Menu Items`,
        `${tier.max_categories} Menu Categories`,
        'Social Share Icon on menu',
        `${tier.max_item_images} Item Images`,
        'Basic QR Code',
        'Background Colors'
      ];
    } else {
      return [
        `${tier.max_menus} Menus`,
        `${tier.max_menu_items} Menu Items (per menu)`,
        `${tier.max_categories} Menu Categories (per menu)`,
        'Social Share Icon on menu',
        `${tier.max_item_images} Item Images`,
        'Custom QR Codes',
        'Special Offers'
      ];
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <button 
          onClick={() => navigate('/')} 
          className="mx-auto flex items-center justify-center space-x-2 hover:opacity-80 transition-opacity"
        >
          <QrCode className="w-10 h-10 text-orange-500" />
          <span className="text-3xl font-bold text-gray-900">QRMenu</span>
        </button>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <button
            onClick={() => navigate('/login')}
            className="font-medium text-orange-600 hover:text-orange-500"
          >
            Sign in
          </button>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {emailSent ? (
            <div className="text-center py-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Verify your email
              </h3>
              <p className="text-gray-600">
                We've sent you an email with a link to verify your account. Please check your inbox and follow the instructions.
              </p>
              <p className="mt-4 text-sm text-gray-500">
                Didn't receive the email?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setError('');
                    setIsLoading(true);
                    handleSubmit(new Event('submit') as unknown as React.FormEvent<HTMLFormElement>)
                      .finally(() => setIsLoading(false));
                  }}
                  className="text-orange-600 hover:text-orange-500 font-medium"
                >
                  Resend verification email
                </button>
              </p>
            </div>
          ) : (
            <form className="space-y-8" onSubmit={handleSubmit}>
            {/* Personal Information */}
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                    First name
                  </label>
                  <div className="mt-1">
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => handleInputChange(e, setFirstName)}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                    Last name
                  </label>
                  <div className="mt-1">
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => handleInputChange(e, setLastName)}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="mobile" className="block text-sm font-medium text-gray-700">
                  Mobile number
                </label>
                <div className="mt-1">
                  <input
                    id="mobile"
                    name="mobile"
                    type="tel"
                    value={mobileNumber}
                    onChange={(e) => handleInputChange(e, setMobileNumber)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => handleInputChange(e, setEmail)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={password}
                    onChange={(e) => handleInputChange(e, setPassword)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">
                  Confirm password
                </label>
                <div className="mt-1">
                  <input
                    id="confirm-password"
                    name="confirm-password"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={confirmPassword}
                    onChange={(e) => handleInputChange(e, setConfirmPassword)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
              </div>
            </div>

            {/* Plan Selection */}
            <div className="space-y-4 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Select your plan
              </h3>
              {isLoadingTiers ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-orange-500 border-r-transparent"></div>
                  <p className="mt-2 text-gray-600">Loading subscription plans...</p>
                </div>
              ) : subscriptionTiers.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {subscriptionTiers.map((tier) => (
                    <div
                      key={tier.id}
                      onClick={() => setSelectedPlan(tier.id)}
                      className={`relative rounded-lg p-6 cursor-pointer transition-all ${
                        selectedPlan === tier.id
                          ? 'border-2 border-orange-500 bg-orange-50 ring-2 ring-orange-200'
                          : 'border border-gray-200 hover:border-orange-300 hover:shadow-md'
                      }`}
                    >
                      {/* Plan Header */}
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 capitalize">{tier.name}</h3>
                          <p className="mt-1 text-2xl font-bold text-gray-900">
                            {tier.name.toLowerCase() === 'free' ? (
                              'Free'
                            ) : (
                              <span>
                                ${tier.discounted_price || tier.regular_price}
                                {tier.discounted_price && (
                                  <span className="ml-2 text-base font-normal text-gray-500 line-through">
                                    ${tier.regular_price}
                                  </span>
                                )}
                                <span className="text-base font-normal text-gray-500">/month</span>
                              </span>
                            )}
                          </p>
                        </div>
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            selectedPlan === tier.id
                              ? 'border-orange-500 bg-orange-500'
                              : 'border-gray-300'
                          }`}
                        >
                          {selectedPlan === tier.id && (
                            <Check className="w-3 h-3 text-white" />
                          )}
                        </div>
                      </div>

                      {/* Plan Description */}
                      <p className="text-sm text-gray-600 mb-4">
                        {tier.name.toLowerCase() === 'free' 
                          ? 'Perfect for getting started with digital menus'
                          : 'Ideal for growing restaurants with multiple menus'
                        }
                      </p>

                      {/* Features List */}
                      <ul className="space-y-3">
                        {getFeatures(tier).map((feature, index) => (
                          <li key={index} className="flex items-start text-sm">
                            <Check className="w-4 h-4 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-600">{feature}</span>
                          </li>
                        ))}
                      </ul>

                      {/* Plan Badge */}
                      {tier.name.toLowerCase() === 'advanced' && (
                        <div className="absolute -top-2 -right-2">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                            Popular
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-red-600">
                  <p>Unable to load subscription plans.</p>
                  <button
                    type="button"
                    onClick={() => window.location.reload()}
                    className="mt-2 text-orange-500 hover:text-orange-600 font-medium"
                  >
                    Try again
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div className="flex items-center">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  required
                  className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                />
                <label htmlFor="terms" className="ml-2 block text-sm text-gray-900">
                  I agree to the{' '}
                  <a href="#" className="font-medium text-orange-600 hover:text-orange-500">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="#" className="font-medium text-orange-600 hover:text-orange-500">
                    Privacy Policy
                  </a>
                </label>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading || !selectedPlan || isLoadingTiers}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Creating account...' : 'Create account'}
                </button>
              </div>
            </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
