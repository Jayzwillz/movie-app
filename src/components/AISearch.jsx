import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { FaRobot, FaSearch, FaLightbulb, FaMagic, FaStar, FaTag } from 'react-icons/fa';
import aiService from '../services/aiService';

const AISearch = ({ onSearchResults }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchResult, setSearchResult] = useState(null);
  const [error, setError] = useState('');

  const handleAISearch = async (e) => {
    e.preventDefault();
    
    if (!query.trim()) return;
    if (!isAuthenticated) {
      setError('Please sign in to use AI-powered search');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await aiService.searchWithNaturalLanguage(query);
      
      if (response.success) {
        setSearchResult(response);
        // Pass search parameters to parent component for actual movie search
        if (onSearchResults && response.search_parameters) {
          onSearchResults(response.search_parameters, response.interpretation);
        }
      } else {
        setError('Failed to analyze search query');
      }
    } catch (error) {
      console.error('AI Search Error:', error);
      setError('Unable to process search with AI. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const exampleQueries = [
    "Movies like Inception but funnier",
    "90s sci-fi with strong female leads",
    "Feel-good movies for after a breakup",
    "Mind-bending thrillers like Christopher Nolan films",
    "Action movies similar to Marvel but more grounded",
    "Romantic comedies from the 2000s with happy endings"
  ];

  const handleExampleClick = (example) => {
    setQuery(example);
  };

  return (
    <div className="space-y-6">
      {/* AI Search Header */}
      <div className="text-center space-y-3">
        <div className="flex items-center justify-center gap-3">
          <FaRobot className="w-8 h-8 text-blue-500" />
          <h2 className="text-2xl font-bold text-white">AI-Powered Search</h2>
        </div>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Describe what you're looking for in natural language. Our AI understands context, mood, and complex preferences.
        </p>
      </div>

      {/* Search Form */}
      <form onSubmit={handleAISearch} className="space-y-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <FaRobot className="h-5 w-5 text-blue-400" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask me anything... 'Movies like Avengers but more emotional'"
            className="w-full pl-12 pr-4 py-4 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !query.trim() || !isAuthenticated}
            className="absolute inset-y-0 right-0 pr-4 flex items-center"
          >
            <div className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2">
              {loading ? (
                <>
                  <FaRobot className="w-4 h-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <FaSearch className="w-4 h-4" />
                  AI Search
                </>
              )}
            </div>
          </button>
        </div>

        {!isAuthenticated && (
          <div className="text-center text-gray-400 text-sm">
            Sign in to unlock AI-powered natural language search
          </div>
        )}
      </form>

      {/* Example Queries */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-gray-400">
          <FaLightbulb className="w-4 h-4" />
          <span className="text-sm font-medium">Try these examples:</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {exampleQueries.map((example, index) => (
            <button
              key={index}
              onClick={() => handleExampleClick(example)}
              className="text-left p-3 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700 rounded-lg text-gray-300 text-sm transition-colors"
              disabled={loading}
            >
              "{example}"
            </button>
          ))}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-900/20 border border-red-700 rounded-lg p-4 text-red-400">
          {error}
        </div>
      )}

      {/* AI Search Results */}
      {searchResult && !loading && (
        <div className="space-y-6">
          {/* AI Interpretation */}
          <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <FaMagic className="text-blue-400" />
              AI Understanding
            </h3>
            <p className="text-blue-100 mb-4">"{searchResult.interpretation}"</p>
            
            {/* Search Parameters */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              {searchResult.search_parameters.genres && searchResult.search_parameters.genres.length > 0 && (
                <div>
                  <span className="text-gray-400">Genres:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {searchResult.search_parameters.genres.map((genre, i) => (
                      <span key={i} className="bg-purple-900/30 text-purple-300 px-2 py-1 rounded text-xs">
                        {genre}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {searchResult.search_parameters.themes && searchResult.search_parameters.themes.length > 0 && (
                <div>
                  <span className="text-gray-400">Themes:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {searchResult.search_parameters.themes.map((theme, i) => (
                      <span key={i} className="bg-green-900/30 text-green-300 px-2 py-1 rounded text-xs">
                        {theme}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {searchResult.search_parameters.mood && (
                <div>
                  <span className="text-gray-400">Mood:</span>
                  <div className="mt-1">
                    <span className="bg-yellow-900/30 text-yellow-300 px-2 py-1 rounded text-xs">
                      {searchResult.search_parameters.mood}
                    </span>
                  </div>
                </div>
              )}
              
              {searchResult.search_parameters.year_range && (searchResult.search_parameters.year_range.min || searchResult.search_parameters.year_range.max) && (
                <div>
                  <span className="text-gray-400">Year Range:</span>
                  <div className="mt-1 text-gray-300">
                    {searchResult.search_parameters.year_range.min || '?'} - {searchResult.search_parameters.year_range.max || 'Present'}
                  </div>
                </div>
              )}
              
              {searchResult.search_parameters.rating_range && (searchResult.search_parameters.rating_range.min || searchResult.search_parameters.rating_range.max) && (
                <div>
                  <span className="text-gray-400">Rating Range:</span>
                  <div className="mt-1 text-gray-300 flex items-center gap-1">
                    <FaStar className="text-yellow-400 w-3 h-3" />
                    {searchResult.search_parameters.rating_range.min || 0}+ / 10
                  </div>
                </div>
              )}
              
              {searchResult.search_parameters.similar_to && searchResult.search_parameters.similar_to.length > 0 && (
                <div className="md:col-span-2 lg:col-span-3">
                  <span className="text-gray-400">Similar To:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {searchResult.search_parameters.similar_to.map((movie, i) => (
                      <span key={i} className="bg-orange-900/30 text-orange-300 px-2 py-1 rounded text-xs">
                        {movie}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* AI Movie Suggestions */}
          {searchResult.movie_suggestions && searchResult.movie_suggestions.length > 0 && (
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <FaTag className="text-green-400" />
                AI Suggestions ({searchResult.movie_suggestions.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {searchResult.movie_suggestions.map((suggestion, index) => (
                  <div key={index} className="bg-gray-700/50 rounded-lg p-4 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-white">{suggestion.title}</h4>
                        <p className="text-sm text-gray-400">{suggestion.year}</p>
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        <FaStar className="text-yellow-400 w-3 h-3" />
                        <span className="text-gray-300">{suggestion.confidence}%</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-300">{suggestion.match_reason}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Search Tips */}
          {searchResult.search_tips && (
            <div className="bg-green-900/20 border border-green-700/50 rounded-lg p-4">
              <h4 className="font-medium text-green-400 mb-2 flex items-center gap-2">
                <FaLightbulb className="w-4 h-4" />
                Search Tips
              </h4>
              <p className="text-green-100 text-sm">{searchResult.search_tips}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AISearch;
