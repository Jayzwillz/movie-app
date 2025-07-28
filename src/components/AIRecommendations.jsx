import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { FaRobot, FaStar, FaRedo, FaMagic, FaHeart, FaFilm, FaSnowflake, FaSun, FaMoon, FaFire } from 'react-icons/fa';
import MovieCard from './MovieCard';
import aiService from '../services/aiService';

const AIRecommendations = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState('');
  const [themedCollection, setThemedCollection] = useState(null);
  const [selectedTheme, setSelectedTheme] = useState('');
  const [error, setError] = useState('');

  const themes = [
    { id: '', label: 'Personalized for You', icon: FaMagic, description: 'Based on your unique taste' },
    { id: 'rainy_day', label: 'Rainy Day Movies', icon: FaSnowflake, description: 'Perfect for cozy indoor moments' },
    { id: 'feel_good', label: 'Feel Good Vibes', icon: FaSun, description: 'Uplifting and heartwarming films' },
    { id: 'date_night', label: 'Date Night Perfect', icon: FaHeart, description: 'Romance and connection' },
    { id: 'mind_bending', label: 'Mind-Bending Thrillers', icon: FaFilm, description: 'Complex plots that challenge' },
    { id: 'late_night', label: 'Late Night Mysteries', icon: FaMoon, description: 'Dark and suspenseful' },
    { id: 'action_packed', label: 'Adrenaline Rush', icon: FaFire, description: 'High-octane excitement' }
  ];

  const getRecommendations = async (theme = '') => {
    if (!isAuthenticated) {
      setError('Please sign in to get personalized AI recommendations');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await aiService.getRecommendations(theme || null, 12);
      
      if (response.success) {
        setRecommendations(response.recommendations || []);
        setAnalysis(response.analysis || '');
        setThemedCollection(response.themed_collection || null);
      } else {
        setError('Failed to get AI recommendations');
      }
    } catch (error) {
      console.error('AI Recommendations Error:', error);
      setError('Unable to connect to AI service. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      getRecommendations();
    }
  }, [isAuthenticated]);

  const handleThemeChange = (themeId) => {
    setSelectedTheme(themeId);
    getRecommendations(themeId);
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 90) return 'text-green-400';
    if (confidence >= 80) return 'text-yellow-400';
    if (confidence >= 70) return 'text-orange-400';
    return 'text-red-400';
  };

  if (!isAuthenticated) {
    return (
      <div className="bg-gray-900 rounded-lg p-8 text-center">
        <FaRobot className="w-16 h-16 text-blue-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-4">AI-Powered Recommendations</h2>
        <p className="text-gray-400 mb-6">
          Sign in to unlock personalized movie recommendations powered by advanced AI that learns your preferences
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <FaMagic className="text-blue-400" />
            <span>Learns your taste</span>
          </div>
          <div className="flex items-center gap-2">
            <FaFilm className="text-purple-400" />
            <span>Themed collections</span>
          </div>
          <div className="flex items-center gap-2">
            <FaStar className="text-yellow-400" />
            <span>Confidence scoring</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FaRobot className="w-8 h-8 text-blue-500" />
          <div>
            <h2 className="text-2xl font-bold text-white">AI Recommendations</h2>
            <p className="text-gray-400">Powered by Gemini AI</p>
          </div>
        </div>
        <button
          onClick={() => getRecommendations(selectedTheme)}
          disabled={loading}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
        >
          <FaRedo className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Theme Selection */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-white">Choose Your Mood</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {themes.map((theme) => {
            const IconComponent = theme.icon;
            return (
              <button
                key={theme.id}
                onClick={() => handleThemeChange(theme.id)}
                className={`p-4 rounded-lg border transition-all ${
                  selectedTheme === theme.id
                    ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                    : 'border-gray-700 bg-gray-800/50 text-gray-300 hover:border-gray-600'
                }`}
              >
                <IconComponent className="w-6 h-6 mx-auto mb-2" />
                <div className="text-sm font-medium">{theme.label}</div>
                <div className="text-xs text-gray-500 mt-1">{theme.description}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-900/20 border border-red-700 rounded-lg p-4 text-red-400">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <FaRobot className="w-12 h-12 text-blue-500 mx-auto mb-4 animate-pulse" />
          <p className="text-white text-lg">AI is analyzing your preferences...</p>
          <p className="text-gray-400 text-sm mt-2">This may take a few moments</p>
        </div>
      )}

      {/* AI Analysis */}
      {analysis && !loading && (
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            <FaMagic className="text-blue-400" />
            AI Analysis of Your Preferences
          </h3>
          <p className="text-gray-300 leading-relaxed">{analysis}</p>
        </div>
      )}

      {/* Themed Collection Info */}
      {themedCollection && !loading && (
        <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-700/50 rounded-lg p-6">
          <h3 className="text-xl font-bold text-white mb-2">{themedCollection.title}</h3>
          <p className="text-gray-300">{themedCollection.description}</p>
        </div>
      )}

      {/* Recommendations Grid */}
      {recommendations.length > 0 && !loading && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">
            Your Recommendations ({recommendations.length})
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {recommendations.map((rec, index) => (
              <div key={index} className="space-y-3">
                {/* Movie Card - You'll need to adapt this based on your MovieCard component */}
                <div className="bg-gray-800 rounded-lg overflow-hidden group hover:scale-105 transition-transform">
                  <div className="aspect-[2/3] bg-gray-700 relative">
                    {/* You can integrate with TMDB to get movie poster here */}
                    <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                      <div className="text-center">
                        <FaFilm className="w-8 h-8 mx-auto mb-2" />
                        <p className="text-xs font-medium">{rec.title}</p>
                        <p className="text-xs text-gray-500">{rec.year}</p>
                      </div>
                    </div>
                    
                    {/* Confidence Badge */}
                    <div className="absolute top-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                      <span className={getConfidenceColor(rec.confidence)}>
                        {rec.confidence}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* AI Explanation */}
                <div className="bg-gray-800/50 rounded-lg p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <FaRobot className="w-4 h-4 text-blue-400" />
                    <span className="text-xs font-medium text-blue-400">AI Insight</span>
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed">{rec.explanation}</p>
                  
                  {/* Themes */}
                  {rec.themes && rec.themes.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {rec.themes.slice(0, 3).map((theme, i) => (
                        <span
                          key={i}
                          className="text-xs bg-purple-900/30 text-purple-300 px-2 py-1 rounded"
                        >
                          {theme}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Mood */}
                  {rec.mood && (
                    <div className="text-xs text-gray-400">
                      Mood: <span className="text-gray-300">{rec.mood}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Recommendations State */}
      {recommendations.length === 0 && !loading && !error && isAuthenticated && (
        <div className="text-center py-12">
          <FaMagic className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">No recommendations yet. Try selecting a theme above!</p>
        </div>
      )}
    </div>
  );
};

export default AIRecommendations;
