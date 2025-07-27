import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import axios from "axios";
import { FaArrowUp, FaPlay, FaInfoCircle, FaStar, FaFire, FaClock, FaChartLine, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import MovieList from "./MovieList";
import { ACCESS_TOKEN, BASE_URL } from "../config";

const HomePage = () => {
  const navigate = useNavigate();
  const [allMovies, setAllMovies] = useState([]);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [popularMovies, setPopularMovies] = useState([]);
  const [topRatedMovies, setTopRatedMovies] = useState([]);
  const [upcomingMovies, setUpcomingMovies] = useState([]);
  const [featuredMovie, setFeaturedMovie] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [showScroll, setShowScroll] = useState(false);
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
  const [heroMovies, setHeroMovies] = useState([]);
  const observer = useRef();

  // Initial data fetch for different categories
  const fetchInitialData = async () => {
    setInitialLoading(true);
    try {
      const [trendingRes, popularRes, topRatedRes, upcomingRes] = await Promise.all([
        axios.get(`${BASE_URL}/trending/movie/week`, {
          headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
          params: { page: 1 },
        }),
        axios.get(`${BASE_URL}/movie/popular`, {
          headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
          params: { page: 1 },
        }),
        axios.get(`${BASE_URL}/movie/top_rated`, {
          headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
          params: { page: 1 },
        }),
        axios.get(`${BASE_URL}/movie/upcoming`, {
          headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
          params: { page: 1 },
        }),
      ]);

      setTrendingMovies(trendingRes.data.results.slice(0, 20));
      setPopularMovies(popularRes.data.results.slice(0, 20));
      setTopRatedMovies(topRatedRes.data.results.slice(0, 20));
      setUpcomingMovies(upcomingRes.data.results.slice(0, 20));
      
      // Set hero movies (first 5 trending movies)
      setHeroMovies(trendingRes.data.results.slice(0, 5));
      if (trendingRes.data.results.length > 0) {
        setFeaturedMovie(trendingRes.data.results[0]);
      }

      // Combine for infinite scroll
      const combinedMovies = [
        ...new Map(
          [...trendingRes.data.results, ...popularRes.data.results].map((movie) => [
            movie.id,
            movie,
          ])
        ).values(),
      ];
      setAllMovies(combinedMovies);
    } catch (error) {
      console.error("Error fetching initial data", error);
    }
    setInitialLoading(false);
  };

  const fetchMovies = async (pageNum) => {
    setLoading(true);
    try {
      const [trendingRes, popularRes] = await Promise.all([
        axios.get(`${BASE_URL}/trending/movie/week`, {
          headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
          params: { page: pageNum },
        }),
        axios.get(`${BASE_URL}/movie/popular`, {
          headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
          params: { page: pageNum },
        }),
      ]);

      // Merge and remove duplicates
      const combinedMovies = [
        ...new Map(
          [...allMovies, ...trendingRes.data.results, ...popularRes.data.results].map((movie) => [
            movie.id,
            movie,
          ])
        ).values(),
      ];

      setAllMovies(combinedMovies);
    } catch (error) {
      console.error("Error fetching movies", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (page > 1) {
      fetchMovies(page);
    }
  }, [page]);

  // Auto-rotate hero carousel
  useEffect(() => {
    if (heroMovies.length > 1) {
      const interval = setInterval(() => {
        setCurrentHeroIndex((prev) => (prev + 1) % heroMovies.length);
      }, 8000); // Change every 8 seconds (slower)

      return () => clearInterval(interval);
    }
  }, [heroMovies.length]);

  // Update featured movie when carousel index changes
  useEffect(() => {
    if (heroMovies.length > 0) {
      setFeaturedMovie(heroMovies[currentHeroIndex]);
    }
  }, [currentHeroIndex, heroMovies]);

  // Memoize the current featured movie to prevent unnecessary re-renders
  const currentFeaturedMovie = useMemo(() => {
    return heroMovies[currentHeroIndex] || null;
  }, [heroMovies, currentHeroIndex]);

  // Infinite Scroll
  const lastMovieRef = useCallback(
    (node) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          setPage((prevPage) => prevPage + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading]
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

  // Hero navigation functions
  const goToNextHero = () => {
    setCurrentHeroIndex((prev) => (prev + 1) % heroMovies.length);
  };

  const goToPrevHero = () => {
    setCurrentHeroIndex((prev) => (prev - 1 + heroMovies.length) % heroMovies.length);
  };

  const goToHero = (index) => {
    setCurrentHeroIndex(index);
  };

  // Hero Movie Card Component
  const HeroMovieCard = ({ movie, onClick }) => (
    <div
      onClick={onClick}
      className="relative cursor-pointer group"
    >
      <div className="aspect-[2/3] overflow-hidden rounded-lg">
        <img
          src={movie.poster_path ? 
            `https://image.tmdb.org/t/p/w500${movie.poster_path}` : 
            '/api/placeholder/500/750'
          }
          alt={movie.title}
          className="w-full h-full object-cover transition-transform group-hover:scale-105"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent rounded-lg" />
      <div className="absolute bottom-4 left-4 right-4">
        <h3 className="text-white font-bold text-lg mb-2 line-clamp-2">{movie.title}</h3>
        <div className="flex items-center gap-2 text-sm text-gray-300 mb-3">
          <FaStar className="text-yellow-400" />
          <span>{movie.vote_average?.toFixed(1)}</span>
          <span>•</span>
          <span>{new Date(movie.release_date).getFullYear()}</span>
        </div>
        <p className="text-gray-300 text-sm line-clamp-3">{movie.overview}</p>
      </div>
    </div>
  );

  // Movie Row Component with Horizontal Scroll (Memoized)
  const MovieRow = React.memo(({ title, movies, icon: Icon, onViewAll }) => {
    const scrollRef = useRef(null);

    const scrollLeft = useCallback(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollBy({ left: -400, behavior: 'smooth' });
      }
    }, []);

    const scrollRight = useCallback(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollBy({ left: 400, behavior: 'smooth' });
      }
    }, []);

    const handleWheel = useCallback((e) => {
      // Allow horizontal scrolling with mouse wheel
      if (e.deltaY !== 0) {
        e.preventDefault();
        scrollRef.current.scrollLeft += e.deltaY;
      }
    }, []);

    return (
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Icon className="text-blue-400 text-xl" />
            <h2 className="text-2xl font-bold text-white">{title}</h2>
          </div>
          {onViewAll && (
            <button
              onClick={onViewAll}
              className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
            >
              View All
            </button>
          )}
        </div>
        
        <div className="relative group">
          {/* Left Arrow */}
          <button
            onClick={scrollLeft}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 z-10 bg-black/60 hover:bg-black/80 text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg"
          >
            <FaChevronLeft size={16} />
          </button>
          
          {/* Right Arrow */}
          <button
            onClick={scrollRight}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 z-10 bg-black/60 hover:bg-black/80 text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg"
          >
            <FaChevronRight size={16} />
          </button>
          
          {/* Movies Container */}
          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-scroll scrollbar-hide pb-2"
            style={{ 
              scrollbarWidth: 'none', 
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch'
            }}
            onWheel={handleWheel}
          >
            {movies.map((movie) => (
              <div key={movie.id} className="flex-shrink-0 w-48">
                <HeroMovieCard
                  movie={movie}
                  onClick={() => navigate(`/movie/${movie.id}`)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  });

  // Memoize movie sections to prevent re-renders during carousel changes
  const movieSections = useMemo(() => (
    <div>
      <MovieRow
        title="Trending This Week"
        movies={trendingMovies}
        icon={FaChartLine}
        onViewAll={() => navigate('/category/trending')}
      />
      <MovieRow
        title="Popular Movies"
        movies={popularMovies}
        icon={FaFire}
        onViewAll={() => navigate('/category/popular')}
      />
      <MovieRow
        title="Top Rated"
        movies={topRatedMovies}
        icon={FaStar}
        onViewAll={() => navigate('/category/topRated')}
      />
      <MovieRow
        title="Coming Soon"
        movies={upcomingMovies}
        icon={FaClock}
        onViewAll={() => navigate('/category/upcoming')}
      />
      
      {/* Infinite Scroll Section */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-white mb-6">Discover More</h2>
        <MovieList movies={allMovies} lastMovieRef={lastMovieRef} />
        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
            <p className="text-gray-400">Loading more movies...</p>
          </div>
        )}
      </div>
    </div>
  ), [trendingMovies, popularMovies, topRatedMovies, upcomingMovies, allMovies, loading, lastMovieRef, navigate]);

  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400 text-lg">Loading amazing movies...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      {featuredMovie && (
        <div className="relative h-screen mb-12 overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0">
            <img
              src={featuredMovie.backdrop_path ? 
                `https://image.tmdb.org/t/p/original${featuredMovie.backdrop_path}` : 
                `https://image.tmdb.org/t/p/original${featuredMovie.poster_path}`
              }
              alt={featuredMovie.title}
              className="w-full h-full object-cover transition-opacity duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/30" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={goToPrevHero}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all"
          >
            <FaChevronLeft size={20} />
          </button>
          
          <button
            onClick={goToNextHero}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all"
          >
            <FaChevronRight size={20} />
          </button>

          {/* Hero Content */}
          <div className="relative z-10 h-full flex items-center max-w-7xl mx-auto px-4">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 mb-6">
                <FaChartLine className="text-yellow-400 text-lg" />
                <span className="text-yellow-400 font-semibold text-lg">Trending Now</span>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
                {featuredMovie.title}
              </h1>
              
              <div className="flex items-center gap-4 mb-8 text-gray-300">
                <div className="flex items-center gap-1">
                  <FaStar className="text-yellow-400" />
                  <span className="font-semibold text-lg">{featuredMovie.vote_average?.toFixed(1)}</span>
                </div>
                <span>•</span>
                <span className="text-lg">{new Date(featuredMovie.release_date).getFullYear()}</span>
                <span>•</span>
                <span className="bg-gray-700 px-3 py-1 rounded text-sm">
                  {featuredMovie.adult ? 'R' : 'PG-13'}
                </span>
              </div>
              
              <p className="text-gray-300 text-xl mb-10 leading-relaxed line-clamp-3 max-w-xl">
                {featuredMovie.overview}
              </p>
              
              <div className="flex gap-6">
                <button
                  onClick={() => navigate(`/movie/${featuredMovie.id}`)}
                  className="flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-lg font-semibold text-lg transition-all hover:scale-105"
                >
                  <FaPlay />
                  Watch Now
                </button>
                <button
                  onClick={() => navigate(`/movie/${featuredMovie.id}`)}
                  className="flex items-center gap-3 bg-gray-700/80 hover:bg-gray-600/80 text-white px-10 py-4 rounded-lg font-semibold text-lg transition-all backdrop-blur-sm"
                >
                  <FaInfoCircle />
                  More Info
                </button>
              </div>
            </div>
          </div>

          {/* Carousel Indicators */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
            <div className="flex gap-2">
              {heroMovies.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToHero(index)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    index === currentHeroIndex
                      ? 'bg-white scale-125'
                      : 'bg-white/50 hover:bg-white/75'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Content Sections */}
      <div className="max-w-7xl mx-auto px-4">
        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 bg-gray-800/50 p-2 rounded-lg backdrop-blur-sm">
          {[
            { key: 'all', label: 'All Movies', icon: FaFire, path: null },
            { key: 'trending', label: 'Trending', icon: FaChartLine, path: '/category/trending' },
            { key: 'popular', label: 'Popular', icon: FaFire, path: '/category/popular' },
            { key: 'topRated', label: 'Top Rated', icon: FaStar, path: '/category/topRated' },
            { key: 'upcoming', label: 'Coming Soon', icon: FaClock, path: '/category/upcoming' },
          ].map(({ key, label, icon: Icon, path }) => (
            <button
              key={key}
              onClick={() => path && navigate(path)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                key === 'all'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
              }`}
            >
              <Icon className="text-sm" />
              {label}
            </button>
          ))}
        </div>

        {/* Movie Sections */}
        {movieSections}
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

export default HomePage;
