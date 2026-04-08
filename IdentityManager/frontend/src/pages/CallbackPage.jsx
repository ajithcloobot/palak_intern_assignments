import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const CallbackPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { handleOktaCallback } = useAuth();

  useEffect(() => {
    const token = searchParams.get('access_token');
    const email = searchParams.get('email');
    const provider = searchParams.get('provider');

    if (token && email && provider) {
      const userInfo = {
        email,
        provider,
        created_at: new Date().toISOString(),
      };
      
      handleOktaCallback(token, userInfo);
      navigate('/dashboard');
    } else {
      // Handle error case
      navigate('/login?error=authentication_failed');
    }
  }, [searchParams, navigate, handleOktaCallback]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Completing authentication...</p>
      </div>
    </div>
  );
};

export default CallbackPage;
