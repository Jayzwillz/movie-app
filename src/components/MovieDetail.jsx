import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { addToWatchlist, removeFromWatchlist, addToWatchlistAsync, removeFromWatchlistAsync } from "../redux/watchlistSlice";
import { ACCESS_TOKEN, BASE_URL } from "../config";
import { 
  FaArrowLeft, 
  FaPlus, 
  FaCheck, 
  FaStar, 
  FaCalendarAlt, 
  FaClock, 
  FaGlobe, 
  FaDollarSign,
  FaPlay,
  FaExternalLinkAlt,
  FaUsers,
  FaBuilding,
  FaThumbsUp,
  FaThumbsDown,
  FaShare,
  FaImages,
  FaVideo,
  FaTimes,
  FaChevronLeft,
  FaChevronRight,
  FaFilter,
  FaSortAmountDown,
  FaLightbulb,
  FaFire,
  FaHeart,
  FaComment,
  FaFlag
} from "react-icons/fa";
import { 
  FaFacebook, 
  FaTwitter, 
  FaWhatsapp, 
  FaReddit,
  FaTelegramPlane
} from "react-icons/fa";

const MovieDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { items: watchlist, isLoading: watchlistLoading } = useSelector((state) => state.watchlist);
  const { isAuthenticated, user, token } = useSelector((state) => state.auth);

  const [movie, setMovie] = useState(null);
  const [credits, setCredits] = useState([]);
  const [trailer, setTrailer] = useState(null);
  const [recommendedMovies, setRecommendedMovies] = useState([]);
  const [similarMovies, setSimilarMovies] = useState([]);
  const [streamingProviders, setStreamingProviders] = useState(null);
  
  // New state for enhanced features
  const [reviews, setReviews] = useState([]);
  const [userReview, setUserReview] = useState({ rating: 0, comment: '', title: '' });
  const [reviewFilter, setReviewFilter] = useState('newest');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [images, setImages] = useState([]);
  const [videos, setVideos] = useState([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  const [selectedVideoIndex, setSelectedVideoIndex] = useState(null);
  const [trivia, setTrivia] = useState([]);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [showShareModal, setShowShareModal] = useState(false);
  const [reviewStats, setReviewStats] = useState({
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  });
  const [allCast, setAllCast] = useState([]);
  const [allCrew, setAllCrew] = useState([]);
  const [allImages, setAllImages] = useState([]);
  const [allVideos, setAllVideos] = useState([]);
  const [tmdbReviews, setTmdbReviews] = useState([]);
  const [keywords, setKeywords] = useState([]);
  const [externalIds, setExternalIds] = useState({});

  // Improved watchlist checking with better ID comparison
  const isInWatchlist = watchlist.some((m) => {
    const movieId = (m.movieId || m.id).toString();
    const currentId = id.toString();
    return movieId === currentId;
  });

  // Fetch user reviews from backend
  const fetchUserReviews = async () => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
      const response = await axios.get(`${API_BASE_URL}/reviews/${id}`);
      const { reviews: backendReviews, totalReviews, averageRating } = response.data;
      
      console.log('Fetched user reviews for movie detail:', backendReviews);
      
      // Combine backend reviews with existing reviews
      setReviews(prev => {
        const tmdbReviews = prev.filter(r => r.source === 'tmdb');
        return [...backendReviews, ...tmdbReviews];
      });
      
      // Update review stats to include backend reviews
      setReviewStats(prev => ({
        ...prev,
        totalReviews: totalReviews + (tmdbReviews?.length || 0),
        averageRating: averageRating || prev.averageRating
      }));
      
    } catch (error) {
      console.error('Error fetching user reviews:', error);
      // Don't show error to user, just log it
    }
  };

  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        const [
          movieRes,
          creditsRes,
          videosRes,
          recommendationsRes,
          similarRes,
          providersRes,
          imagesRes,
          trendingRes,
          reviewsRes,
          keywordsRes,
          externalIdsRes,
        ] = await Promise.all([
          axios.get(`${BASE_URL}/movie/${id}`, {
            headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
          }),
          axios.get(`${BASE_URL}/movie/${id}/credits`, {
            headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
          }),
          axios.get(`${BASE_URL}/movie/${id}/videos`, {
            headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
          }),
          axios.get(`${BASE_URL}/movie/${id}/recommendations`, {
            headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
          }),
          axios.get(`${BASE_URL}/movie/${id}/similar`, {
            headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
          }),
          axios.get(`${BASE_URL}/movie/${id}/watch/providers`, {
            headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
          }),
          axios.get(`${BASE_URL}/movie/${id}/images`, {
            headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
          }),
          axios.get(`${BASE_URL}/trending/movie/week`, {
            headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
          }),
          axios.get(`${BASE_URL}/movie/${id}/reviews`, {
            headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
          }),
          axios.get(`${BASE_URL}/movie/${id}/keywords`, {
            headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
          }),
          axios.get(`${BASE_URL}/movie/${id}/external_ids`, {
            headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
          }),
        ]);

        setMovie(movieRes.data);
        
        // Store all cast and crew data
        setAllCast(creditsRes.data.cast);
        setAllCrew(creditsRes.data.crew);
        setCredits(creditsRes.data.cast.slice(0, 6)); // Show first 6 for preview
        
        setRecommendedMovies(recommendationsRes.data.results.slice(0, 6));
        setSimilarMovies(similarRes.data.results.slice(0, 6));
        setStreamingProviders(providersRes.data.results);
        setTrendingMovies(trendingRes.data.results.slice(0, 8));
        setKeywords(keywordsRes.data.keywords || []);
        setExternalIds(externalIdsRes.data);

        // Store all images and videos
        const allImagesData = [
          ...imagesRes.data.backdrops,
          ...imagesRes.data.posters
        ];
        setAllImages(allImagesData);
        setImages(allImagesData.slice(0, 10)); // Show first 10 for preview

        // Process videos
        const allVideosData = videosRes.data.results.filter(video => 
          video.site === "YouTube" && 
          (video.type === "Trailer" || video.type === "Teaser" || 
           video.type === "Clip" || video.type === "Featurette")
        );
        setAllVideos(allVideosData);
        setVideos(allVideosData.slice(0, 6)); // Show first 6 for preview

        const trailerVideo = videosRes.data.results.find(
          (video) => video.type === "Trailer" && video.site === "YouTube"
        );
        if (trailerVideo) {
          setTrailer(`https://www.youtube.com/embed/${trailerVideo.key}`);
        }

        // Process TMDB reviews
        const tmdbReviewsData = reviewsRes.data.results.map(review => ({
          id: review.id,
          userId: review.author_details.username || review.author,
          username: review.author_details.username || review.author,
          rating: review.author_details.rating ? review.author_details.rating / 2 : 0, // Convert 10-point to 5-point scale
          title: "", // TMDB reviews don't have separate titles
          comment: review.content,
          date: new Date(review.created_at).toISOString().split('T')[0],
          likes: 0,
          dislikes: 0,
          helpful: false,
          source: 'tmdb'
        }));
        setTmdbReviews(tmdbReviewsData);

        // Fetch user reviews from backend
        await fetchUserReviews();

        // Generate dynamic trivia based on movie data
        const dynamicTrivia = [];
        
        if (movieRes.data.budget && movieRes.data.revenue) {
          const profit = movieRes.data.revenue - movieRes.data.budget;
          const profitPercentage = ((profit / movieRes.data.budget) * 100).toFixed(1);
          if (profit > 0) {
            dynamicTrivia.push(`This movie made a profit of $${(profit / 1000000).toFixed(1)} million, representing a ${profitPercentage}% return on investment.`);
          }
        }
        
        if (movieRes.data.runtime) {
          if (movieRes.data.runtime > 180) {
            dynamicTrivia.push(`At ${movieRes.data.runtime} minutes, this is considered an epic-length film.`);
          } else if (movieRes.data.runtime < 90) {
            dynamicTrivia.push(`With a runtime of ${movieRes.data.runtime} minutes, this is a relatively short feature film.`);
          }
        }
        
        if (movieRes.data.vote_count > 10000) {
          dynamicTrivia.push(`This movie has been rated by over ${(movieRes.data.vote_count / 1000).toFixed(0)}K viewers on TMDB.`);
        }
        
        if (movieRes.data.popularity > 100) {
          dynamicTrivia.push(`This movie is currently very popular with a popularity score of ${movieRes.data.popularity.toFixed(0)}.`);
        }
        
        if (creditsRes.data.cast.length > 0) {
          dynamicTrivia.push(`The cast includes ${creditsRes.data.cast.length} credited actors.`);
        }
        
        if (movieRes.data.production_companies?.length > 1) {
          dynamicTrivia.push(`This film was a collaboration between ${movieRes.data.production_companies.length} production companies.`);
        }

        setTrivia(dynamicTrivia);

        // Combine user reviews with TMDB reviews for stats
        const allReviewsForStats = [...tmdbReviewsData.filter(r => r.rating > 0)];
        
        if (allReviewsForStats.length > 0) {
          const totalReviews = allReviewsForStats.length;
          const averageRating = allReviewsForStats.reduce((sum, review) => sum + review.rating, 0) / totalReviews;
          const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
          allReviewsForStats.forEach(review => {
            const roundedRating = Math.round(review.rating);
            if (roundedRating >= 1 && roundedRating <= 5) {
              ratingDistribution[roundedRating]++;
            }
          });
          
          setReviewStats({
            averageRating,
            totalReviews,
            ratingDistribution
          });
        } else {
          // Fallback to TMDB movie rating
          setReviewStats({
            averageRating: movieRes.data.vote_average ? movieRes.data.vote_average / 2 : 0,
            totalReviews: movieRes.data.vote_count || 0,
            ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
          });
        }

        setReviews(tmdbReviewsData.slice(0, 5)); // Show first 5 reviews initially

      } catch (error) {
        console.error("Error fetching movie details", error);
      }
    };

    fetchMovieDetails();
  }, [id]);

  const allFlatrateProviders = [];

for (const country in streamingProviders) {
  const region = streamingProviders[country];
  if (region?.flatrate) {
    region.flatrate.forEach((provider) => {
      // Avoid duplicates (some providers exist in many regions)
      if (!allFlatrateProviders.some(p => p.provider_id === provider.provider_id)) {
        allFlatrateProviders.push(provider);
      }
    });
  }
}

const getProviderLink = (providerName, movieTitle) => {
  const domainMap = {
    "Netflix": "https://www.netflix.com",
    "Amazon Prime Video": "https://www.primevideo.com",
    "Disney Plus": "https://www.disneyplus.com",
    "Hulu": "https://www.hulu.com",
    "HBO Max": "https://www.max.com",
    "Apple TV": "https://tv.apple.com",
    "Peacock": "https://www.peacocktv.com",
    "Paramount Plus": "https://www.paramountplus.com",
    // Add more as needed
  };

  return domainMap[providerName] || `https://www.google.com/search?q=${encodeURIComponent(movieTitle)}+on+${encodeURIComponent(providerName)}`;
};

// Navigation helpers for "More Details" with authentication checks
// (Removed duplicate handleMoreDetails declaration)

const handleUserReviewSubmit = async () => {
  if (!isAuthenticated) {
    navigate('/login');
    return;
  }
  
  if (userReview.rating === 0 || !userReview.comment.trim()) {
    alert('Please provide a rating and comment');
    return;
  }

  try {
    const reviewData = {
      movieId: id,
      rating: userReview.rating,
      comment: userReview.comment.trim(),
      title: userReview.title.trim(),
      movieTitle: movie.title
    };

    const config = {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
    
    console.log('Submitting review from MovieDetail:', reviewData);
    
    const response = await axios.post(`${API_BASE_URL}/reviews`, reviewData, config);
    console.log('Review submitted successfully:', response.data);
    
    // Add the new review to local state
    const newReview = response.data.review;
    setReviews(prev => [newReview, ...prev]);
    
    // Reset form
    setUserReview({ rating: 0, comment: '', title: '' });
    setShowReviewForm(false);
    
    // Update stats
    const currentReviews = [...reviews, newReview];
    const newTotal = currentReviews.length;
    const newAverage = currentReviews.reduce((sum, review) => sum + review.rating, 0) / newTotal;
    const newDistribution = { ...reviewStats.ratingDistribution };
    newDistribution[Math.round(newReview.rating)]++;
    
    setReviewStats({
      averageRating: newAverage,
      totalReviews: newTotal,
      ratingDistribution: newDistribution
    });
    
    alert('Review submitted successfully!');
    
  } catch (error) {
    console.error('Error submitting review:', error);
    alert(error.response?.data?.message || 'Failed to submit review. Please try again.');
  }
};

// Helper functions for new features
const handleReviewSubmit = handleUserReviewSubmit; // Now this will work since handleUserReviewSubmit is defined above

const handleReviewLike = async (reviewId, isLike) => {
  if (!isAuthenticated) {
    navigate('/login');
    return;
  }

  // Only allow liking user reviews, not TMDB reviews
  const review = reviews.find(r => (r._id || r.id) === reviewId);
  if (review && review.source === 'tmdb') {
    return; // Don't allow liking TMDB reviews
  }

  try {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
    const config = {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };

    await axios.post(`${API_BASE_URL}/reviews/${reviewId}/like`, { 
      type: isLike ? 'like' : 'dislike' 
    }, config);
    
    // Refresh reviews to get updated counts
    await fetchUserReviews();
    
  } catch (error) {
    console.error('Error liking review:', error);
    // Don't show error to user for likes/dislikes
  }
};

const getFilteredReviews = () => {
  let filtered = [...reviews];
  
  switch (reviewFilter) {
    case 'newest':
      filtered.sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));
      break;
    case 'oldest':
      filtered.sort((a, b) => new Date(a.createdAt || a.date) - new Date(b.createdAt || b.date));
      break;
    case 'highest':
      filtered.sort((a, b) => b.rating - a.rating);
      break;
    case 'lowest':
      filtered.sort((a, b) => a.rating - b.rating);
      break;
    case 'helpful':
      filtered.sort((a, b) => ((b.likes || 0) - (b.dislikes || 0)) - ((a.likes || 0) - (a.dislikes || 0)));
      break;
    default:
      break;
  }
  
  return filtered;
};

const shareMovie = (platform) => {
  const url = window.location.href;
  const text = `Check out "${movie.title}" - ${movie.tagline || 'Great movie!'}`;
  
  const shareUrls = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`,
    reddit: `https://reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(text)}`,
    telegram: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`
  };
  
  if (shareUrls[platform]) {
    window.open(shareUrls[platform], '_blank', 'noopener,noreferrer');
  }
  setShowShareModal(false);
};

// Navigation helpers for "More Details" with authentication checks
const handleMoreDetails = (section) => {
  if (!isAuthenticated) {
    // Store the intended destination
    localStorage.setItem('returnUrl', `/movie/${id}/${section}`);
    navigate('/login');
    return;
  }
  
  // Navigate to the detailed section (you'll need to create these routes)
  switch (section) {
    case 'cast':
      navigate(`/movie/${id}/cast`, { state: { allCast, allCrew, movie } });
      break;
    case 'photos':
      navigate(`/movie/${id}/photos`, { state: { allImages, movie } });
      break;
    case 'videos':
      navigate(`/movie/${id}/videos`, { state: { allVideos, movie } });
      break;
    case 'reviews':
      navigate(`/movie/${id}/reviews`, { state: { tmdbReviews, reviewStats, movie } });
      break;
    default:
      break;
  }
};

// Social Share Modal Component
const ShareModal = () => (
  <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div className="bg-gray-800 rounded-2xl p-6 max-w-md w-full border border-gray-700">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold">Share "{movie.title}"</h3>
        <button
          onClick={() => setShowShareModal(false)}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <FaTimes className="w-5 h-5" />
        </button>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => shareMovie('facebook')}
          className="flex items-center gap-3 p-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
        >
          <FaFacebook className="w-5 h-5" />
          <span>Facebook</span>
        </button>
        
        <button
          onClick={() => shareMovie('twitter')}
          className="flex items-center gap-3 p-3 bg-sky-500 hover:bg-sky-600 rounded-lg transition-colors"
        >
          <FaTwitter className="w-5 h-5" />
          <span>Twitter</span>
        </button>
        
        <button
          onClick={() => shareMovie('whatsapp')}
          className="flex items-center gap-3 p-3 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
        >
          <FaWhatsapp className="w-5 h-5" />
          <span>WhatsApp</span>
        </button>
        
        <button
          onClick={() => shareMovie('reddit')}
          className="flex items-center gap-3 p-3 bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors"
        >
          <FaReddit className="w-5 h-5" />
          <span>Reddit</span>
        </button>
        
        <button
          onClick={() => shareMovie('telegram')}
          className="flex items-center gap-3 p-3 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors col-span-2"
        >
          <FaTelegramPlane className="w-5 h-5" />
          <span>Telegram</span>
        </button>
      </div>
    </div>
  </div>
);

// Image Lightbox Component
const ImageLightbox = () => (
  <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4">
    <button
      onClick={() => setSelectedImageIndex(null)}
      className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10"
    >
      <FaTimes className="w-8 h-8" />
    </button>
    
    <button
      onClick={() => setSelectedImageIndex(selectedImageIndex > 0 ? selectedImageIndex - 1 : images.length - 1)}
      className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 transition-colors"
    >
      <FaChevronLeft className="w-8 h-8" />
    </button>
    
    <button
      onClick={() => setSelectedImageIndex(selectedImageIndex < images.length - 1 ? selectedImageIndex + 1 : 0)}
      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 transition-colors"
    >
      <FaChevronRight className="w-8 h-8" />
    </button>
    
    <img
      src={`https://image.tmdb.org/t/p/original${images[selectedImageIndex]?.file_path}`}
      alt="Movie still"
      className="max-w-full max-h-full object-contain"
    />
    
    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm">
      {selectedImageIndex + 1} / {images.length}
    </div>
  </div>
);

// Video Modal Component
const VideoModal = () => (
  <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4">
    <div className="relative w-full max-w-4xl">
      <button
        onClick={() => setSelectedVideoIndex(null)}
        className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10"
      >
        <FaTimes className="w-8 h-8" />
      </button>
      
      <iframe
        className="w-full h-64 md:h-96"
        src={`https://www.youtube.com/embed/${videos[selectedVideoIndex]?.key}?autoplay=1`}
        title={videos[selectedVideoIndex]?.name}
        frameBorder="0"
        allowFullScreen
      ></iframe>
      
      <div className="mt-4 text-center text-white">
        <h3 className="text-lg font-semibold">{videos[selectedVideoIndex]?.name}</h3>
        <p className="text-gray-300 text-sm">{videos[selectedVideoIndex]?.type}</p>
      </div>
    </div>
  </div>
);


  if (!movie) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400 text-lg">Loading movie details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Hero Section with Backdrop */}
      <div className="relative">
        {/* Backdrop Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(https://image.tmdb.org/t/p/w1280${movie.backdrop_path || movie.poster_path})`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/80 to-gray-900/40"></div>
        </div>

        {/* Content Container */}
        <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-8">
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 bg-black/50 hover:bg-black/70 backdrop-blur-sm text-white px-4 py-2 rounded-lg mb-8 transition-all duration-200 border border-white/20"
          >
            <FaArrowLeft className="w-4 h-4" /> 
            <span>Back</span>
          </button>

          {/* Main Movie Info */}
          <div className="flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto">
            {/* Movie Poster */}
            <div className="flex-shrink-0">
              <div className="relative group">
                <img
                  src={
                    movie.poster_path
                      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                      : "https://via.placeholder.com/500x750?text=No+Image"
                  }
                  alt={movie.title}
                  className="w-80 max-w-full rounded-xl shadow-2xl transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
              </div>
            </div>

            {/* Movie Details */}
            <div className="flex-1 space-y-6">
              {/* Title and Basic Info */}
              <div>
                <h1 className="text-4xl lg:text-5xl font-bold mb-3 leading-tight">{movie.title}</h1>
                {movie.tagline && (
                  <p className="text-xl text-gray-300 italic mb-4">"{movie.tagline}"</p>
                )}
                
                {/* Rating and Year */}
                <div className="flex flex-wrap items-center gap-4 mb-4">
                  <div className="flex items-center gap-2 bg-yellow-500/20 px-3 py-1 rounded-full">
                    <FaStar className="text-yellow-400 w-4 h-4" />
                    <span className="font-semibold">{movie.vote_average?.toFixed(1) || "N/A"}</span>
                    <span className="text-gray-400 text-sm">({movie.vote_count} votes)</span>
                  </div>
                  
                  {movie.release_date && (
                    <div className="flex items-center gap-2 text-gray-300">
                      <FaCalendarAlt className="w-4 h-4" />
                      <span>{new Date(movie.release_date).getFullYear()}</span>
                    </div>
                  )}
                  
                  {movie.runtime && (
                    <div className="flex items-center gap-2 text-gray-300">
                      <FaClock className="w-4 h-4" />
                      <span>{Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m</span>
                    </div>
                  )}
                </div>

                {/* Genres */}
                {movie.genres && movie.genres.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {movie.genres.map((genre) => (
                      <span
                        key={genre.id}
                        className="px-3 py-1 bg-blue-600/20 border border-blue-500/30 rounded-full text-sm text-blue-300"
                      >
                        {genre.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Overview */}
              <div>
                <h3 className="text-xl font-semibold mb-3">Overview</h3>
                <p className="text-gray-300 leading-relaxed text-lg">
                  {movie.overview || "No overview available."}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4">
                {/* Watchlist Button */}
                <button
                  onClick={() => {
                    // If user is not authenticated, redirect to login with return URL
                    if (!isAuthenticated) {
                      // Store the movie data in localStorage to add after login
                      const movieData = {
                        id: movie.id,
                        movieId: movie.id.toString(),
                        title: movie.title,
                        // Pass complete poster URL for consistency
                        poster: movie.poster_path
                          ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                          : "https://via.placeholder.com/500x750?text=No+Image",
                        overview: movie.overview,
                        vote_average: movie.vote_average,
                        year: movie.release_date ? new Date(movie.release_date).getFullYear().toString() : new Date().getFullYear().toString(),
                      };
                      localStorage.setItem('pendingWatchlistItem', JSON.stringify(movieData));
                      localStorage.setItem('returnUrl', `/movie/${movie.id}`);
                      navigate('/login');
                      return;
                    }

                    const movieData = {
                      id: movie.id,
                      movieId: movie.id.toString(),
                      title: movie.title,
                      // Pass complete poster URL for consistency
                      poster: movie.poster_path
                        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                        : "https://via.placeholder.com/500x750?text=No+Image",
                      overview: movie.overview,
                      vote_average: movie.vote_average,
                      year: movie.release_date ? new Date(movie.release_date).getFullYear().toString() : new Date().getFullYear().toString(),
                    };

                    if (isInWatchlist) {
                      dispatch(removeFromWatchlistAsync({ userId: user.id, movieId: movie.id.toString() }));
                    } else {
                      dispatch(addToWatchlistAsync({ userId: user.id, movieData }));
                    }
                  }}
                  disabled={watchlistLoading}
                  className={`inline-flex items-center gap-2 px-6 py-3 font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                    isInWatchlist && isAuthenticated
                      ? "bg-red-600 hover:bg-red-700 border border-red-500"
                      : "bg-green-600 hover:bg-green-700 border border-green-500"
                  }`}
                >
                  {watchlistLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <>
                      {isInWatchlist && isAuthenticated ? <FaCheck className="w-4 h-4" /> : <FaPlus className="w-4 h-4" />}
                      {isInWatchlist && isAuthenticated ? "Remove from Watchlist" : "Add to Watchlist"}
                    </>
                  )}
                </button>

                {/* IMDb Button */}
                {(movie.imdb_id || externalIds.imdb_id) && (
                  <a
                    href={`https://www.imdb.com/title/${movie.imdb_id || externalIds.imdb_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold rounded-lg transition-all duration-200"
                  >
                    <FaExternalLinkAlt className="w-4 h-4" />
                    View on IMDb
                  </a>
                )}

                {/* Additional External Links */}
                {externalIds.facebook_id && (
                  <a
                    href={`https://www.facebook.com/${externalIds.facebook_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all duration-200"
                  >
                    <FaFacebook className="w-4 h-4" />
                    Facebook
                  </a>
                )}

                {externalIds.twitter_id && (
                  <a
                    href={`https://twitter.com/${externalIds.twitter_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-lg transition-all duration-200"
                  >
                    <FaTwitter className="w-4 h-4" />
                    Twitter
                  </a>
                )}

                {/* Play Trailer Button */}
                {trailer && (
                  <a
                    href={trailer}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-all duration-200"
                  >
                    <FaPlay className="w-4 h-4" />
                    Watch Trailer
                  </a>
                )}

                {/* Share Button */}
                <button
                  onClick={() => setShowShareModal(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-all duration-200"
                >
                  <FaShare className="w-4 h-4" />
                  Share
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Details and Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto space-y-12">
        
        {/* Movie Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 text-center border border-gray-700/50">
            <FaGlobe className="w-6 h-6 text-blue-400 mx-auto mb-2" />
            <p className="text-gray-400 text-sm">Language</p>
            <p className="font-semibold">{movie.original_language?.toUpperCase() || "N/A"}</p>
          </div>
          
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 text-center border border-gray-700/50">
            <FaDollarSign className="w-6 h-6 text-green-400 mx-auto mb-2" />
            <p className="text-gray-400 text-sm">Budget</p>
            <p className="font-semibold">{movie.budget ? `$${(movie.budget / 1000000).toFixed(1)}M` : "N/A"}</p>
          </div>
          
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 text-center border border-gray-700/50">
            <FaDollarSign className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
            <p className="text-gray-400 text-sm">Revenue</p>
            <p className="font-semibold">{movie.revenue ? `$${(movie.revenue / 1000000).toFixed(1)}M` : "N/A"}</p>
          </div>
          
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 text-center border border-gray-700/50">
            <FaUsers className="w-6 h-6 text-purple-400 mx-auto mb-2" />
            <p className="text-gray-400 text-sm">Popularity</p>
            <p className="font-semibold">{movie.popularity?.toFixed(0) || "N/A"}</p>
          </div>
        </div>

        {/* User Reviews & Ratings Section */}
        <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold flex items-center gap-3">
              <FaComment className="text-blue-400" />
              Reviews ({reviewStats.totalReviews})
            </h3>
            <div className="flex gap-3">
              {/* Always show View All Reviews button */}
              <button
                onClick={() => handleMoreDetails('reviews')}
                className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
              >
                View All Reviews →
              </button>
              <button
                onClick={() => setShowReviewForm(!showReviewForm)}
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
              >
                Write Review
              </button>
            </div>
          </div>

          {/* Review Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Average Rating */}
            <div className="text-center">
              <div className="text-4xl font-bold text-yellow-400 mb-2">
                {reviewStats.averageRating.toFixed(1)}
              </div>
              <div className="flex justify-center items-center gap-1 mb-2">
                {[1, 2, 3, 4, 5].map(star => (
                  <FaStar
                    key={star}
                    className={`w-5 h-5 ${
                      star <= Math.round(reviewStats.averageRating)
                        ? 'text-yellow-400'
                        : 'text-gray-600'
                    }`}
                  />
                ))}
              </div>
              <p className="text-gray-400 text-sm">Based on {reviewStats.totalReviews} reviews</p>
            </div>

            {/* Rating Distribution */}
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map(rating => (
                <div key={rating} className="flex items-center gap-3">
                  <span className="text-sm w-3">{rating}</span>
                  <FaStar className="text-yellow-400 w-4 h-4" />
                  <div className="flex-1 bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-yellow-400 h-2 rounded-full"
                      style={{
                        width: `${reviewStats.totalReviews > 0 
                          ? (reviewStats.ratingDistribution[rating] / reviewStats.totalReviews) * 100 
                          : 0}%`
                      }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-400 w-8">
                    {reviewStats.ratingDistribution[rating]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Review Form */}
          {showReviewForm && (
            <div className="bg-gray-700/50 rounded-xl p-6 mb-6 border border-gray-600/50">
              <h4 className="text-lg font-semibold mb-4">Write Your Review</h4>
              
              {/* Star Rating Input */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Your Rating</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      onClick={() => setUserReview(prev => ({ ...prev, rating: star }))}
                      className="transition-colors"
                    >
                      <FaStar
                        className={`w-6 h-6 ${
                          star <= userReview.rating ? 'text-yellow-400' : 'text-gray-600'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Review Title */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Review Title</label>
                <input
                  type="text"
                  value={userReview.title}
                  onChange={(e) => setUserReview(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Sum up your review in a few words"
                  className="w-full bg-gray-600 border border-gray-500 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Review Comment */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Your Review</label>
                <textarea
                  value={userReview.comment}
                  onChange={(e) => setUserReview(prev => ({ ...prev, comment: e.target.value }))}
                  placeholder="Share your thoughts about this movie..."
                  rows={4}
                  className="w-full bg-gray-600 border border-gray-500 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleReviewSubmit}
                  className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-semibold transition-colors"
                >
                  Submit Review
                </button>
                <button
                  onClick={() => setShowReviewForm(false)}
                  className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-lg font-semibold transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Review Filter */}
          <div className="flex items-center gap-4 mb-6">
            <FaFilter className="text-gray-400" />
            <select
              value={reviewFilter}
              onChange={(e) => setReviewFilter(e.target.value)}
              className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest">Highest Rated</option>
              <option value="lowest">Lowest Rated</option>
              <option value="helpful">Most Helpful</option>
            </select>
          </div>

          {/* Reviews List */}
          <div className="space-y-6">
            {getFilteredReviews().slice(0, 5).map(review => (
              <div key={review._id || review.id} className="bg-gray-700/50 rounded-xl p-6 border border-gray-600/50">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-semibold">
                        {review.user?.username || review.username || 'Anonymous'}
                      </span>
                      {review.rating > 0 && (
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map(star => (
                            <FaStar
                              key={star}
                              className={`w-4 h-4 ${
                                star <= review.rating ? 'text-yellow-400' : 'text-gray-600'
                              }`}
                            />
                          ))}
                        </div>
                      )}
                      <span className="text-sm text-gray-400">
                        {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : review.date}
                      </span>
                      {review.source === 'tmdb' && (
                        <span className="bg-yellow-600/20 text-yellow-300 px-2 py-1 rounded text-xs">
                          TMDB
                        </span>
                      )}
                      {review.source === 'user' && (
                        <span className="bg-blue-600/20 text-blue-300 px-2 py-1 rounded text-xs">
                          User
                        </span>
                      )}
                    </div>
                    {review.title && (
                      <h4 className="font-semibold text-lg mb-2">{review.title}</h4>
                    )}
                  </div>
                  <button className="text-gray-400 hover:text-white transition-colors">
                    <FaFlag className="w-4 h-4" />
                  </button>
                </div>
                
                <p className="text-gray-300 mb-4 leading-relaxed">
                  {review.comment.length > 300 
                    ? `${review.comment.substring(0, 300)}...` 
                    : review.comment
                  }
                </p>
                
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleReviewLike(review._id || review.id, true)}
                    disabled={!isAuthenticated || review.source === 'tmdb'}
                    className={`flex items-center gap-2 transition-colors ${
                      !isAuthenticated || review.source === 'tmdb'
                        ? 'text-gray-500 cursor-not-allowed'
                        : 'text-gray-400 hover:text-green-400'
                    }`}
                  >
                    <FaThumbsUp className="w-4 h-4" />
                    <span>{review.likes || 0}</span>
                  </button>
                  <button
                    onClick={() => handleReviewLike(review._id || review.id, false)}
                    disabled={!isAuthenticated || review.source === 'tmdb'}
                    className={`flex items-center gap-2 transition-colors ${
                      !isAuthenticated || review.source === 'tmdb'
                        ? 'text-gray-500 cursor-not-allowed'
                        : 'text-gray-400 hover:text-red-400'
                    }`}
                  >
                    <FaThumbsDown className="w-4 h-4" />
                    <span>{review.dislikes || 0}</span>
                  </button>
                  {review.helpful && (
                    <span className="bg-blue-600/20 text-blue-300 px-2 py-1 rounded text-xs">
                      Helpful
                    </span>
                  )}
                  {review.source === 'tmdb' && (
                    <span className="text-xs text-gray-500">
                      (External review)
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trivia & Facts Section */}
        {trivia.length > 0 && (
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <FaLightbulb className="text-yellow-400" />
              Dynamic Fun Facts
            </h3>
            <p className="text-gray-400 text-sm mb-4">
              These facts are generated based on the movie's data from TMDB
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {trivia.map((fact, index) => (
                <div key={index} className="bg-gray-700/50 rounded-xl p-4 border border-gray-600/50">
                  <div className="flex items-start gap-3">
                    <div className="bg-yellow-400/20 rounded-full p-2 flex-shrink-0">
                      <FaLightbulb className="text-yellow-400 w-4 h-4" />
                    </div>
                    <p className="text-gray-300 leading-relaxed">{fact}</p>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Keywords Section */}
            {keywords.length > 0 && (
              <div className="mt-6">
                <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <span className="text-blue-400">🏷️</span>
                  Keywords
                </h4>
                <div className="flex flex-wrap gap-2">
                  {keywords.slice(0, 10).map((keyword) => (
                    <span
                      key={keyword.id}
                      className="px-3 py-1 bg-blue-600/20 border border-blue-500/30 rounded-full text-sm text-blue-300 hover:bg-blue-600/30 transition-colors cursor-pointer"
                    >
                      {keyword.name}
                    </span>
                  ))}
                  {keywords.length > 10 && (
                    <span className="text-gray-400 text-sm">
                      +{keywords.length - 10} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Trending Now Section */}
        {trendingMovies.length > 0 && (
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <FaFire className="text-orange-400" />
              Trending This Week
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-4">
              {trendingMovies.map((trendingMovie, index) => (
                <Link
                  to={`/movie/${trendingMovie.id}`}
                  key={trendingMovie.id}
                  className="group block relative"
                >
                  <div className="relative overflow-hidden rounded-xl mb-2">
                    <img
                      src={
                        trendingMovie.poster_path 
                          ? `https://image.tmdb.org/t/p/w300${trendingMovie.poster_path}`
                          : "https://via.placeholder.com/300x450?text=No+Image"
                      }
                      alt={trendingMovie.title}
                      className="w-full aspect-[2/3] object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    {/* Trending rank */}
                    <div className="absolute top-2 left-2 bg-orange-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </div>
                    
                    {/* Rating overlay */}
                    <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
                      <FaStar className="text-yellow-400 w-3 h-3" />
                      <span className="text-xs font-semibold">{trendingMovie.vote_average?.toFixed(1)}</span>
                    </div>
                  </div>
                  <h4 className="font-semibold text-xs mb-1 group-hover:text-orange-400 transition-colors duration-200 line-clamp-2">
                    {trendingMovie.title}
                  </h4>
                  <p className="text-xs text-gray-400">
                    {trendingMovie.release_date ? new Date(trendingMovie.release_date).getFullYear() : "TBA"}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Streaming Providers */}
        {allFlatrateProviders.length > 0 && (
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <span className="text-2xl">📺</span>
              Watch Now
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
              {allFlatrateProviders.map((provider) => (
                <a
                  key={provider.provider_id}
                  href={getProviderLink(provider.provider_name, movie.title)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative bg-gray-700/50 rounded-xl p-3 hover:bg-gray-700 transition-all duration-200 border border-gray-600/50 hover:border-gray-500"
                >
                  <img
                    src={`https://image.tmdb.org/t/p/w92${provider.logo_path}`}
                    alt={provider.provider_name}
                    className="w-full h-12 object-contain rounded-lg group-hover:scale-110 transition-transform duration-200"
                  />
                  <p className="text-xs text-center mt-2 text-gray-300 group-hover:text-white">
                    {provider.provider_name}
                  </p>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Enhanced Media Gallery */}
        <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold flex items-center gap-3">
              <FaImages className="text-green-400" />
              Photos & Videos
            </h3>
            <div className="flex gap-4">
              {allImages.length > 10 && (
                <button
                  onClick={() => handleMoreDetails('photos')}
                  className="text-green-400 hover:text-green-300 text-sm font-medium transition-colors"
                >
                  View All Photos ({allImages.length}) →
                </button>
              )}
              {allVideos.length > 6 && (
                <button
                  onClick={() => handleMoreDetails('videos')}
                  className="text-red-400 hover:text-red-300 text-sm font-medium transition-colors"
                >
                  View All Videos ({allVideos.length}) →
                </button>
              )}
            </div>
          </div>
          
          {/* Photos Section */}
          {images.length > 0 && (
            <div className="mb-8">
              <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FaImages className="text-green-400" />
                Behind the Scenes & Stills ({allImages.length} total)
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {images.slice(0, 10).map((image, index) => (
                  <div
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className="relative group cursor-pointer overflow-hidden rounded-lg"
                  >
                    <img
                      src={`https://image.tmdb.org/t/p/w300${image.file_path}`}
                      alt="Movie still"
                      className="w-full h-32 object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <FaImages className="text-white text-2xl" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Videos Section */}
          {videos.length > 0 && (
            <div>
              <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FaVideo className="text-red-400" />
                Videos & Clips ({allVideos.length} total)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {videos.slice(0, 6).map((video, index) => (
                  <div
                    key={video.id}
                    onClick={() => setSelectedVideoIndex(index)}
                    className="relative group cursor-pointer overflow-hidden rounded-lg"
                  >
                    <img
                      src={`https://img.youtube.com/vi/${video.key}/maxresdefault.jpg`}
                      alt={video.name}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-colors duration-300 flex items-center justify-center">
                      <FaPlay className="text-white text-3xl group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                      <h5 className="font-semibold text-sm text-white mb-1 line-clamp-2">{video.name}</h5>
                      <span className="text-xs text-gray-300 bg-black/50 px-2 py-1 rounded">
                        {video.type}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Cast Section */}
        {credits.length > 0 && (
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold flex items-center gap-3">
                <FaUsers className="text-purple-400" />
                Cast
              </h3>
              {allCast.length > 6 && (
                <button
                  onClick={() => handleMoreDetails('cast')}
                  className="text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors"
                >
                  View Full Cast & Crew ({allCast.length + allCrew.length}) →
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {credits.map((actor) => (
                <div key={actor.id} className="group text-center">
                  <div className="relative overflow-hidden rounded-xl mb-3">
                    <img
                      src={
                        actor.profile_path 
                          ? `https://image.tmdb.org/t/p/w200${actor.profile_path}`
                          : "https://via.placeholder.com/200x300?text=No+Photo"
                      }
                      alt={actor.name}
                      className="w-full h-40 object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  <h4 className="font-semibold text-sm mb-1">{actor.name}</h4>
                  <p className="text-xs text-gray-400">{actor.character}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Trailer Section */}
        {trailer && (
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <FaPlay className="text-red-400" />
              Official Trailer
            </h3>
            <div className="relative overflow-hidden rounded-xl">
              <iframe
                className="w-full h-64 md:h-96"
                src={trailer}
                title="Movie Trailer"
                frameBorder="0"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        )}

        {/* Production Companies */}
        {movie.production_companies && movie.production_companies.length > 0 && (
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <FaBuilding className="text-blue-400" />
              Production Companies
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {movie.production_companies.map((company) => (
                <div key={company.id} className="flex items-center gap-4 bg-gray-700/50 p-4 rounded-xl border border-gray-600/50">
                  {company.logo_path && (
                    <img
                      src={`https://image.tmdb.org/t/p/w200${company.logo_path}`}
                      alt={company.name}
                      className="h-8 w-auto object-contain"
                    />
                  )}
                  <div>
                    <p className="font-semibold">{company.name}</p>
                    {company.origin_country && (
                      <p className="text-sm text-gray-400">{company.origin_country}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Genre Deep Dive */}
        {movie.genres && movie.genres.length > 0 && (
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <FaHeart className="text-pink-400" />
              More {movie.genres[0]?.name} Movies You'll Love
            </h3>
            <div className="mb-4 flex flex-wrap gap-2">
              {movie.genres.map((genre) => (
                <span
                  key={genre.id}
                  className="px-3 py-1 bg-pink-600/20 border border-pink-500/30 rounded-full text-sm text-pink-300"
                >
                  {genre.name}
                </span>
              ))}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {similarMovies.slice(0, 6).map((genreMovie) => (
                <Link
                  to={`/movie/${genreMovie.id}`}
                  key={genreMovie.id}
                  className="group block"
                >
                  <div className="relative overflow-hidden rounded-xl mb-3">
                    <img
                      src={
                        genreMovie.poster_path 
                          ? `https://image.tmdb.org/t/p/w300${genreMovie.poster_path}`
                          : "https://via.placeholder.com/300x450?text=No+Image"
                      }
                      alt={genreMovie.title}
                      className="w-full aspect-[2/3] object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    {/* Mood indicator */}
                    <div className="absolute top-2 left-2 bg-pink-500/80 backdrop-blur-sm rounded-full px-2 py-1">
                      <span className="text-xs font-semibold text-white">Similar Vibe</span>
                    </div>
                    
                    {/* Rating overlay */}
                    <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
                      <FaStar className="text-yellow-400 w-3 h-3" />
                      <span className="text-xs font-semibold">{genreMovie.vote_average?.toFixed(1)}</span>
                    </div>
                  </div>
                  <h4 className="font-semibold text-sm mb-1 group-hover:text-pink-400 transition-colors duration-200 line-clamp-2">
                    {genreMovie.title}
                  </h4>
                  <p className="text-xs text-gray-400">
                    {genreMovie.release_date ? new Date(genreMovie.release_date).getFullYear() : "TBA"}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Recommended Movies */}
        {recommendedMovies.length > 0 && (
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <span className="text-2xl">🎞️</span>
              You Might Also Like
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {recommendedMovies.map((recMovie) => (
                <Link
                  to={`/movie/${recMovie.id}`}
                  key={recMovie.id}
                  className="group block"
                >
                  <div className="relative overflow-hidden rounded-xl mb-3">
                    <img
                      src={
                        recMovie.poster_path 
                          ? `https://image.tmdb.org/t/p/w500${recMovie.poster_path}`
                          : "https://via.placeholder.com/500x750?text=No+Image"
                      }
                      alt={recMovie.title}
                      className="w-full aspect-[2/3] object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    {/* Rating overlay */}
                    <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
                      <FaStar className="text-yellow-400 w-3 h-3" />
                      <span className="text-xs font-semibold">{recMovie.vote_average?.toFixed(1)}</span>
                    </div>
                  </div>
                  <h4 className="font-semibold text-sm mb-1 group-hover:text-blue-400 transition-colors duration-200 line-clamp-2">
                    {recMovie.title}
                  </h4>
                  <p className="text-xs text-gray-400">
                    {recMovie.release_date ? new Date(recMovie.release_date).getFullYear() : "TBA"}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Similar Movies */}
        {similarMovies.length > 0 && (
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <span className="text-2xl">🎥</span>
              Similar Movies
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {similarMovies.map((simMovie) => (
                <Link
                  to={`/movie/${simMovie.id}`}
                  key={simMovie.id}
                  className="group block"
                >
                  <div className="relative overflow-hidden rounded-xl mb-3">
                    <img
                      src={
                        simMovie.poster_path 
                          ? `https://image.tmdb.org/t/p/w500${simMovie.poster_path}`
                          : "https://via.placeholder.com/500x750?text=No+Image"
                      }
                      alt={simMovie.title}
                      className="w-full aspect-[2/3] object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    {/* Rating overlay */}
                    <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
                      <FaStar className="text-yellow-400 w-3 h-3" />
                      <span className="text-xs font-semibold">{simMovie.vote_average?.toFixed(1)}</span>
                    </div>
                  </div>
                  <h4 className="font-semibold text-sm mb-1 group-hover:text-blue-400 transition-colors duration-200 line-clamp-2">
                    {simMovie.title}
                  </h4>
                  <p className="text-xs text-gray-400">
                    {simMovie.release_date ? new Date(simMovie.release_date).getFullYear() : "TBA"}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Modals */}
      {showShareModal && <ShareModal />}
      {selectedImageIndex !== null && <ImageLightbox />}
      {selectedVideoIndex !== null && <VideoModal />}
    </div>
  );
};

export default MovieDetail;
