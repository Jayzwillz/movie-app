import { useState } from 'react';
import { Link } from 'react-router-dom';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setMessage('Please enter your email address');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        setIsSuccess(true);
        setEmail('');
      } else {
        setMessage(data.message || 'An error occurred');
        setIsSuccess(false);
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      setMessage('Network error. Please try again.');
      setIsSuccess(false);
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-auto flex justify-center">
            <span className="text-3xl font-bold text-blue-500">XZMovies</span>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            Forgot your password?
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="sr-only">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-600 placeholder-gray-400 text-white bg-gray-800 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>

          {message && (
            <div className={`text-sm text-center p-3 rounded-md ${
              isSuccess 
                ? 'text-green-400 bg-green-900/20 border border-green-800' 
                : 'text-red-400 bg-red-900/20 border border-red-800'
            }`}>
              {message}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                isLoading
                  ? 'bg-gray-600 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin -ml-1 mr-3 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  Sending...
                </div>
              ) : (
                'Send Reset Link'
              )}
            </button>
          </div>

          <div className="flex items-center justify-between">
            <Link
              to="/login"
              className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              ← Back to Login
            </Link>
            <Link
              to="/register"
              className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              Need an account? Sign up
            </Link>
          </div>
        </form>

        {isSuccess && (
          <div className="mt-6 p-4 bg-blue-900/20 border border-blue-800 rounded-md">
            <h3 className="text-sm font-medium text-blue-400 mb-2">
              Check your email
            </h3>
            <p className="text-sm text-gray-300">
              We've sent a password reset link to your email address. The link will expire in 1 hour.
            </p>
            <p className="text-sm text-gray-400 mt-2">
              Don't see the email? Check your spam folder or{' '}
              <button
                onClick={() => {
                  setIsSuccess(false);
                  setMessage('');
                }}
                className="text-blue-400 hover:text-blue-300 underline"
              >
                try again
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
