import React, { useState, useEffect } from 'react';
import { FaRobot, FaFilm, FaUsers, FaEye, FaQuestionCircle, FaGlobe, FaLightbulb, FaRedo } from 'react-icons/fa';
import aiService from '../services/aiService';

const AIMovieAnalysis = ({ movieData, onAnalysisComplete }) => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expandedSections, setExpandedSections] = useState({
    themes: true,
    characters: false,
    cinematography: false,
    cultural: false,
    discussion: false,
    similar: false
  });

  const analyzeMovie = async () => {
    if (!movieData) return;

    setLoading(true);
    setError('');

    try {
      const response = await aiService.analyzeMovie(movieData);
      
      if (response.success) {
        setAnalysis(response.analysis);
        if (onAnalysisComplete) {
          onAnalysisComplete(response.analysis);
        }
      } else {
        setError('Failed to analyze movie');
      }
    } catch (error) {
      console.error('AI Movie Analysis Error:', error);
      setError('Unable to analyze movie. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (movieData && movieData.title) {
      analyzeMovie();
    }
  }, [movieData]);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  if (loading) {
    return (
      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <FaRobot className="w-6 h-6 text-blue-500 animate-pulse" />
          <div>
            <h3 className="text-lg font-semibold text-white">AI Movie Analysis</h3>
            <p className="text-sm text-gray-400">Deep diving into themes and meaning</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-gray-400">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
            <span>Analyzing themes, characters, and cultural context...</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {['Themes & Symbolism', 'Character Analysis', 'Cultural Context'].map((item, i) => (
              <div key={i} className="bg-gray-700/50 rounded-lg p-4 animate-pulse">
                <div className="h-4 bg-gray-600 rounded mb-2"></div>
                <div className="h-3 bg-gray-600 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-700 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-2">
          <FaFilm className="w-5 h-5 text-red-400" />
          <h3 className="text-lg font-semibold text-red-400">Analysis Failed</h3>
        </div>
        <p className="text-red-300 mb-4">{error}</p>
        <button
          onClick={analyzeMovie}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
        >
          <FaRedo className="w-4 h-4" />
          Try Again
        </button>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 text-center">
        <FaRobot className="w-8 h-8 text-gray-500 mx-auto mb-3" />
        <p className="text-gray-400 mb-4">Click to get AI-powered movie analysis</p>
        <button
          onClick={analyzeMovie}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 mx-auto"
        >
          <FaRobot className="w-4 h-4" />
          Analyze Movie
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FaRobot className="w-6 h-6 text-blue-500" />
          <div>
            <h3 className="text-lg font-semibold text-white">AI Movie Analysis</h3>
            <p className="text-sm text-gray-400">Deep insights powered by Gemini AI</p>
          </div>
        </div>
        <button
          onClick={analyzeMovie}
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg transition-colors text-sm flex items-center gap-2"
        >
          <FaRedo className="w-3 h-3" />
          Refresh
        </button>
      </div>

      {/* Themes & Symbolism */}
      {analysis.themes && (
        <div className="bg-purple-900/20 border border-purple-700 rounded-lg p-6">
          <button
            onClick={() => toggleSection('themes')}
            className="w-full flex items-center justify-between mb-4 text-left"
          >
            <h4 className="text-lg font-semibold text-purple-400 flex items-center gap-2">
              <FaFilm className="w-5 h-5" />
              Themes & Symbolism
            </h4>
            <span className="text-purple-400">{expandedSections.themes ? '−' : '+'}</span>
          </button>
          
          {expandedSections.themes && (
            <div className="space-y-4">
              {analysis.themes.primary && analysis.themes.primary.length > 0 && (
                <div>
                  <h5 className="font-medium text-purple-300 mb-2">Primary Themes:</h5>
                  <div className="flex flex-wrap gap-2">
                    {analysis.themes.primary.map((theme, i) => (
                      <span key={i} className="bg-purple-900/40 text-purple-200 px-3 py-1 rounded-full text-sm">
                        {theme}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {analysis.themes.secondary && analysis.themes.secondary.length > 0 && (
                <div>
                  <h5 className="font-medium text-purple-300 mb-2">Supporting Themes:</h5>
                  <div className="flex flex-wrap gap-2">
                    {analysis.themes.secondary.map((theme, i) => (
                      <span key={i} className="bg-purple-900/20 text-purple-300 px-3 py-1 rounded-full text-sm">
                        {theme}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {analysis.themes.symbolism && analysis.themes.symbolism.length > 0 && (
                <div>
                  <h5 className="font-medium text-purple-300 mb-2">Key Symbols:</h5>
                  <ul className="space-y-1">
                    {analysis.themes.symbolism.map((symbol, i) => (
                      <li key={i} className="text-purple-100 flex items-start gap-2">
                        <span className="text-purple-400 mt-1">•</span>
                        <span>{symbol}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Character Analysis */}
      {analysis.character_analysis && (
        <div className="bg-green-900/20 border border-green-700 rounded-lg p-6">
          <button
            onClick={() => toggleSection('characters')}
            className="w-full flex items-center justify-between mb-4 text-left"
          >
            <h4 className="text-lg font-semibold text-green-400 flex items-center gap-2">
              <FaUsers className="w-5 h-5" />
              Character Analysis
            </h4>
            <span className="text-green-400">{expandedSections.characters ? '−' : '+'}</span>
          </button>
          
          {expandedSections.characters && (
            <div className="space-y-4">
              {analysis.character_analysis.protagonist_journey && (
                <div>
                  <h5 className="font-medium text-green-300 mb-2">Protagonist Journey:</h5>
                  <p className="text-green-100">{analysis.character_analysis.protagonist_journey}</p>
                </div>
              )}
              
              {analysis.character_analysis.relationships && (
                <div>
                  <h5 className="font-medium text-green-300 mb-2">Key Relationships:</h5>
                  <p className="text-green-100">{analysis.character_analysis.relationships}</p>
                </div>
              )}
              
              {analysis.character_analysis.archetypes && (
                <div>
                  <h5 className="font-medium text-green-300 mb-2">Character Archetypes:</h5>
                  <p className="text-green-100">{analysis.character_analysis.archetypes}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Cinematography */}
      {analysis.cinematography && (
        <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-6">
          <button
            onClick={() => toggleSection('cinematography')}
            className="w-full flex items-center justify-between mb-4 text-left"
          >
            <h4 className="text-lg font-semibold text-yellow-400 flex items-center gap-2">
              <FaEye className="w-5 h-5" />
              Visual Style & Cinematography
            </h4>
            <span className="text-yellow-400">{expandedSections.cinematography ? '−' : '+'}</span>
          </button>
          
          {expandedSections.cinematography && (
            <div className="space-y-4">
              {analysis.cinematography.style && (
                <div>
                  <h5 className="font-medium text-yellow-300 mb-2">Visual Style:</h5>
                  <p className="text-yellow-100">{analysis.cinematography.style}</p>
                </div>
              )}
              
              {analysis.cinematography.mood && (
                <div>
                  <h5 className="font-medium text-yellow-300 mb-2">Visual Mood:</h5>
                  <p className="text-yellow-100">{analysis.cinematography.mood}</p>
                </div>
              )}
              
              {analysis.cinematography.notable_elements && analysis.cinematography.notable_elements.length > 0 && (
                <div>
                  <h5 className="font-medium text-yellow-300 mb-2">Notable Elements:</h5>
                  <ul className="space-y-1">
                    {analysis.cinematography.notable_elements.map((element, i) => (
                      <li key={i} className="text-yellow-100 flex items-start gap-2">
                        <span className="text-yellow-400 mt-1">•</span>
                        <span>{element}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Cultural Context */}
      {analysis.cultural_context && (
        <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-6">
          <button
            onClick={() => toggleSection('cultural')}
            className="w-full flex items-center justify-between mb-4 text-left"
          >
            <h4 className="text-lg font-semibold text-blue-400 flex items-center gap-2">
              <FaGlobe className="w-5 h-5" />
              Cultural & Historical Context
            </h4>
            <span className="text-blue-400">{expandedSections.cultural ? '−' : '+'}</span>
          </button>
          
          {expandedSections.cultural && (
            <div className="space-y-4">
              {analysis.cultural_context.historical_period && (
                <div>
                  <h5 className="font-medium text-blue-300 mb-2">Historical Context:</h5>
                  <p className="text-blue-100">{analysis.cultural_context.historical_period}</p>
                </div>
              )}
              
              {analysis.cultural_context.social_commentary && (
                <div>
                  <h5 className="font-medium text-blue-300 mb-2">Social Commentary:</h5>
                  <p className="text-blue-100">{analysis.cultural_context.social_commentary}</p>
                </div>
              )}
              
              {analysis.cultural_context.cultural_impact && (
                <div>
                  <h5 className="font-medium text-blue-300 mb-2">Cultural Impact:</h5>
                  <p className="text-blue-100">{analysis.cultural_context.cultural_impact}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Discussion Questions */}
      {analysis.discussion_questions && analysis.discussion_questions.length > 0 && (
        <div className="bg-orange-900/20 border border-orange-700 rounded-lg p-6">
          <button
            onClick={() => toggleSection('discussion')}
            className="w-full flex items-center justify-between mb-4 text-left"
          >
            <h4 className="text-lg font-semibold text-orange-400 flex items-center gap-2">
              <FaQuestionCircle className="w-5 h-5" />
              Discussion Questions ({analysis.discussion_questions.length})
            </h4>
            <span className="text-orange-400">{expandedSections.discussion ? '−' : '+'}</span>
          </button>
          
          {expandedSections.discussion && (
            <div className="space-y-3">
              {analysis.discussion_questions.map((question, i) => (
                <div key={i} className="bg-orange-900/30 rounded-lg p-4">
                  <p className="text-orange-100 font-medium">{question}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Similar Films */}
      {analysis.similar_films && analysis.similar_films.length > 0 && (
        <div className="bg-indigo-900/20 border border-indigo-700 rounded-lg p-6">
          <button
            onClick={() => toggleSection('similar')}
            className="w-full flex items-center justify-between mb-4 text-left"
          >
            <h4 className="text-lg font-semibold text-indigo-400 flex items-center gap-2">
              <FaFilm className="w-5 h-5" />
              Similar Films
            </h4>
            <span className="text-indigo-400">{expandedSections.similar ? '−' : '+'}</span>
          </button>
          
          {expandedSections.similar && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analysis.similar_films.map((film, i) => (
                <div key={i} className="bg-indigo-900/30 rounded-lg p-4">
                  <h5 className="font-medium text-indigo-200 mb-2">{film.title}</h5>
                  <p className="text-indigo-100 text-sm">{film.reason}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Educational Value & Rewatch Value */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {analysis.educational_value && (
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <FaLightbulb className="w-5 h-5 text-yellow-400" />
              Educational Value
            </h4>
            <p className="text-gray-300">{analysis.educational_value}</p>
          </div>
        )}
        
        {analysis.rewatch_value && (
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <FaRedo className="w-5 h-5 text-green-400" />
              Rewatch Value
            </h4>
            <p className="text-gray-300">{analysis.rewatch_value}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIMovieAnalysis;
