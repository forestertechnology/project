import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { QrCode, Utensils, Smartphone, Share2, ChefHat, Clock, ArrowRight, Check, RefreshCw, Store, Palette, Share, Building, Image, ImagePlus, FolderTree, ArrowUp, Bell } from 'lucide-react';
import { supabase } from '../lib/supabase';

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
  regular_price?: number;
  discounted_price?: number | null;
  discount_percentage?: number | null;
  discount_ends_at?: string | null;
}

export default function HomePage() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [subscriptionTiers, setSubscriptionTiers] = useState<SubscriptionTier[]>([]);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 500);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    fetchSubscriptionTiers();
  }, []);

  const fetchSubscriptionTiers = async () => {
    try {
      console.log('Fetching subscription tiers...');
      const { data, error } = await supabase
        .from('subscription_tiers')
        .select('*')
        .order('name');

      if (error) {
        console.error('Supabase error:', error);
        // Instead of throwing error, set default tiers
        setSubscriptionTiers([
          {
            id: 'free',
            name: 'Free',
            max_menu_items: 10,
            max_menus: 1,
            max_categories: 3,
            max_backgrounds: 1,
            max_custom_links: 0,
            custom_qr_codes: false,
            special_offers: false
          },
          {
            id: 'advanced',
            name: 'Advanced',
            max_menu_items: 50,
            max_menus: 3,
            max_categories: 10,
            max_backgrounds: 5,
            max_custom_links: 3,
            custom_qr_codes: true,
            special_offers: true,
            regular_price: 19.97
          }
        ]);
        return;
      }
      
      if (data && data.length > 0) {
        console.log('Received subscription tiers:', data);
        setSubscriptionTiers(data);
      } else {
        console.log('No subscription tiers data received, using defaults');
        setSubscriptionTiers([
          {
            id: 'free',
            name: 'Free',
            max_menu_items: 10,
            max_menus: 1,
            max_categories: 3,
            max_backgrounds: 1,
            max_custom_links: 0,
            custom_qr_codes: false,
            special_offers: false
          },
          {
            id: 'advanced',
            name: 'Advanced',
            max_menu_items: 50,
            max_menus: 3,
            max_categories: 10,
            max_backgrounds: 5,
            max_custom_links: 3,
            custom_qr_codes: true,
            special_offers: true,
            regular_price: 19.97
          }
        ]);
      }
    } catch (error) {
      console.error('Error fetching subscription tiers:', error);
      // Set default tiers on error
      setSubscriptionTiers([
        {
          id: 'free',
          name: 'Free',
          max_menu_items: 10,
          max_menus: 1,
          max_categories: 3,
          max_backgrounds: 1,
          max_custom_links: 0,
          custom_qr_codes: false,
          special_offers: false
        },
        {
          id: 'advanced',
          name: 'Advanced',
          max_menu_items: 50,
          max_menus: 3,
          max_categories: 10,
          max_backgrounds: 5,
          max_custom_links: 3,
          custom_qr_codes: true,
          special_offers: true,
          regular_price: 19.97
        }
      ]);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getFeatures = (tier: SubscriptionTier) => {
    if (tier.name.toLowerCase() === 'free') {
      return [
        `${tier.max_menus} Menu`,
        `${tier.max_menu_items} Menu Items`,
        `${tier.max_categories} Menu Categories`,
        'Social Share Icon on menu',
        'Item Image Upload',
        'Basic QR Code',
        `${tier.max_backgrounds} Backgrounds`
      ];
    } else {
      return [
        `${tier.max_menus} Menus`,
        `${tier.max_menu_items} Menu Items (per menu)`,
        `${tier.max_categories} Menu Categories (per menu)`,
        'Social Share Icon on menu',
        'Item Image Upload',
        '1 QR Code to Menus',
        `${tier.max_backgrounds} Backgrounds`,
        `${tier.max_custom_links} Custom Link`,
        'Special Items Section'
      ];
    }
  };

  const formatPrice = (tier: SubscriptionTier) => {
    if (tier.name.toLowerCase() === 'free') return 'Free';

    if (tier.discounted_price) {
      return (
        <div>
          <span className="text-2xl font-bold">${tier.discounted_price.toFixed(2)}</span>
          <span className="text-base font-normal text-gray-500">/month</span>
          <div className="mt-1">
            <span className="text-sm line-through text-gray-400">${tier.regular_price?.toFixed(2)}</span>
            <span className="ml-2 text-sm text-green-600">Save {tier.discount_percentage}%</span>
          </div>
        </div>
      );
    }

    return (
      <span>
        ${tier.regular_price?.toFixed(2)}
        <span className="text-base font-normal text-gray-500">/month</span>
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav>
        <div className="bg-white container mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center">
            <div className="flex items-center space-x-2">
              <QrCode className="w-8 h-8 text-orange-500" />
              <span className="text-2xl font-bold text-gray-900">QRMenu</span>
            </div>
            <div className="flex-1 flex justify-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-orange-500 transition-colors">Features</a>
              <a href="#how-it-works" className="text-gray-600 hover:text-orange-500 transition-colors">How It Works</a>
              <a href="#pricing" className="text-gray-600 hover:text-orange-500 transition-colors">Pricing</a>
            </div>
            <div className="flex items-center space-x-4">
              {!user ? (
                <>
                  <button
                    onClick={() => navigate('/login')}
                    className="text-gray-600 hover:text-orange-500 transition-colors"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => navigate('/signup')}
                    className="bg-orange-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-orange-600 transition-colors"
                  >
                    Get Started
                  </button>
                </>
              ) : (
                <button
                  onClick={() => navigate('/dashboard')}
                  className="bg-orange-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-orange-600 transition-colors"
                >
                  Dashboard
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="bg-gradient-to-b from-orange-50 to-orange-100/50">
        <div className="container mx-auto px-4 sm:px-6 py-20">
          <div className="flex items-center gap-12">
            <div className="flex-1">
              <h1 className="text-5xl font-bold text-gray-900 mb-6">
                Transform Your Menu into a Digital Experience
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Create beautiful digital menus, generate QR codes, and manage your restaurant's offerings with ease.
                No more printing costs, instant updates, and a better experience for your customers.
              </p>
              <div className="flex space-x-4">
                <button
                  onClick={() => navigate('/signup')}
                  className="bg-orange-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors flex items-center space-x-2 text-lg"
                >
                  <span>Get Started Free</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
                <a
                  href="#how-it-works"
                  className="bg-white text-gray-900 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors border border-gray-200 text-lg"
                >
                  See How It Works
                </a>
              </div>
            </div>
            <div className="flex-1">
              <img
                src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
                alt="Restaurant QR Menu Preview"
                className="rounded-xl shadow-2xl w-full"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Everything You Need to Go Digital */}
      <section id="features" className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Go Digital
            </h2>
            <p className="text-xl text-gray-600">
              A complete solution for your restaurant's digital presence
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="bg-orange-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Utensils className="w-8 h-8 text-orange-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Digital Menu Creation</h3>
              <p className="text-gray-600">Create and customize your digital menu with an easy-to-use interface</p>
            </div>
            <div className="text-center">
              <div className="bg-orange-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <QrCode className="w-8 h-8 text-orange-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">QR Code Generation</h3>
              <p className="text-gray-600">Generate unique QR codes for each menu that customers can scan</p>
            </div>
            <div className="text-center">
              <div className="bg-orange-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Smartphone className="w-8 h-8 text-orange-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Mobile-First Design</h3>
              <p className="text-gray-600">Menus are optimized for perfect viewing on any mobile device</p>
            </div>
            <div className="text-center">
              <div className="bg-orange-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Share2 className="w-8 h-8 text-orange-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Easy Sharing</h3>
              <p className="text-gray-600">Share your menu across multiple platforms and locations instantly</p>
            </div>
            <div className="text-center">
              <div className="bg-orange-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <ChefHat className="w-8 h-8 text-orange-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Menu Customization</h3>
              <p className="text-gray-600">Full control over categories, items, prices, and special offers</p>
            </div>
            <div className="text-center">
              <div className="bg-orange-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Clock className="w-8 h-8 text-orange-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Real-Time Updates</h3>
              <p className="text-gray-600">Update your menu instantly without reprinting or rescanning</p>
            </div>
            <div className="text-center">
              <div className="bg-orange-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Building className="w-8 h-8 text-orange-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Restaurant Info</h3>
              <p className="text-gray-600">Add restaurant title, logo and description to showcase your brand</p>
            </div>
            <div className="text-center">
              <div className="bg-orange-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Palette className="w-8 h-8 text-orange-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Edit Background</h3>
              <p className="text-gray-600">Customize your background with colors or images</p>
            </div>
            <div className="text-center">
              <div className="bg-orange-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Image className="w-8 h-8 text-orange-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Menu Images</h3>
              <p className="text-gray-600">Include appetizing images alongside your menu items</p>
            </div>
            <div className="text-center">
              <div className="bg-orange-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <FolderTree className="w-8 h-8 text-orange-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Categories</h3>
              <p className="text-gray-600">Organize menu items into customizable categories for better navigation</p>
            </div>
            <div className="text-center">
              <div className="bg-orange-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Bell className="w-8 h-8 text-orange-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Special Items</h3>
              <p className="text-gray-600">Highlight special menu items and promotions to attract customers</p>
            </div>
          </div>
        </div>
      </section>

      {/* Simple Steps to Get Started */}
      <section className="py-20 bg-orange-50">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Simple Steps to Get Started
            </h2>
            <p className="text-xl text-gray-600">
              Launch your digital menu in minutes, not days
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 shadow-md">
                <span className="text-2xl font-bold text-orange-500">1</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Sign Up</h3>
              <p className="text-gray-600">Create your free account in seconds</p>
            </div>
            <div className="text-center">
              <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 shadow-md">
                <span className="text-2xl font-bold text-orange-500">2</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Add Menu Items</h3>
              <p className="text-gray-600">Input your menu items and prices</p>
            </div>
            <div className="text-center">
              <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 shadow-md">
                <span className="text-2xl font-bold text-orange-500">3</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Customize</h3>
              <p className="text-gray-600">Add your branding and style</p>
            </div>
            <div className="text-center">
              <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 shadow-md">
                <span className="text-2xl font-bold text-orange-500">4</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Share</h3>
              <p className="text-gray-600">Get your QR code and go live</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Get your digital menu up and running in minutes
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="bg-orange-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Store className="w-8 h-8 text-orange-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Create Your Profile</h3>
              <p className="text-gray-600">Sign up and set up your restaurant's profile with basic information</p>
            </div>
            <div className="text-center">
              <div className="bg-orange-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Utensils className="w-8 h-8 text-orange-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Add Your Menu</h3>
              <p className="text-gray-600">Create categories and add your menu items with descriptions and prices</p>
            </div>
            <div className="text-center">
              <div className="bg-orange-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <QrCode className="w-8 h-8 text-orange-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Share Your QR Code</h3>
              <p className="text-gray-600">Generate and download your QR code to display in your restaurant</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Select a Plan
            </h2>
            <p className="text-xl text-gray-600">
              Choose the plan that best fits your needs
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {subscriptionTiers.map((tier, index) => (
              <div key={tier.id} className={`${index === 1 ? 'bg-orange-50' : 'bg-white'} rounded-xl p-8 ${tier.name === 'Advanced' ? 'ring-2 ring-orange-500 shadow-xl' : 'border border-gray-200'}`}>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{tier.name}</h3>
                <div className="mb-6">
                  {formatPrice(tier)}
                </div>
                <ul className="space-y-4 mb-8">
                  {getFeatures(tier).map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center space-x-3">
                      <Check className="w-5 h-5 text-orange-500 flex-shrink-0" />
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => navigate('/signup')}
                  className={`w-full py-2 rounded-lg font-semibold transition-colors ${
                    tier.name === 'Advanced'
                      ? 'bg-orange-500 text-white hover:bg-orange-600'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  Get Started
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Back to Top Button */}
      <button
        onClick={scrollToTop}
        className={`fixed right-8 bottom-8 bg-orange-500 text-white p-3 rounded-full shadow-lg hover:bg-orange-600 transition-all duration-300 ${
          showBackToTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
        }`}
        aria-label="Back to top"
      >
        <ArrowUp className="w-6 h-6" />
      </button>
    </div>
  );
}
