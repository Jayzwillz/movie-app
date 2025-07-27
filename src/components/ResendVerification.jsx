import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaEnvelope, FaArrowLeft, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import axios from 'axios';

const ResendVerification = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState(''); // 'loading', 'success', 'error'
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');

    try {
      const response = await axios.post('http://localhost:5000/api/auth/resend-verification', {
        email: email.trim()
      });

      setStatus('success');
      setMessage(response.data.message);
      setEmail('');
    } catch (error) {
      setStatus('error');
      setMessage(error.response?.data?.message || 'Failed to send verification email');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-gray-800 rounded-lg shadow-xl p-8">
        <div className="text-center mb-6">
          <FaEnvelope className="text-blue-500 text-4xl mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Resend Verification Email</h1>
          <p className="text-gray-300">
            Enter your email address and we'll send you a new verification link.
          </p>
        </div>

        {status === 'success' ? (
          <div className="text-center">
            <FaCheckCircle className="text-green-500 text-3xl mx-auto mb-4" />
            <p className="text-green-400 mb-6">{message}</p>
            <Link
              to="/login"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-md transition-colors inline-block text-center"
            >
              Go to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-3 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your email"
                required
                disabled={status === 'loading'}
              />
            </div>

            {status === 'error' && (
              <div className="flex items-center gap-2 text-red-400 text-sm">
                <FaExclamationTriangle />
                <span>{message}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={status === 'loading' || !email.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-md transition-colors"
            >
              {status === 'loading' ? 'Sending...' : 'Send Verification Email'}
            </button>
          </form>
        )}

        <div className="mt-6 text-center">
          <Link
            to="/login"
            className="text-blue-400 hover:text-blue-300 transition-colors inline-flex items-center gap-2 text-sm"
          >
            <FaArrowLeft />
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResendVerification;
