import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Lock, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export default function AccountProfile() {
  const { profile: authProfile, user } = useAuth();
  const [profile, setProfile] = useState({
    firstName: authProfile?.first_name || '',
    lastName: authProfile?.last_name || '',
    email: user?.email || '',
    phone: authProfile?.phone_number || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    // Update form when auth profile changes
    if (authProfile && user) {
      setProfile({
        firstName: authProfile.first_name || '',
        lastName: authProfile.last_name || '',
        email: user.email || '',
        phone: authProfile.phone_number || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    }
  }, [authProfile, user]);

  const handleChange = (field: keyof typeof profile, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
    setMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      // Validate password change
      if (profile.newPassword) {
        if (profile.newPassword !== profile.confirmPassword) {
          throw new Error('New passwords do not match');
        }

        // Reauthenticate user before password change
        const { error: reauthError } = await supabase.auth.signInWithPassword({
          email: user?.email || '',
          password: profile.currentPassword
        });

        if (reauthError) throw reauthError;

        // Update password
        const { error: passwordError } = await supabase.auth.updateUser({
          password: profile.newPassword
        });

        if (passwordError) throw passwordError;
      }

      // Update profile information
      const { error: profileError } = await supabase
        .from('user_profiles')
        .update({
          first_name: profile.firstName,
          last_name: profile.lastName,
          phone_number: profile.phone
        })
        .eq('id', authProfile?.id);

      if (profileError) throw profileError;

      // Reset password fields and show success message
      setProfile(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));

      setMessage({
        type: 'success', 
        text: 'Profile updated successfully!'
      });
    } catch (error: any) {
      setMessage({
        type: 'error', 
        text: error.message || 'Failed to update profile'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex items-center space-x-3 mb-6">
        <User className="w-6 h-6 text-orange-500" />
        <h2 className="text-xl font-semibold text-gray-900">Account Profile</h2>
      </div>

      {message && (
        <div className={`
          flex items-center space-x-2 p-4 rounded-lg mb-4
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

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Personal Information</h3>
          
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                First Name
              </label>
              <input
                type="text"
                id="firstName"
                value={profile.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                required
              />
            </div>

            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                Last Name
              </label>
              <input
                type="text"
                id="lastName"
                value={profile.lastName}
                onChange={(e) => handleChange('lastName', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                id="email"
                value={profile.email}
                disabled
                className="block w-full pl-10 rounded-md border-gray-300 bg-gray-100 cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              Phone Number
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Phone className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="tel"
                id="phone"
                value={profile.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="block w-full pl-10 rounded-md border-gray-300 focus:border-orange-500 focus:ring-orange-500"
              />
            </div>
          </div>
        </div>

        {/* Password Change */}
        <div className="space-y-4 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Change Password</h3>
          
          <div>
            <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
              Current Password
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="password"
                id="currentPassword"
                value={profile.currentPassword}
                onChange={(e) => handleChange('currentPassword', e.target.value)}
                className="block w-full pl-10 rounded-md border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                placeholder="Enter current password to change password"
              />
            </div>
          </div>

          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
              New Password
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="password"
                id="newPassword"
                value={profile.newPassword}
                onChange={(e) => handleChange('newPassword', e.target.value)}
                className="block w-full pl-10 rounded-md border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                placeholder="Enter new password"
                minLength={6}
              />
            </div>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              Confirm New Password
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="password"
                id="confirmPassword"
                value={profile.confirmPassword}
                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                className="block w-full pl-10 rounded-md border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                placeholder="Confirm new password"
                minLength={6}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
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
      </form>
    </div>
  );
}
