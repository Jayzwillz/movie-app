import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api';

class AIService {
  constructor() {
    this.apiClient = axios.create({
      baseURL: `${API_BASE_URL}/ai`,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Add auth token to requests
    this.apiClient.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  // Test AI connection
  async testConnection() {
    try {
      const response = await this.apiClient.get('/test');
      return response.data;
    } catch (error) {
      console.error('AI Connection Test Failed:', error);
      throw error;
    }
  }

  // Get AI Movie Recommendations
  async getRecommendations(theme = null, count = 10) {
    try {
      const response = await this.apiClient.post('/recommendations', {
        theme,
        count
      });
      return response.data;
    } catch (error) {
      console.error('AI Recommendations Failed:', error);
      throw error;
    }
  }

  // Intelligent Natural Language Search
  async searchWithNaturalLanguage(query) {
    try {
      const response = await this.apiClient.post('/search', {
        query
      });
      return response.data;
    } catch (error) {
      console.error('AI Search Failed:', error);
      throw error;
    }
  }

  // Analyze Movie Reviews
  async analyzeReviews(movieId, movieTitle, tmdbReviews = []) {
    try {
      const response = await this.apiClient.post(`/analyze-reviews/${movieId}`, {
        movieTitle,
        tmdbReviews
      });
      return response.data;
    } catch (error) {
      console.error('AI Review Analysis Failed:', error);
      throw error;
    }
  }

  // Chat with AI Assistant
  async chatWithAssistant(message, movieTitle = null, conversationHistory = []) {
    try {
      const response = await this.apiClient.post('/chat', {
        message,
        movieTitle,
        conversationHistory
      });
      return response.data;
    } catch (error) {
      console.error('AI Chat Failed:', error);
      throw error;
    }
  }

  // Analyze Movie Plot & Themes
  async analyzeMovie(movieData) {
    try {
      const response = await this.apiClient.post('/analyze-movie', {
        movieData
      });
      return response.data;
    } catch (error) {
      console.error('AI Movie Analysis Failed:', error);
      throw error;
    }
  }

  // Get Personalized News & Updates
  async getPersonalizedNews() {
    try {
      const response = await this.apiClient.get('/news');
      return response.data;
    } catch (error) {
      console.error('AI News Generation Failed:', error);
      throw error;
    }
  }

  // Batch test all AI features
  async batchTest() {
    try {
      const response = await this.apiClient.post('/batch-test');
      return response.data;
    } catch (error) {
      console.error('AI Batch Test Failed:', error);
      throw error;
    }
  }
}

export default new AIService();
