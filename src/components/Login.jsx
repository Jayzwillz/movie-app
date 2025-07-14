import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { addToWatchlistAsync } from '../redux/watchlistSlice';
import AuthForm from './AuthForm';

const Login = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    if (isAuthenticated && user) {
      // Check for pending watchlist item
      const pendingItem = localStorage.getItem('pendingWatchlistItem');
      const returnUrl = localStorage.getItem('returnUrl');
      
      if (pendingItem) {
        try {
          const movieData = JSON.parse(pendingItem);
          // Add the pending item to watchlist
          dispatch(addToWatchlistAsync({ userId: user.id, movieData }));
          
          // Clean up localStorage
          localStorage.removeItem('pendingWatchlistItem');
        } catch (error) {
          console.error('Error adding pending watchlist item:', error);
        }
      }
      
      // Navigate to return URL or home
      if (returnUrl) {
        localStorage.removeItem('returnUrl');
        navigate(returnUrl);
      } else {
        navigate('/');
      }
    }
  }, [isAuthenticated, user, navigate, dispatch]);

  return <AuthForm isLogin={true} />;
};

export default Login;
