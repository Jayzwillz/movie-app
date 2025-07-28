import React, { useState, useEffect } from 'react';
import { FaRobot, FaChartLine, FaThumbsUp, FaThumbsDown, FaUsers, FaLightbulb, FaBullseye, FaExclamationTriangle } from 'react-icons/fa';
import aiService from '../services/aiService';

const AIReviewAnalysis = ({ movieId, movieTitle, tmdbReviews = [], onAnalysisComplete }) => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const analyzeReviews = async () => {
    if (!movieId || !movieTitle) return;

    setLoading(true);
    setError('');

    try {
      const response = await aiService.analyzeReviews(movieId, movieTitle, tmdbReviews);
      
      if (response.success) {
        setAnalysis(response.analysis);
        if (onAnalysisComplete) {
          onAnalysisComplete(response.analysis);
        }
      } else {
        setError('Failed to analyze reviews');
      }
    } catch (error) {
      console.error('AI Review Analysis Error:', error);
      setError('Unable to analyze reviews. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (movieId && movieTitle) {
      analyzeReviews();
    }
  }, [movieId, movieTitle, tmdbReviews.length]);

  const getSentimentColor = (score) => {
    if (score >= 8) return 'text-green-400';
    if (score >= 6) return 'text-yellow-400';
    if (score >= 4) return 'text-orange-400';
    return 'text-red-400';
  };

  const getSentimentBg = (score) => {
    if (score >= 8) return 'bg-green-900/20 border-green-700';
    if (score >= 6) return 'bg-yellow-900/20 border-yellow-700';
    if (score >= 4) return 'bg-orange-900/20 border-orange-700';
    return 'bg-red-900/20 border-red-700';
  };

  if (loading) {
    return (
      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <FaRobot className="w-6 h-6 text-blue-500 animate-pulse" />
          <h3 className="text-lg font-semibold text-white">AI Review Analysis</h3>
        </div>
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-gray-400">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
            <span>Analyzing reviews with AI...</span>
          </div>
          <div className="text-sm text-gray-500">
            Processing sentiment, themes, and audience insights
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-700 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-2">
          <FaExclamationTriangle className="w-5 h-5 text-red-400" />
          <h3 className="text-lg font-semibold text-red-400">Analysis Failed</h3>
        </div>
        <p className="text-red-300">{error}</p>
        <button
          onClick={analyzeReviews}
          className="mt-3 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 text-center">
        <FaRobot className="w-8 h-8 text-gray-500 mx-auto mb-3" />
        <p className="text-gray-400">No review analysis available</p>
        <button
          onClick={analyzeReviews}
          className="mt-3 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Analyze Reviews
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* AI Analysis Header */}
      <div className="flex items-center gap-3">
        <FaRobot className="w-6 h-6 text-blue-500" />
        <div>
          <h3 className="text-lg font-semibold text-white">AI Review Analysis</h3>
          <p className="text-sm text-gray-400">Powered by Gemini AI</p>
        </div>
      </div>

      {/* Overall Sentiment */}
      <div className={`rounded-lg p-6 border ${getSentimentBg(analysis.overall_sentiment?.score || 5)}`}>
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-white flex items-center gap-2">
            <FaChartLine className="w-5 h-5" />
            Overall Sentiment
          </h4>
          <div className="text-right">
            <div className={`text-2xl font-bold ${getSentimentColor(analysis.overall_sentiment?.score || 5)}`}>
              {analysis.overall_sentiment?.score || 'N/A'}/10
            </div>
            <div className="text-sm text-gray-400">
              {analysis.overall_sentiment?.label || 'Unknown'}
            </div>
          </div>
        </div>
        <p className="text-gray-300">{analysis.overall_sentiment?.explanation}</p>
      </div>

      {/* Summary */}
      {analysis.summary && (
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-white mb-3">AI Summary</h4>
          <p className="text-gray-300 leading-relaxed">{analysis.summary}</p>
        </div>
      )}

      {/* Pros and Cons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pros */}
        {analysis.pros && analysis.pros.length > 0 && (
          <div className="bg-green-900/20 border border-green-700 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-green-400 mb-4 flex items-center gap-2">
              <FaThumbsUp className="w-5 h-5" />
              What Critics Love
            </h4>
            <ul className="space-y-2">
              {analysis.pros.map((pro, index) => (
                <li key={index} className="text-green-100 flex items-start gap-2">
                  <span className="text-green-400 mt-1">•</span>
                  <span>{pro}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Cons */}
        {analysis.cons && analysis.cons.length > 0 && (
          <div className="bg-red-900/20 border border-red-700 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-red-400 mb-4 flex items-center gap-2">
              <FaThumbsDown className="w-5 h-5" />
              Common Criticisms
            </h4>
            <ul className="space-y-2">
              {analysis.cons.map((con, index) => (
                <li key={index} className="text-red-100 flex items-start gap-2">
                  <span className="text-red-400 mt-1">•</span>
                  <span>{con}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Key Themes */}
      {analysis.key_themes && analysis.key_themes.length > 0 && (
        <div className="bg-purple-900/20 border border-purple-700 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-purple-400 mb-4 flex items-center gap-2">
            <FaLightbulb className="w-5 h-5" />
            Key Themes Discussed
          </h4>
          <div className="flex flex-wrap gap-2">
            {analysis.key_themes.map((theme, index) => (
              <span
                key={index}
                className="bg-purple-900/30 text-purple-300 px-3 py-1 rounded-full text-sm"
              >
                {theme}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Target Audience */}
      {analysis.target_audience && (
        <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-blue-400 mb-4 flex items-center gap-2">
            <FaBullseye className="w-5 h-5" />
            Who Should Watch This
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {analysis.target_audience.primary && (
              <div>
                <h5 className="font-medium text-green-400 mb-2">Perfect For:</h5>
                <p className="text-green-100 text-sm">{analysis.target_audience.primary}</p>
              </div>
            )}
            {analysis.target_audience.secondary && (
              <div>
                <h5 className="font-medium text-yellow-400 mb-2">Might Enjoy:</h5>
                <p className="text-yellow-100 text-sm">{analysis.target_audience.secondary}</p>
              </div>
            )}
            {analysis.target_audience.avoid_if && (
              <div>
                <h5 className="font-medium text-red-400 mb-2">Skip If:</h5>
                <p className="text-red-100 text-sm">{analysis.target_audience.avoid_if}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Critics vs Audience */}
      {analysis.critics_vs_audience && (
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            <FaUsers className="w-5 h-5" />
            Critics vs Audience
          </h4>
          <p className="text-gray-300">{analysis.critics_vs_audience}</p>
        </div>
      )}

      {/* Final Recommendation */}
      {analysis.recommendation && (
        <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-700/50 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-white mb-3">AI Recommendation</h4>
          <p className="text-gray-200 leading-relaxed">{analysis.recommendation}</p>
          {analysis.confidence && (
            <div className="mt-3 flex items-center gap-2">
              <span className="text-sm text-gray-400">Confidence:</span>
              <span className={`font-bold ${getSentimentColor(analysis.confidence)}`}>
                {analysis.confidence}%
              </span>
            </div>
          )}
        </div>
      )}

      {/* Refresh Button */}
      <div className="text-center">
        <button
          onClick={analyzeReviews}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors flex items-center gap-2 mx-auto"
        >
          <FaRobot className="w-4 h-4" />
          Re-analyze Reviews
        </button>
      </div>
    </div>
  );
};

export default AIReviewAnalysis;
