import React, { useState, useEffect } from "react";
import { Facebook, Twitter, Instagram, Share2, AlertCircle, CheckCircle } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";

interface SocialLinks {
  facebook: string;
  twitter: string;
  instagram: string;
}

export default function SocialMediaLinks() {
  const { profile } = useAuth();
  const [socialLinks, setSocialLinks] = useState<SocialLinks>({
    facebook: "",
    twitter: "",
    instagram: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (profile?.id) {
      fetchSocialLinks();
    }
  }, [profile?.id]);

  const fetchSocialLinks = async () => {
    try {
      const { data, error } = await supabase
        .from("restaurants")
        .select("facebook_url, twitter_url, instagram_url")
        .eq("owner_id", profile?.id)
        .single();

      if (error) throw error;

      if (data) {
        setSocialLinks({
          facebook: data.facebook_url || "",
          twitter: data.twitter_url || "",
          instagram: data.instagram_url || ""
        });
      }
    } catch (error: any) {
      console.error("Error fetching social links:", error.message);
    }
  };

  const handleSocialLinkChange = (platform: keyof typeof socialLinks, value: string) => {
    setSocialLinks(prev => ({ ...prev, [platform]: value }));
    setMessage(null);
  };

  const handleSave = async () => {
    if (!profile?.id) return;

    try {
      setIsLoading(true);
      const { error } = await supabase
        .from("restaurants")
        .update({
          facebook_url: socialLinks.facebook,
          twitter_url: socialLinks.twitter,
          instagram_url: socialLinks.instagram
        })
        .eq("owner_id", profile.id);

      if (error) throw error;

      setMessage({ type: "success", text: "Social media links updated successfully!" });
    } catch (error: any) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setIsLoading(false);
    }
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

        {message && (
          <div className={`
            flex items-center space-x-2 p-4 rounded-lg mb-4
            ${message.type === "success" 
              ? "bg-green-50 text-green-800" 
              : "bg-red-50 text-red-800"}
          `}>
            {message.type === "success" 
              ? <CheckCircle className="w-5 h-5 text-green-600" /> 
              : <AlertCircle className="w-5 h-5 text-red-600" />}
            <p>{message.text}</p>
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleSave}
            disabled={isLoading}
            className={`
              flex items-center justify-center px-4 py-2 rounded-lg font-semibold transition-colors
              ${isLoading 
                ? "bg-orange-300 text-white cursor-not-allowed" 
                : "bg-orange-500 text-white hover:bg-orange-600"}
            `}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white rounded-full animate-spin border-t-transparent" />
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
