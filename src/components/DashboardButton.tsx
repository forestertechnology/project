import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, Loader2 } from 'lucide-react';

export const DashboardButton: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!user) return null;

  const displayName = profile 
    ? `${profile.first_name} ${profile.last_name}` 
    : user.email || 'My Account';

  const handleSignOut = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
      setError('Failed to log out. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 flex space-x-2 items-center">
      <button 
        onClick={() => navigate('/dashboard')}
        className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-600 transition-colors flex items-center"
      >
        {displayName} Dashboard
      </button>
      <button 
        onClick={handleSignOut}
        disabled={isLoading}
        className="bg-red-500 text-white px-3 py-2 rounded-lg shadow-md hover:bg-red-600 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
        title="Sign Out"
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <LogOut className="w-5 h-5" />
        )}
      </button>
      {error && (
        <div className="text-red-500 text-sm ml-2">
          {error}
        </div>
      )}
    </div>
  );
};
