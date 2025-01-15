import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import React from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requireSubscription?: boolean;
}

export default function ProtectedRoute({ 
  children, 
  requireAdmin = false,
  requireSubscription = false 
}: ProtectedRouteProps) {
  const { user, profile, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-orange-500 border-r-transparent"></div>
          <p className="mt-2 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role-based access with more robust handling
  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center text-red-600">
          <p>Unable to load user profile. Please try logging in again.</p>
        </div>
      </div>
    );
  }

  if (requireAdmin && !profile.is_admin) {
    return <Navigate to="/dashboard" replace />;
  }

  // Check subscription requirement with more detailed handling
  if (requireSubscription && (!profile.subscription_tier_id || profile.subscription_tier_id === '')) {
    return <Navigate to="/billing" replace />;
  }

  return <>{children}</>;
}
