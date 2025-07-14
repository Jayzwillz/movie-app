import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateUserProfile, deleteUserAccount, logout } from '../redux/authSlice';
import { fetchUserReviews, clearUserReviews } from '../redux/reviewsSlice';
import { fetchWatchlist } from '../redux/watchlistSlice';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isLoading, error } = useSelector((state) => state.auth);
  const { userReviews } = useSelector((state) => state.reviews);
  const { items: watchlist } = useSelector((state) => state.watchlist);
  
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
      });
      
      // Fetch user's reviews and watchlist
      dispatch(fetchUserReviews(user.id));
      dispatch(fetchWatchlist(user.id));
    }
  }, [user, dispatch]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(updateUserProfile({ userId: user.id, userData: formData }));
    setIsEditing(false);
  };

  const handleDeleteAccount = () => {
    dispatch(deleteUserAccount(user.id));
    dispatch(clearUserReviews());
    navigate('/');
  };

  const handleLogout = () => {
    dispatch(logout());
    dispatch(clearUserReviews());
    navigate('/');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-xl">Please log in to view your profile.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Profile</h1>
              <p className="text-gray-400">Manage your account settings</p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Logout
              </button>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Information */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Personal Information</h2>
              
              {isEditing ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  {error && (
                    <div className="bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded">
                      {error}
                    </div>
                  )}

                  <div className="flex space-x-4">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                      {isLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400">Full Name</label>
                    <p className="text-white text-lg">{user.name}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-400">Email Address</label>
                    <p className="text-white text-lg">{user.email}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-400">Member Since</label>
                    <p className="text-white text-lg">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* User Reviews Section */}
            <div className="bg-gray-800 rounded-lg p-6 mt-8">
              <h2 className="text-xl font-semibold text-white mb-4">
                Your Reviews ({userReviews.length})
              </h2>
              
              {userReviews.length > 0 ? (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {userReviews.map((review) => (
                    <div key={review.id} className="bg-gray-700 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-white font-semibold">{review.movieTitle}</h3>
                        <div className="flex items-center">
                          <span className="text-yellow-400 mr-1">★</span>
                          <span className="text-white">{review.rating}/10</span>
                        </div>
                      </div>
                      <p className="text-gray-300 text-sm">{review.comment}</p>
                      <p className="text-gray-500 text-xs mt-2">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400">You haven't written any reviews yet.</p>
              )}
            </div>
          </div>

          {/* Stats and Actions Sidebar */}
          <div className="space-y-6">
            {/* Stats */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Statistics</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Watchlist Items</span>
                  <span className="text-white font-semibold">{watchlist.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Reviews Written</span>
                  <span className="text-white font-semibold">{userReviews.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Member Since</span>
                  <span className="text-white font-semibold">
                    {new Date(user.createdAt).getFullYear()}
                  </span>
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-red-900 border border-red-700 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Danger Zone</h2>
              <p className="text-red-100 text-sm mb-4">
                Once you delete your account, there is no going back. Please be certain.
              </p>
              
              {!showDeleteConfirm ? (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Delete Account
                </button>
              ) : (
                <div className="space-y-3">
                  <p className="text-red-100 text-sm font-semibold">
                    Are you absolutely sure?
                  </p>
                  <div className="flex space-x-2">
                    <button
                      onClick={handleDeleteAccount}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                    >
                      Yes, Delete
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
