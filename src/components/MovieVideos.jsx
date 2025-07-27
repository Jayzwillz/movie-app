import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { FaArrowLeft, FaTimes, FaPlay, FaExternalLinkAlt, FaFilter } from 'react-icons/fa';

const MovieVideos = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();
  
  const { allVideos = [], movie = {} } = location.state || {};
  
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [videoFilter, setVideoFilter] = useState('all');

  // If no data in state, redirect back
  useEffect(() => {
    if (!location.state) {
      navigate(`/movie/${id}`);
    }
  }, [location.state, navigate, id]);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Get unique video types
  const videoTypes = [...new Set(allVideos.map(video => video.type))];

  const getFilteredVideos = () => {
    if (videoFilter === 'all') {
      return allVideos;
    }
    return allVideos.filter(video => video.type === videoFilter);
  };

  const filteredVideos = getFilteredVideos();

  const handleVideoClick = (video) => {
    setSelectedVideo(video);
  };

  const getVideoTypeColor = (type) => {
    const colors = {
      'Trailer': 'bg-red-600',
      'Teaser': 'bg-orange-600',
      'Clip': 'bg-blue-600',
      'Featurette': 'bg-green-600',
      'Behind the Scenes': 'bg-purple-600',
      'Bloopers': 'bg-pink-600',
    };
    return colors[type] || 'bg-gray-600';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!location.state) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
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
              <p className="text-gray-400">Videos & Trailers ({allVideos.length})</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setVideoFilter('all')}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              videoFilter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            All Videos ({allVideos.length})
          </button>
          {videoTypes.map(type => (
            <button
              key={type}
              onClick={() => setVideoFilter(type)}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                videoFilter === type
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {type} ({allVideos.filter(v => v.type === type).length})
            </button>
          ))}
        </div>

        {/* Videos Grid */}
        {filteredVideos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVideos.map((video, index) => (
              <div
                key={`${video.key}-${index}`}
                className="bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-750 transition-all cursor-pointer hover:scale-105"
                onClick={() => handleVideoClick(video)}
              >
                {/* Video Thumbnail */}
                <div className="aspect-video relative group">
                  <img
                    src={`https://img.youtube.com/vi/${video.key}/maxresdefault.jpg`}
                    alt={video.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = `https://img.youtube.com/vi/${video.key}/hqdefault.jpg`;
                    }}
                  />
                  
                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-red-600 rounded-full p-3">
                      <FaPlay className="w-6 h-6 text-white ml-1" />
                    </div>
                  </div>
                  
                  {/* Video Type Badge */}
                  <div className={`absolute top-2 left-2 ${getVideoTypeColor(video.type)} px-2 py-1 rounded text-xs font-semibold`}>
                    {video.type}
                  </div>
                  
                  {/* Duration Badge (if available) */}
                  {video.duration && (
                    <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-1 rounded text-xs">
                      {video.duration}
                    </div>
                  )}
                </div>
                
                {/* Video Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-white mb-2 line-clamp-2">{video.name}</h3>
                  <div className="flex items-center justify-between text-sm text-gray-400">
                    <span>{video.site}</span>
                    {video.published_at && (
                      <span>{formatDate(video.published_at)}</span>
                    )}
                  </div>
                  {video.size && (
                    <div className="mt-1 text-xs text-gray-500">
                      Quality: {video.size}p
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-400">No videos found for this filter.</p>
          </div>
        )}
      </div>

      {/* Video Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-6xl">
            {/* Close Button */}
            <button
              onClick={() => setSelectedVideo(null)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10"
            >
              <FaTimes className="w-8 h-8" />
            </button>
            
            {/* External Link Button */}
            <button
              onClick={() => window.open(`https://www.youtube.com/watch?v=${selectedVideo.key}`, '_blank')}
              className="absolute top-4 right-16 text-white hover:text-gray-300 transition-colors z-10"
            >
              <FaExternalLinkAlt className="w-6 h-6" />
            </button>
            
            {/* Video Player */}
            <div className="aspect-video">
              <iframe
                className="w-full h-full rounded-lg"
                src={`https://www.youtube.com/embed/${selectedVideo.key}?autoplay=1&rel=0`}
                title={selectedVideo.name}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
            
            {/* Video Info */}
            <div className="mt-6 text-center text-white">
              <h3 className="text-xl font-semibold mb-2">{selectedVideo.name}</h3>
              <div className="flex items-center justify-center gap-4 text-sm text-gray-300">
                <span className={`${getVideoTypeColor(selectedVideo.type)} px-2 py-1 rounded`}>
                  {selectedVideo.type}
                </span>
                <span>{selectedVideo.site}</span>
                {selectedVideo.published_at && (
                  <span>{formatDate(selectedVideo.published_at)}</span>
                )}
                {selectedVideo.size && (
                  <span>{selectedVideo.size}p</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MovieVideos;
