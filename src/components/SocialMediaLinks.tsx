import React, { useState } from 'react';
import { Facebook, Twitter, Instagram, Share2 } from 'lucide-react';

export default function SocialMediaLinks() {
  const [socialLinks, setSocialLinks] = useState({
    facebook: '',
    twitter: '',
    instagram: ''
  });

  const handleSocialLinkChange = (platform: keyof typeof socialLinks, value: string) => {
    setSocialLinks(prev => ({ ...prev, [platform]: value }));
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex items-center space-x-3 mb-6">
        <Share2 className="w-6 h-6 text-orange-500" />
        <h2 className="text-xl font-semibold text-gray-900">Social Media Links</h2>
      </div>
      
      <div className="space-y-6">
        <p className="text-gray-600">
          Connect your restaurant's social media accounts to share your menu and updates with your customers.
        </p>

        <div className="space-y-4">
          <div>
            <label htmlFor="facebook" className="block text-sm font-medium text-gray-700">
              Facebook
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Facebook className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="url"
                id="facebook"
                value={socialLinks.facebook}
                onChange={(e) => handleSocialLinkChange('facebook', e.target.value)}
                className="block w-full pl-10 rounded-md border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                placeholder="https://facebook.com/your-restaurant"
              />
            </div>
          </div>

          <div>
            <label htmlFor="twitter" className="block text-sm font-medium text-gray-700">
              X Profile
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Twitter className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="url"
                id="twitter"
                value={socialLinks.twitter}
                onChange={(e) => handleSocialLinkChange('twitter', e.target.value)}
                className="block w-full pl-10 rounded-md border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                placeholder="https://twitter.com/your-restaurant"
              />
            </div>
          </div>

          <div>
            <label htmlFor="instagram" className="block text-sm font-medium text-gray-700">
              Instagram
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Instagram className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="url"
                id="instagram"
                value={socialLinks.instagram}
                onChange={(e) => handleSocialLinkChange('instagram', e.target.value)}
                className="block w-full pl-10 rounded-md border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                placeholder="https://instagram.com/your-restaurant"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            className="bg-orange-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-orange-600 transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}