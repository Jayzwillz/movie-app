import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { FaCheckCircle, FaTimesCircle, FaHome, FaSignInAlt } from 'react-icons/fa';

const EmailVerified = () => {
  const [status, setStatus] = useState('loading');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const success = urlParams.get('success');
    const error = urlParams.get('error');

    if (success === 'true') {
      setStatus('success');
    } else if (success === 'false') {
      setStatus('error');
      console.error('Verification error:', error);
    } else {
      setStatus('error');
    }
  }, [location]);

  const handleGoToLogin = () => {
    navigate('/login');
  };

  const handleGoHome = () => {
    navigate('/');
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Verifying your email...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-gray-800 rounded-lg shadow-xl p-8 text-center">
        {status === 'success' ? (
          <>
            <div className="mb-6">
              <FaCheckCircle className="text-green-500 text-6xl mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-white mb-2">Email Verified!</h1>
              <p className="text-gray-300">
                Your email has been successfully verified. You can now log in to your account.
              </p>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={handleGoToLogin}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-md transition-colors flex items-center justify-center gap-2"
              >
                <FaSignInAlt />
                Go to Login
              </button>
              
              <button
                onClick={handleGoHome}
                className="w-full bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 px-4 rounded-md transition-colors flex items-center justify-center gap-2"
              >
                <FaHome />
                Go to Home
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="mb-6">
              <FaTimesCircle className="text-red-500 text-6xl mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-white mb-2">Verification Failed</h1>
              <p className="text-gray-300 mb-4">
                There was an error verifying your email. The link may have expired or is invalid.
              </p>
            </div>
            
            <div className="space-y-3">
              <Link
                to="/resend-verification"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-md transition-colors inline-block text-center"
              >
                Request New Verification Link
              </Link>
              
              <button
                onClick={handleGoHome}
                className="w-full bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 px-4 rounded-md transition-colors flex items-center justify-center gap-2"
              >
                <FaHome />
                Go to Home
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default EmailVerified;
