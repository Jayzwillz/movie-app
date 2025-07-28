import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { FaRobot, FaMagic, FaSearch, FaComments, FaChartLine, FaFilm, FaNewspaper, FaPlay } from 'react-icons/fa';
import AIRecommendations from '../components/AIRecommendations';
import AISearch from '../components/AISearch';
import { AIChatButton } from '../components/AIChatbot';
import aiService from '../services/aiService';

const AIFeaturesPage = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState('recommendations');
  const [aiStatus, setAiStatus] = useState({ connected: false, testing: true });

  const tabs = [
    { id: 'recommendations', label: 'AI Recommendations', icon: FaMagic, description: 'Personalized movie suggestions' },
    { id: 'search', label: 'Smart Search', icon: FaSearch, description: 'Natural language movie search' },
    { id: 'analysis', label: 'Movie Analysis', icon: FaFilm, description: 'Deep insights and themes' },
    { id: 'reviews', label: 'Review Analysis', icon: FaChartLine, description: 'AI-powered review summaries' },
    { id: 'news', label: 'Personalized News', icon: FaNewspaper, description: 'Curated movie updates' },
  ];

  useEffect(() => {
    testAIConnection();
  }, []);

  const testAIConnection = async () => {
    try {
      setAiStatus({ connected: false, testing: true });
      const result = await aiService.testConnection();
      setAiStatus({ 
        connected: result.success, 
        testing: false,
        message: result.message 
      });
    } catch (error) {
      setAiStatus({ 
        connected: false, 
        testing: false,
        error: 'AI service unavailable' 
      });
    }
  };

  const handleSearchResults = (searchParameters, interpretation) => {
    // Handle search results - you can integrate this with your movie search
    console.log('AI Search Results:', { searchParameters, interpretation });
  };

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
              <FaRobot className="w-8 h-8 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-4xl font-bold text-white">AI-Powered Features</h1>
              <p className="text-xl text-gray-400">Enhanced by Google Gemini AI</p>
            </div>
          </div>

          {/* AI Status */}
          <div className="inline-flex items-center gap-3 bg-gray-800 rounded-lg px-6 py-3 mb-8">
            <div className={`w-3 h-3 rounded-full ${
              aiStatus.testing ? 'bg-yellow-500 animate-pulse' : 
              aiStatus.connected ? 'bg-green-500' : 'bg-red-500'
            }`}></div>
            <span className="text-white font-medium">
              {aiStatus.testing ? 'Testing AI Connection...' : 
               aiStatus.connected ? 'AI Service Online' : 'AI Service Offline'}
            </span>
            {!aiStatus.testing && (
              <button
                onClick={testAIConnection}
                className="text-blue-400 hover:text-blue-300 text-sm"
              >
                Refresh
              </button>
            )}
          </div>

          <p className="text-gray-300 max-w-3xl mx-auto">
            Experience the future of movie discovery with our AI-powered features. Get personalized recommendations, 
            intelligent search, deep movie analysis, and more - all powered by advanced artificial intelligence.
          </p>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <div className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 border border-blue-700/50 rounded-lg p-6">
            <FaMagic className="w-8 h-8 text-blue-400 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Smart Recommendations</h3>
            <p className="text-gray-300 text-sm">AI learns your preferences and suggests movies you'll love with detailed explanations.</p>
          </div>
          
          <div className="bg-gradient-to-br from-green-900/30 to-teal-900/30 border border-green-700/50 rounded-lg p-6">
            <FaSearch className="w-8 h-8 text-green-400 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Natural Language Search</h3>
            <p className="text-gray-300 text-sm">Search using natural language like "action movies similar to Marvel but more emotional".</p>
          </div>
          
          <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border border-purple-700/50 rounded-lg p-6">
            <FaFilm className="w-8 h-8 text-purple-400 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Deep Movie Analysis</h3>
            <p className="text-gray-300 text-sm">Understand themes, symbolism, and cultural context with AI-generated insights.</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-700">
            <nav className="-mb-px flex space-x-8 overflow-x-auto">
              {tabs.map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center gap-2 ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-400'
                        : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="mb-8">
          {activeTab === 'recommendations' && (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">AI Movie Recommendations</h2>
                <p className="text-gray-400">Get personalized movie suggestions based on your preferences and viewing history.</p>
              </div>
              <AIRecommendations />
            </div>
          )}

          {activeTab === 'search' && (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">Intelligent Movie Search</h2>
                <p className="text-gray-400">Search for movies using natural language and complex preferences.</p>
              </div>
              <AISearch onSearchResults={handleSearchResults} />
            </div>
          )}

          {activeTab === 'analysis' && (
            <div className="text-center py-12">
              <FaFilm className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Movie Analysis</h3>
              <p className="text-gray-400 mb-6">Visit any movie detail page to see AI-powered analysis of themes, characters, and cultural context.</p>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors">
                Browse Movies
              </button>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="text-center py-12">
              <FaChartLine className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Review Analysis</h3>
              <p className="text-gray-400 mb-6">AI analyzes hundreds of reviews to provide sentiment analysis, key themes, and audience insights.</p>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors">
                View Movie Reviews
              </button>
            </div>
          )}

          {activeTab === 'news' && (
            <div className="text-center py-12">
              <FaNewspaper className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Personalized Movie News</h3>
              <p className="text-gray-400 mb-6">Coming Soon! Get curated movie news and updates based on your interests.</p>
              <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-4 max-w-md mx-auto">
                <p className="text-yellow-300 text-sm">This feature is in development and will be available soon!</p>
              </div>
            </div>
          )}
        </div>

        {/* AI Chat Assistant */}
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 border border-gray-700 rounded-lg p-8 text-center">
          <FaComments className="w-12 h-12 text-blue-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">AI Movie Assistant</h3>
          <p className="text-gray-400 mb-6">
            Have questions about movies? Want recommendations? Our AI assistant is here to help with movie trivia, 
            plot explanations, and personalized suggestions.
          </p>
          <AIChatButton className="mx-auto" />
        </div>

        {/* Authentication Notice */}
        {!isAuthenticated && (
          <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-6 text-center mt-8">
            <FaRobot className="w-8 h-8 text-blue-400 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-white mb-2">Unlock Full AI Features</h3>
            <p className="text-blue-100 mb-4">
              Sign in to access personalized recommendations, chat with our AI assistant, and get tailored movie insights.
            </p>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors">
              Sign In to Continue
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIFeaturesPage;
