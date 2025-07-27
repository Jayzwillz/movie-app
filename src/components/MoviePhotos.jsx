import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { FaArrowLeft, FaTimes, FaChevronLeft, FaChevronRight, FaDownload, FaExpand } from 'react-icons/fa';

const MoviePhotos = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();
  
  const { allImages = [], movie = {} } = location.state || {};
  
  const [activeTab, setActiveTab] = useState('all');
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  const [imageFilter, setImageFilter] = useState('all');

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

  // Separate images by type
  const backdrops = allImages.filter(img => img.aspect_ratio > 1.5);
  const posters = allImages.filter(img => img.aspect_ratio <= 1.5);

  const getFilteredImages = () => {
    switch (imageFilter) {
      case 'backdrops':
        return backdrops;
      case 'posters':
        return posters;
      default:
        return allImages;
    }
  };

  const filteredImages = getFilteredImages();

  const handleImageClick = (index) => {
    setSelectedImageIndex(index);
  };

  const handlePrevImage = () => {
    setSelectedImageIndex(selectedImageIndex > 0 ? selectedImageIndex - 1 : filteredImages.length - 1);
  };

  const handleNextImage = () => {
    setSelectedImageIndex(selectedImageIndex < filteredImages.length - 1 ? selectedImageIndex + 1 : 0);
  };

  const handleDownload = (imagePath) => {
    const link = document.createElement('a');
    link.href = `https://image.tmdb.org/t/p/original${imagePath}`;
    link.download = `${movie.title}-image-${Date.now()}.jpg`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
              <p className="text-gray-400">Photos & Images ({allImages.length})</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setImageFilter('all')}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              imageFilter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            All Images ({allImages.length})
          </button>
          <button
            onClick={() => setImageFilter('backdrops')}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              imageFilter === 'backdrops'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Backdrops ({backdrops.length})
          </button>
          <button
            onClick={() => setImageFilter('posters')}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              imageFilter === 'posters'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Posters ({posters.length})
          </button>
        </div>

        {/* Images Grid */}
        {filteredImages.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredImages.map((image, index) => (
              <div
                key={`${image.file_path}-${index}`}
                className="relative group cursor-pointer"
                onClick={() => handleImageClick(index)}
              >
                <div className={`${image.aspect_ratio > 1.5 ? 'aspect-video' : 'aspect-[2/3]'} overflow-hidden rounded-lg`}>
                  <img
                    src={`https://image.tmdb.org/t/p/w500${image.file_path}`}
                    alt={`${movie.title} image ${index + 1}`}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                  <FaExpand className="w-6 h-6 text-white" />
                </div>
                
                {/* Image Info */}
                <div className="absolute bottom-2 left-2 right-2 text-xs bg-black/70 rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-white">{image.width} × {image.height}</p>
                  {image.vote_average > 0 && (
                    <p className="text-yellow-400">★ {image.vote_average.toFixed(1)}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-400">No images found for this filter.</p>
          </div>
        )}
      </div>

      {/* Image Lightbox */}
      {selectedImageIndex !== null && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center">
          {/* Close Button */}
          <button
            onClick={() => setSelectedImageIndex(null)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10"
          >
            <FaTimes className="w-8 h-8" />
          </button>
          
          {/* Download Button */}
          <button
            onClick={() => handleDownload(filteredImages[selectedImageIndex].file_path)}
            className="absolute top-4 right-16 text-white hover:text-gray-300 transition-colors z-10"
          >
            <FaDownload className="w-6 h-6" />
          </button>
          
          {/* Previous Button */}
          {filteredImages.length > 1 && (
            <button
              onClick={handlePrevImage}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 transition-colors z-10"
            >
              <FaChevronLeft className="w-8 h-8" />
            </button>
          )}
          
          {/* Next Button */}
          {filteredImages.length > 1 && (
            <button
              onClick={handleNextImage}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 transition-colors z-10"
            >
              <FaChevronRight className="w-8 h-8" />
            </button>
          )}
          
          {/* Main Image */}
          <div className="max-w-full max-h-full p-4">
            <img
              src={`https://image.tmdb.org/t/p/original${filteredImages[selectedImageIndex].file_path}`}
              alt={`${movie.title} image ${selectedImageIndex + 1}`}
              className="max-w-full max-h-full object-contain"
            />
          </div>
          
          {/* Image Info Bar */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-lg">
            <div className="text-center">
              <p className="text-sm">
                {selectedImageIndex + 1} / {filteredImages.length}
              </p>
              <p className="text-xs text-gray-300">
                {filteredImages[selectedImageIndex].width} × {filteredImages[selectedImageIndex].height}
                {filteredImages[selectedImageIndex].vote_average > 0 && (
                  <span className="ml-2 text-yellow-400">
                    ★ {filteredImages[selectedImageIndex].vote_average.toFixed(1)}
                  </span>
                )}
              </p>
            </div>
          </div>
          
          {/* Keyboard Navigation Hint */}
          <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 text-gray-400 text-xs">
            <p>Use arrow keys or click to navigate • ESC to close</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MoviePhotos;
