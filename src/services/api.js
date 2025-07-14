import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Authentication API
export const authAPI = {
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },
};

// User API
export const userAPI = {
  getProfile: async (userId) => {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },
  
  updateProfile: async (userId, userData) => {
    const response = await api.patch(`/users/${userId}`, userData);
    return response.data;
  },
  
  deleteAccount: async (userId) => {
    const response = await api.delete(`/users/${userId}`);
    return response.data;
  },
};

// Watchlist API
export const watchlistAPI = {
  getWatchlist: async (userId) => {
    const response = await api.get(`/users/${userId}/watchlist`);
    return response.data.watchlist;
  },
  
  addToWatchlist: async (userId, movieData) => {
    const response = await api.post(`/users/${userId}/watchlist`, movieData);
    return response.data.watchlist;
  },
  
  removeFromWatchlist: async (userId, movieId) => {
    const response = await api.delete(`/users/${userId}/watchlist/${movieId}`);
    return response.data.watchlist;
  },
};

// Reviews API
export const reviewAPI = {
  addReview: async (reviewData) => {
    const response = await api.post('/reviews', reviewData);
    return response.data;
  },
  
  getMovieReviews: async (movieId) => {
    const response = await api.get(`/reviews/${movieId}`);
    return response.data;
  },
  
  getUserReviews: async (userId) => {
    const response = await api.get(`/reviews/user/${userId}`);
    return response.data;
  },
  
  updateReview: async (reviewId, reviewData) => {
    const response = await api.patch(`/reviews/${reviewId}`, reviewData);
    return response.data;
  },
  
  deleteReview: async (reviewId) => {
    const response = await api.delete(`/reviews/${reviewId}`);
    return response.data;
  },
};

// Admin API
export const adminAPI = {
  // User management
  getAllUsers: async (page = 1, limit = 10) => {
    const response = await api.get(`/admin/users?page=${page}&limit=${limit}`);
    return response.data;
  },
  
  deleteUser: async (userId) => {
    const response = await api.delete(`/admin/users/${userId}`);
    return response.data;
  },
  
  promoteToAdmin: async (userId) => {
    const response = await api.patch(`/admin/users/${userId}/promote`);
    return response.data;
  },
  
  demoteToUser: async (userId) => {
    const response = await api.patch(`/admin/users/${userId}/demote`);
    return response.data;
  },
  
  // Review management
  getAllReviews: async (page = 1, limit = 10) => {
    const response = await api.get(`/admin/reviews?page=${page}&limit=${limit}`);
    return response.data;
  },
  
  deleteReview: async (reviewId) => {
    const response = await api.delete(`/admin/reviews/${reviewId}`);
    return response.data;
  },
  
  // Statistics
  getStats: async () => {
    const response = await api.get('/admin/stats');
    return response.data;
  },
};

export default api;
