import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { FaArrowLeft, FaArrowUp, FaStar, FaFire, FaClock, FaChartLine } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import { ACCESS_TOKEN, BASE_URL } from "../config";

const CategoryPage = () => {
  const navigate = useNavigate();
  const { category } = useParams();
  const [movies, setMovies] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [showScroll, setShowScroll] = useState(false);
  const observer = useRef();

  // Category configurations
  const categoryConfig = {
    trending: {
      title: "Trending This Week",
      icon: FaChartLine,
      endpoint: "/trending/movie/week",
      color: "text-yellow-400"
    },
    popular: {
      title: "Popular Movies",
      icon: FaFire,
      endpoint: "/movie/popular",
      color: "text-red-400"
    },
    topRated: {
      title: "Top Rated Movies",
      icon: FaStar,
      endpoint: "/movie/top_rated",
      color: "text-yellow-400"
    },
    upcoming: {
      title: "Coming Soon",
      icon: FaClock,
      endpoint: "/movie/upcoming",
      color: "text-blue-400"
    }
  };

  const config = categoryConfig[category];

  // Fetch movies for the specific category
  const fetchMovies = async (pageNum, isInitial = false) => {
    if (isInitial) {
      setInitialLoading(true);
    } else {
      setLoading(true);
    }

    try {
      const response = await axios.get(`${BASE_URL}${config.endpoint}`, {
        headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
        params: { page: pageNum },
      });

      const newMovies = response.data.results;
      
      if (isInitial) {
        setMovies(newMovies);
      } else {
        setMovies(prev => [...prev, ...newMovies]);
      }

      // Check if there are more pages
      setHasMore(pageNum < response.data.total_pages);
    } catch (error) {
      console.error(`Error fetching ${category} movies:`, error);
    }

    if (isInitial) {
      setInitialLoading(false);
    } else {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    if (config) {
      fetchMovies(1, true);
      setPage(1);
    }
  }, [category]);

  // Fetch more movies when page changes
  useEffect(() => {
    if (page > 1 && hasMore) {
      fetchMovies(page);
    }
  }, [page]);

  // Infinite scroll observer
  const lastMovieRef = useCallback(
    (node) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage(prevPage => prevPage + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );

  // Show Back-to-Top Button on Scroll
  useEffect(() => {
    const handleScroll = () => {
      setShowScroll(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Movie Card Component
  const MovieCard = ({ movie, isLast }) => (
    <div
      ref={isLast ? lastMovieRef : null}
      onClick={() => navigate(`/movie/${movie.id}`)}
      className="relative cursor-pointer group transform transition-all duration-300 hover:scale-105 hover:z-10"
    >
      <div className="aspect-[2/3] overflow-hidden rounded-lg shadow-lg bg-gray-800">
        <img
          src={movie.poster_path ? 
            `https://image.tmdb.org/t/p/w500${movie.poster_path}` : 
            '/api/placeholder/500/750'
          }
          alt={movie.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          loading="lazy"
        />
      </div>
      
      {/* Always visible gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent rounded-lg" />
      
      {/* Always visible movie details */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <h3 className="text-white font-bold text-sm mb-2 line-clamp-2">{movie.title}</h3>
        <div className="flex items-center gap-2 text-xs text-gray-300 mb-2">
          <FaStar className="text-yellow-400" />
          <span>{movie.vote_average?.toFixed(1)}</span>
          <span>•</span>
          <span>{new Date(movie.release_date).getFullYear()}</span>
        </div>
        <p className="text-gray-300 text-xs line-clamp-2">{movie.overview}</p>
      </div>
      
      {/* Hover effect overlay */}
      <div className="absolute inset-0 rounded-lg ring-2 ring-blue-500 ring-opacity-0 group-hover:ring-opacity-100 transition-all duration-300" />
    </div>
  );

  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400 text-lg">Loading {config?.title}...</p>
        </div>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Category Not Found</h1>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Go Back Home
          </button>
        </div>
      </div>
    );
  }

  const IconComponent = config.icon;

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 py-8 mb-8">
        <div className="max-w-7xl mx-auto px-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-300 hover:text-white mb-6 transition-colors"
          >
            <FaArrowLeft />
            <span>Back to Home</span>
          </button>
          
          <div className="flex items-center gap-4">
            <IconComponent className={`text-3xl ${config.color}`} />
            <h1 className="text-4xl font-bold text-white">{config.title}</h1>
          </div>
          
          <p className="text-gray-400 mt-2">
            Showing {movies.length} movies{hasMore ? ' (loading more...)' : ''}
          </p>
        </div>
      </div>

      {/* Movies Grid */}
      <div className="max-w-7xl mx-auto px-4 pb-12">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
          {movies.map((movie, index) => (
            <MovieCard
              key={`${movie.id}-${index}`}
              movie={movie}
              isLast={index === movies.length - 1}
            />
          ))}
        </div>

        {/* Loading indicator */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-400 text-lg">Loading more movies...</p>
          </div>
        )}

        {/* End of results */}
        {!hasMore && movies.length > 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">You've reached the end!</p>
            <p className="text-gray-500 text-sm mt-2">Total: {movies.length} movies</p>
          </div>
        )}
      </div>

      {/* Back to Top Button */}
      {showScroll && (
        <button
          className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-2xl transition-all hover:scale-110 z-50"
          onClick={scrollToTop}
        >
          <FaArrowUp size={20} />
        </button>
      )}
    </div>
  );
};

export default CategoryPage;
