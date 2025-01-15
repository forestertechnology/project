import React, { useState, useEffect } from "react";
import { Building, MapPin, Upload, AlertCircle, CheckCircle } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import Tooltip from "./Tooltip";

interface Restaurant {
  id: string;
  name: string;
  description: string | null;
  location: string | null;
  logo_url: string | null;
}

export default function RestaurantProfile() {
  const { profile } = useAuth();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [logo, setLogo] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (profile?.id) {
      fetchRestaurant();
    }
  }, [profile?.id]);

  const fetchRestaurant = async () => {
    try {
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('owner_id', profile?.id)
        .single();

      if (error) throw error;

      if (data) {
        setRestaurant(data);
        setName(data.name);
        setDescription(data.description || '');
        setLocation(data.location || '');
        setLogo(data.logo_url);
      }
    } catch (error: any) {
      console.error('Error fetching restaurant:', error.message);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !restaurant) return;

    try {
      setIsLoading(true);
      
      // Upload image to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${restaurant.id}-logo.${fileExt}`;
      const { error: uploadError, data } = await supabase.storage
        .from('restaurant-logos')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('restaurant-logos')
        .getPublicUrl(fileName);

      // Update restaurant record with new logo URL
      const { error: updateError } = await supabase
        .from('restaurants')
        .update({ logo_url: publicUrl })
        .eq('id', restaurant.id);

      if (updateError) throw updateError;

      setLogo(publicUrl);
      setMessage({ type: 'success', text: 'Logo updated successfully!' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!restaurant || !profile?.id) return;

    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('restaurants')
        .update({
          name,
          description,
          location,
        })
        .eq('id', restaurant.id)
        .eq('owner_id', profile.id);

      if (error) throw error;

      setMessage({ type: 'success', text: 'Restaurant information updated successfully!' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Restaurant Profile</h2>
      
      {message && (
        <div className={`
          flex items-center space-x-2 p-4 rounded-lg mb-6
          ${message.type === 'success' 
            ? 'bg-green-50 text-green-800' 
            : 'bg-red-50 text-red-800'}
        `}>
          {message.type === 'success' 
            ? <CheckCircle className="w-5 h-5 text-green-600" /> 
            : <AlertCircle className="w-5 h-5 text-red-600" />}
          <p>{message.text}</p>
        </div>
      )}

      <div className="space-y-6">
        {/* Logo Upload */}
        <div className="flex items-start space-x-6">
          <div className="flex-shrink-0">
            <div className="relative">
              <div className="w-[250px] h-[250px] rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 overflow-hidden">
                {logo ? (
                  <img src={logo} alt="Restaurant logo" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-1 text-sm text-gray-500">Upload logo</p>
                    <p className="mt-1 text-xs text-gray-400">250x250 pixels recommended</p>
                  </div>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
          </div>

          <div className="flex-1 space-y-4">
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
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description (10 words max)
              </label>
              <div>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                  placeholder="Brief description of your restaurant"
                />
              </div>
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
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleSave}
            disabled={isLoading}
            className={`
              flex items-center justify-center px-4 py-2 rounded-lg font-semibold transition-colors
              ${isLoading 
                ? 'bg-orange-300 text-white cursor-not-allowed' 
                : 'bg-orange-500 text-white hover:bg-orange-600'}
            `}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white rounded-full animate-spin border-t-transparent" />
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
