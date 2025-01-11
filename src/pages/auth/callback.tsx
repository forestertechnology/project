import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      const { error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error during auth callback:', error);
        navigate('/login?error=Unable to verify email');
        return;
      }

      // Successfully verified email
      navigate('/dashboard');
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-orange-500 border-r-transparent"></div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Verifying your email...
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Please wait while we complete the verification process.
          </p>
        </div>
      </div>
    </div>
  );
}
