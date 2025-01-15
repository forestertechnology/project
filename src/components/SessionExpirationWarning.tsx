import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

export function SessionExpirationWarning() {
  const { timeUntilExpiration, refreshSession, signOut } = useAuth();
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    // Show warning when less than 5 minutes remain
    if (timeUntilExpiration > 0 && timeUntilExpiration <= 300) {
      setShowWarning(true);
    }
  }, [timeUntilExpiration]);

  const handleRefreshSession = async () => {
    try {
      await refreshSession();
      setShowWarning(false);
    } catch (error) {
      console.error('Session refresh failed', error);
      await signOut();
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  if (!showWarning) return null;

  const minutesRemaining = Math.floor(timeUntilExpiration / 60);
  const secondsRemaining = timeUntilExpiration % 60;

  return (
    <div className="fixed top-0 left-0 w-full bg-yellow-500 text-black p-2 z-50 text-center">
      <p>
        Your session will expire in {minutesRemaining} minutes and {secondsRemaining} seconds. 
        Would you like to stay logged in?
      </p>
      <div className="mt-2">
        <button 
          onClick={handleRefreshSession} 
          className="mr-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Keep Me Logged In
        </button>
        <button 
          onClick={handleSignOut} 
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Log Out
        </button>
      </div>
    </div>
  );
}
