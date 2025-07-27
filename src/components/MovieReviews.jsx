import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FaArrowLeft, FaStar, FaThumbsUp, FaThumbsDown, FaUser, FaFilter, FaSort, FaEdit, FaTrash } from 'react-icons/fa';
import axios from 'axios';

const MovieReviews = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();
  const { isAuthenticated, user, token } = useSelector((state) => state.auth);
  
  const { tmdbReviews = [], reviewStats = {}, movie = {} } = location.state || {};
  
  const [reviews, setReviews] = useState([]);
  const [userReviews, setUserReviews] = useState([]);
  const [reviewFilter, setReviewFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [expandedReviews, setExpandedReviews] = useState(new Set());
  const [userReview, setUserReview] = useState({ rating: 0, comment: '', title: '' });
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingReview, setEditingReview] = useState(null);
  const [reviewStats2, setReviewStats2] = useState({ totalReviews: 0, averageRating: 0 });

  // API base URL
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

  // If no data in state, redirect back
  useEffect(() => {
    if (!location.state) {
      navigate(`/movie/${id}`);
    } else {
      // Combine TMDB reviews with user reviews
      const formattedTmdbReviews = tmdbReviews.map(review => ({
        ...review,
        source: 'tmdb',
        likes: review.likes || 0,
        dislikes: review.dislikes || 0,
        date: review.created_at,
        username: review.author,
        rating: review.author_details?.rating ? Math.round(review.author_details.rating / 2) : 3
      }));
      setReviews(formattedTmdbReviews);
      fetchUserReviews();
    }
  }, [location.state, navigate, id, tmdbReviews]);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Fetch user reviews from backend
  const fetchUserReviews = async () => {
    setLoading(true);
    try {
      console.log('Fetching reviews for movie ID:', id);
      console.log('API URL:', `${API_BASE_URL}/reviews/${id}`);
      
      const response = await axios.get(`${API_BASE_URL}/reviews/${id}`);
      console.log('Reviews fetch response:', response.data);
      
      const { reviews: backendReviews, totalReviews, averageRating } = response.data;
      
      setUserReviews(backendReviews);
      setReviewStats2({ totalReviews, averageRating });
      
      // Combine with TMDB reviews
      const formattedTmdbReviews = tmdbReviews.map(review => ({
        ...review,
        source: 'tmdb',
        likes: review.likes || 0,
        dislikes: review.dislikes || 0,
        date: review.created_at,
        username: review.author,
        rating: review.author_details?.rating ? Math.round(review.author_details.rating / 2) : 3
      }));
      
      console.log('Combined reviews:', [...backendReviews, ...formattedTmdbReviews]);
      setReviews([...backendReviews, ...formattedTmdbReviews]);
    } catch (error) {
      console.error('Error fetching user reviews:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      setError(`Failed to load reviews: ${error.response?.data?.message || error.message}`);
    }
    setLoading(false);
  };

  // Submit new review or update existing
  const handleUserReviewSubmit = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    if (userReview.rating === 0 || !userReview.comment.trim()) {
      setError('Please provide a rating and comment');
      return;
    }

    setSubmitLoading(true);
    setError('');
    
    try {
      const reviewData = {
        movieId: id,
        rating: userReview.rating,
        comment: userReview.comment.trim(),
        title: userReview.title.trim(),
        movieTitle: movie.title
      };

      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };

      console.log('Submitting review:', { reviewData, apiUrl: `${API_BASE_URL}/reviews` });
      console.log('Auth token present:', !!token);
      console.log('User info:', { id: user?.id, name: user?.name, email: user?.email });

      if (editingReview) {
        // Update existing review
        console.log('Updating existing review:', editingReview._id);
        const response = await axios.put(`${API_BASE_URL}/reviews/${editingReview._id}`, reviewData, config);
        console.log('Review update response:', response.data);
        setSuccess('Review updated successfully!');
      } else {
        // Create new review
        console.log('Creating new review...');
        const response = await axios.post(`${API_BASE_URL}/reviews`, reviewData, config);
        console.log('Review creation response:', response.data);
        setSuccess('Review submitted successfully!');
      }
      
      setUserReview({ rating: 0, comment: '', title: '' });
      setShowReviewForm(false);
      setEditingReview(null);
      
      // Refresh reviews
      fetchUserReviews();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error submitting review:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      setError(error.response?.data?.message || error.message || 'Failed to submit review');
    }
    
    setSubmitLoading(false);
  };

  // Handle like/dislike
  const handleReviewLike = async (reviewId, type) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };

      await axios.post(`${API_BASE_URL}/reviews/${reviewId}/like`, { type }, config);
      
      // Refresh reviews to get updated counts
      fetchUserReviews();
    } catch (error) {
      console.error('Error liking review:', error);
      setError('Failed to update review');
    }
  };

  // Delete review
  const handleDeleteReview = async (reviewId) => {
    if (!confirm('Are you sure you want to delete this review?')) {
      return;
    }

    try {
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };

      await axios.delete(`${API_BASE_URL}/reviews/${reviewId}`, config);
      
      setSuccess('Review deleted successfully!');
      fetchUserReviews();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error deleting review:', error);
      setError('Failed to delete review');
    }
  };

  const toggleReviewExpansion = (reviewId) => {
    setExpandedReviews(prev => {
      const newSet = new Set(prev);
      if (newSet.has(reviewId)) {
        newSet.delete(reviewId);
      } else {
        newSet.add(reviewId);
      }
      return newSet;
    });
  };

  const getFilteredAndSortedReviews = () => {
    let filtered = [...reviews];
    
    // Filter by source
    switch (reviewFilter) {
      case 'tmdb':
        filtered = filtered.filter(review => review.source === 'tmdb');
        break;
      case 'user':
        filtered = filtered.filter(review => review.source === 'user');
        break;
      case 'positive':
        filtered = filtered.filter(review => review.rating >= 4);
        break;
      case 'negative':
        filtered = filtered.filter(review => review.rating <= 2);
        break;
      default:
        break;
    }
    
    // Sort reviews
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt || a.date) - new Date(b.createdAt || b.date));
        break;
      case 'highest':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'lowest':
        filtered.sort((a, b) => a.rating - b.rating);
        break;
      case 'helpful':
        filtered.sort((a, b) => ((b.likes || 0) - (b.dislikes || 0)) - ((a.likes || 0) - (a.dislikes || 0)));
        break;
      default:
        break;
    }
    
    return filtered;
  };

  const renderStars = (rating, interactive = false, onRate = null) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => interactive && onRate && onRate(star)}
            className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
            disabled={!interactive}
          >
            <FaStar
              className={`w-4 h-4 ${
                star <= rating ? 'text-yellow-400' : 'text-gray-600'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const truncateText = (text, maxLength = 300) => {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
  };

  const filteredReviews = getFilteredAndSortedReviews();

  if (!location.state) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-500 text-white p-4 text-center">
          {success}
        </div>
      )}
      
      {error && (
        <div className="bg-red-500 text-white p-4 text-center">
          {error}
          <button 
            onClick={() => setError('')}
            className="ml-4 text-white hover:text-gray-200"
          >
            ×
          </button>
        </div>
      )}

      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate(`/movie/${id}`)}
              className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
            >
              <FaArrowLeft />
              <span>Back to Movie</span>
            </button>
          </div>
          
          <div className="flex items-center gap-4">
            <img
              src={movie.poster_path ? 
                `https://image.tmdb.org/t/p/w92${movie.poster_path}` : 
                '/api/placeholder/92/138'
              }
              alt={movie.title}
              className="w-16 h-24 rounded object-cover"
            />
            <div>
              <h1 className="text-2xl font-bold">{movie.title}</h1>
              <p className="text-gray-400">Reviews & Ratings</p>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-2">
                  {renderStars(reviewStats2.averageRating || reviewStats.averageRating || 0)}
                  <span className="text-sm text-gray-300">
                    {(reviewStats2.averageRating || reviewStats.averageRating || 0).toFixed(1)} ({reviewStats2.totalReviews + (tmdbReviews?.length || 0)} reviews)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setReviewFilter('all')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                reviewFilter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              All ({reviews.length})
            </button>
            <button
              onClick={() => setReviewFilter('tmdb')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                reviewFilter === 'tmdb'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              TMDB ({reviews.filter(r => r.source === 'tmdb').length})
            </button>
            <button
              onClick={() => setReviewFilter('user')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                reviewFilter === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Users ({reviews.filter(r => r.source === 'user').length})
            </button>
            <button
              onClick={() => setReviewFilter('positive')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                reviewFilter === 'positive'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Positive ({reviews.filter(r => r.rating >= 4).length})
            </button>
            <button
              onClick={() => setReviewFilter('negative')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                reviewFilter === 'negative'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Negative ({reviews.filter(r => r.rating <= 2).length})
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            <FaSort className="text-gray-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-gray-700 border border-gray-600 rounded px-3 py-1 text-sm"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest">Highest Rated</option>
              <option value="lowest">Lowest Rated</option>
              <option value="helpful">Most Helpful</option>
            </select>
          </div>
        </div>

        {/* Add Review Button or Sign In Message */}
        {isAuthenticated ? (
          !showReviewForm && (
            <div className="mb-6">
              <button
                onClick={() => setShowReviewForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Write a Review
              </button>
            </div>
          )
        ) : (
          <div className="mb-6 bg-gray-800 border border-gray-700 rounded-lg p-4">
            <p className="text-gray-300 mb-3">Want to share your thoughts about this movie?</p>
            <button
              onClick={() => navigate('/login')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors mr-3"
            >
              Sign In to Write a Review
            </button>
            <button
              onClick={() => navigate('/register')}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Create Account
            </button>
          </div>
        )}

        {/* Review Form */}
        {showReviewForm && (
          <div className="bg-gray-800 rounded-lg p-6 mb-6 border border-gray-700">
            <h3 className="text-lg font-semibold mb-4">
              {editingReview ? 'Edit Your Review' : 'Write Your Review'}
            </h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Rating *</label>
              {renderStars(userReview.rating, true, (rating) => 
                setUserReview(prev => ({ ...prev, rating }))
              )}
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Title (Optional)</label>
              <input
                type="text"
                value={userReview.title}
                onChange={(e) => setUserReview(prev => ({ ...prev, title: e.target.value }))}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
                placeholder="Review title..."
                maxLength={100}
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Review *</label>
              <textarea
                value={userReview.comment}
                onChange={(e) => setUserReview(prev => ({ ...prev, comment: e.target.value }))}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 h-32"
                placeholder="Write your review..."
                maxLength={1000}
              />
              <div className="text-sm text-gray-400 mt-1">
                {userReview.comment.length}/1000 characters
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={handleUserReviewSubmit}
                disabled={submitLoading || userReview.rating === 0 || !userReview.comment.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded font-medium transition-colors"
              >
                {submitLoading ? 'Submitting...' : (editingReview ? 'Update Review' : 'Submit Review')}
              </button>
              <button
                onClick={() => {
                  setShowReviewForm(false);
                  setEditingReview(null);
                  setUserReview({ rating: 0, comment: '', title: '' });
                }}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Reviews List */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-400">Loading reviews...</p>
          </div>
        ) : filteredReviews.length > 0 ? (
          <div className="space-y-6">
            {filteredReviews.map((review) => (
              <div key={review._id || review.id} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                      <FaUser className="w-5 h-5 text-gray-300" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">
                          {review.user?.username || review.username || 'Anonymous'}
                        </h4>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          review.source === 'tmdb' 
                            ? 'bg-green-600 text-white' 
                            : 'bg-blue-600 text-white'
                        }`}>
                          {review.source === 'tmdb' ? 'TMDB' : 'User'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        {renderStars(review.rating)}
                        <span className="text-sm text-gray-400">
                          {formatDate(review.createdAt || review.date)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Edit/Delete buttons for user's own reviews */}
                  {isAuthenticated && review.source === 'user' && review.user?._id === user?.id && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingReview(review);
                          setUserReview({
                            rating: review.rating,
                            comment: review.comment,
                            title: review.title || ''
                          });
                          setShowReviewForm(true);
                        }}
                        className="text-blue-400 hover:text-blue-300 p-2"
                        title="Edit Review"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDeleteReview(review._id)}
                        className="text-red-400 hover:text-red-300 p-2"
                        title="Delete Review"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  )}
                </div>
                
                {review.title && (
                  <h5 className="font-medium mb-2">{review.title}</h5>
                )}
                
                <div className="text-gray-300 mb-4">
                  {expandedReviews.has(review._id || review.id) || review.comment.length <= 300 ? (
                    <p>{review.comment}</p>
                  ) : (
                    <p>{truncateText(review.comment)}</p>
                  )}
                  
                  {review.comment.length > 300 && (
                    <button
                      onClick={() => toggleReviewExpansion(review._id || review.id)}
                      className="text-blue-400 hover:text-blue-300 text-sm mt-2"
                    >
                      {expandedReviews.has(review._id || review.id) ? 'Show less' : 'Read more'}
                    </button>
                  )}
                </div>
                
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleReviewLike(review._id || review.id, 'like')}
                    disabled={!isAuthenticated || review.source === 'tmdb'}
                    className={`flex items-center gap-1 transition-colors ${
                      !isAuthenticated || review.source === 'tmdb'
                        ? 'text-gray-500 cursor-not-allowed'
                        : 'text-gray-400 hover:text-green-400'
                    }`}
                  >
                    <FaThumbsUp className="w-4 h-4" />
                    <span className="text-sm">{review.likes || 0}</span>
                  </button>
                  <button
                    onClick={() => handleReviewLike(review._id || review.id, 'dislike')}
                    disabled={!isAuthenticated || review.source === 'tmdb'}
                    className={`flex items-center gap-1 transition-colors ${
                      !isAuthenticated || review.source === 'tmdb'
                        ? 'text-gray-500 cursor-not-allowed'
                        : 'text-gray-400 hover:text-red-400'
                    }`}
                  >
                    <FaThumbsDown className="w-4 h-4" />
                    <span className="text-sm">{review.dislikes || 0}</span>
                  </button>
                  {review.source === 'user' && (
                    <span className="text-xs text-gray-500">
                      {review.updatedAt && review.updatedAt !== review.createdAt ? '(edited)' : ''}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-400">No reviews found for this filter.</p>
            {isAuthenticated && (
              <button
                onClick={() => setShowReviewForm(true)}
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Be the first to review!
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MovieReviews;
