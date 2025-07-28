import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { FaRobot, FaPaperPlane, FaUser, FaStar, FaFilm, FaLightbulb, FaHeart } from 'react-icons/fa';
import aiService from '../services/aiService';

const AIChatbot = ({ movieTitle = null, isOpen = false, onClose }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationStarted, setConversationStarted] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && !conversationStarted) {
      initializeChat();
    }
  }, [isOpen, movieTitle]);

  const initializeChat = () => {
    const welcomeMessage = {
      id: Date.now(),
      type: 'ai',
      message: movieTitle 
        ? `Hi! I'm your AI movie assistant. I can help you understand more about "${movieTitle}" or answer any movie-related questions you have. What would you like to know?`
        : "Hello! I'm your AI movie assistant. I can help you discover movies, understand plots, share trivia, and give recommendations. What can I help you with today?",
      timestamp: new Date().toISOString()
    };
    
    setMessages([welcomeMessage]);
    setConversationStarted(true);
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    
    if (!currentMessage.trim() || loading) return;
    if (!isAuthenticated) {
      alert('Please sign in to chat with AI assistant');
      return;
    }

    const userMessage = {
      id: Date.now(),
      type: 'user',
      message: currentMessage.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setLoading(true);

    try {
      const conversationHistory = messages.slice(-10); // Last 10 messages for context
      
      const response = await aiService.chatWithAssistant(
        userMessage.message,
        movieTitle,
        conversationHistory
      );

      if (response.success) {
        const aiMessage = {
          id: Date.now() + 1,
          type: 'ai',
          message: response.response,
          timestamp: response.timestamp
        };
        
        setMessages(prev => [...prev, aiMessage]);
      } else {
        throw new Error('Failed to get AI response');
      }
    } catch (error) {
      console.error('Chatbot Error:', error);
      const errorMessage = {
        id: Date.now() + 1,
        type: 'ai',
        message: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date().toISOString(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setCurrentMessage(suggestion);
  };

  const suggestions = movieTitle 
    ? [
        `Tell me about the themes in ${movieTitle}`,
        `What's the plot of ${movieTitle}?`,
        `Who are the main actors in ${movieTitle}?`,
        `Is ${movieTitle} worth watching?`,
        `What movies are similar to ${movieTitle}?`
      ]
    : [
        "Recommend a movie for tonight",
        "What's a good sci-fi movie?",
        "Movies like The Dark Knight",
        "Best comedies of 2023",
        "Explain the ending of Inception"
      ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-lg shadow-2xl w-full max-w-2xl h-[600px] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <FaRobot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">AI Movie Assistant</h3>
              <p className="text-sm text-gray-400">
                {movieTitle ? `Discussing: ${movieTitle}` : 'General movie chat'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-2"
          >
            ✕
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {!isAuthenticated ? (
            <div className="text-center py-8">
              <FaRobot className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 mb-4">Sign in to chat with AI assistant</p>
              <button
                onClick={onClose}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
              >
                Close
              </button>
            </div>
          ) : (
            <>
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.type === 'ai' && (
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <FaRobot className="w-4 h-4 text-white" />
                    </div>
                  )}
                  
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      msg.type === 'user'
                        ? 'bg-blue-600 text-white'
                        : msg.isError
                        ? 'bg-red-900/30 border border-red-700 text-red-300'
                        : 'bg-gray-800 text-gray-100'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.message}</p>
                    <p className="text-xs mt-2 opacity-70">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </p>
                  </div>

                  {msg.type === 'user' && (
                    <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <FaUser className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
              ))}

              {loading && (
                <div className="flex gap-3 justify-start">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <FaRobot className="w-4 h-4 text-white animate-pulse" />
                  </div>
                  <div className="bg-gray-800 text-gray-100 p-3 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Suggestions */}
        {isAuthenticated && messages.length <= 1 && (
          <div className="px-4 py-2 border-t border-gray-700">
            <div className="flex items-center gap-2 mb-2">
              <FaStar className="w-3 h-3 text-blue-400" />
              <span className="text-xs text-gray-400">Try asking:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {suggestions.slice(0, 3).map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1 rounded-full transition-colors"
                  disabled={loading}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        {isAuthenticated && (
          <form onSubmit={sendMessage} className="p-4 border-t border-gray-700">
            <div className="flex gap-3">
              <input
                type="text"
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                placeholder="Ask me anything about movies..."
                className="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !currentMessage.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white p-2 rounded-lg transition-colors"
              >
                <FaPaperPlane className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

// Quick Chat Button Component
export const AIChatButton = ({ movieTitle = null, className = "" }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${className}`}
      >
        <FaRobot className="w-4 h-4" />
        AI Assistant
      </button>
      
      <AIChatbot
        movieTitle={movieTitle}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
};

export default AIChatbot;
