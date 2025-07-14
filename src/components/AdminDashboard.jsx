import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { adminAPI } from '../services/api';

const AdminDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState('stats');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [userPagination, setUserPagination] = useState({});
  const [reviewPagination, setReviewPagination] = useState({});
  const [currentUserPage, setCurrentUserPage] = useState(1);
  const [currentReviewPage, setCurrentReviewPage] = useState(1);

  // Check if user is admin
  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500 mb-4">Access Denied</h1>
          <p className="text-gray-300">You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await adminAPI.getStats();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async (page = 1) => {
    try {
      setLoading(true);
      const data = await adminAPI.getAllUsers(page, 10);
      setUsers(data.users);
      setUserPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async (page = 1) => {
    try {
      setLoading(true);
      const data = await adminAPI.getAllReviews(page, 10);
      setReviews(data.reviews);
      setReviewPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }
    
    try {
      await adminAPI.deleteUser(userId);
      fetchUsers(currentUserPage);
      fetchStats(); // Refresh stats
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Error deleting user. Please try again.');
    }
  };

  const handlePromoteUser = async (userId) => {
    try {
      await adminAPI.promoteToAdmin(userId);
      fetchUsers(currentUserPage);
      fetchStats(); // Refresh stats
    } catch (error) {
      console.error('Error promoting user:', error);
      alert('Error promoting user. Please try again.');
    }
  };

  const handleDemoteUser = async (userId) => {
    try {
      await adminAPI.demoteToUser(userId);
      fetchUsers(currentUserPage);
      fetchStats(); // Refresh stats
    } catch (error) {
      console.error('Error demoting user:', error);
      alert('Error demoting user. Please try again.');
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) {
      return;
    }
    
    try {
      await adminAPI.deleteReview(reviewId);
      fetchReviews(currentReviewPage);
      fetchStats(); // Refresh stats
    } catch (error) {
      console.error('Error deleting review:', error);
      alert('Error deleting review. Please try again.');
    }
  };

  useEffect(() => {
    if (activeTab === 'stats') {
      fetchStats();
    } else if (activeTab === 'users') {
      fetchUsers(currentUserPage);
    } else if (activeTab === 'reviews') {
      fetchReviews(currentReviewPage);
    }
  }, [activeTab, currentUserPage, currentReviewPage]);

  const renderStats = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-gray-800 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-white mb-2">Total Users</h3>
        <p className="text-3xl font-bold text-blue-400">{stats?.totalUsers || 0}</p>
      </div>
      <div className="bg-gray-800 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-white mb-2">Total Admins</h3>
        <p className="text-3xl font-bold text-green-400">{stats?.totalAdmins || 0}</p>
      </div>
      <div className="bg-gray-800 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-white mb-2">Total Reviews</h3>
        <p className="text-3xl font-bold text-yellow-400">{stats?.totalReviews || 0}</p>
      </div>
      <div className="bg-gray-800 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-white mb-2">Recent Users (30d)</h3>
        <p className="text-3xl font-bold text-purple-400">{stats?.recentUsers || 0}</p>
      </div>
      
      {stats?.topReviewers && stats.topReviewers.length > 0 && (
        <div className="col-span-full bg-gray-800 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-white mb-4">Top Reviewers</h3>
          <div className="space-y-2">
            {stats.topReviewers.map((reviewer, index) => (
              <div key={reviewer._id} className="flex justify-between items-center text-gray-300">
                <span>{index + 1}. {reviewer.userName} ({reviewer.userEmail})</span>
                <span className="text-blue-400">{reviewer.reviewCount} reviews</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderUsers = () => (
    <div className="bg-gray-800 rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-700">
        <h3 className="text-lg font-semibold text-white">User Management</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-white">Name</th>
              <th className="px-6 py-3 text-white">Email</th>
              <th className="px-6 py-3 text-white">Role</th>
              <th className="px-6 py-3 text-white">Watchlist</th>
              <th className="px-6 py-3 text-white">Joined</th>
              <th className="px-6 py-3 text-white">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {users.map((userData) => (
              <tr key={userData.id} className="text-gray-300">
                <td className="px-6 py-4">{userData.name}</td>
                <td className="px-6 py-4">{userData.email}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs ${
                    userData.role === 'admin' ? 'bg-green-600 text-white' : 'bg-gray-600 text-white'
                  }`}>
                    {userData.role || 'user'}
                  </span>
                </td>
                <td className="px-6 py-4">{userData.watchlistCount}</td>
                <td className="px-6 py-4">{new Date(userData.createdAt).toLocaleDateString()}</td>
                <td className="px-6 py-4">
                  <div className="flex space-x-2">
                    {userData.role !== 'admin' ? (
                      <button
                        onClick={() => handlePromoteUser(userData.id)}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs"
                      >
                        Promote
                      </button>
                    ) : (
                      <button
                        onClick={() => handleDemoteUser(userData.id)}
                        className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded text-xs"
                        disabled={userData.id === user?.id} // Prevent self-demotion
                      >
                        Demote
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteUser(userData.id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs"
                      disabled={userData.id === user?.id} // Prevent self-deletion
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      {userPagination.totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-700 flex justify-between items-center">
          <span className="text-gray-400">
            Page {userPagination.currentPage} of {userPagination.totalPages}
          </span>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentUserPage(prev => Math.max(prev - 1, 1))}
              disabled={!userPagination.hasPrev}
              className="bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white px-3 py-1 rounded"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentUserPage(prev => prev + 1)}
              disabled={!userPagination.hasNext}
              className="bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white px-3 py-1 rounded"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const renderReviews = () => (
    <div className="bg-gray-800 rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-700">
        <h3 className="text-lg font-semibold text-white">Review Management</h3>
      </div>
      <div className="space-y-4 p-6">
        {reviews.map((review) => (
          <div key={review._id} className="bg-gray-700 p-4 rounded-lg">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h4 className="text-white font-semibold">Movie ID: {review.movieId}</h4>
                <p className="text-gray-400 text-sm">
                  By: {review.userId?.name || 'Unknown'} ({review.userId?.email || 'Unknown'})
                </p>
                <p className="text-gray-400 text-sm">
                  Rating: {review.rating}/5 | {new Date(review.createdAt).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => handleDeleteReview(review._id)}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs"
              >
                Delete
              </button>
            </div>
            <p className="text-gray-300">{review.review}</p>
          </div>
        ))}
      </div>
      
      {/* Pagination */}
      {reviewPagination.totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-700 flex justify-between items-center">
          <span className="text-gray-400">
            Page {reviewPagination.currentPage} of {reviewPagination.totalPages}
          </span>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentReviewPage(prev => Math.max(prev - 1, 1))}
              disabled={!reviewPagination.hasPrev}
              className="bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white px-3 py-1 rounded"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentReviewPage(prev => prev + 1)}
              disabled={!reviewPagination.hasNext}
              className="bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white px-3 py-1 rounded"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
          <p className="text-gray-400">Welcome back, {user.name}!</p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            {['stats', 'users', 'reviews'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-2 px-1 border-b-2 font-medium text-sm capitalize ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-300 hover:border-gray-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div>
            {activeTab === 'stats' && renderStats()}
            {activeTab === 'users' && renderUsers()}
            {activeTab === 'reviews' && renderReviews()}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
