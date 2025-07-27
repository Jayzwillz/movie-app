import React, { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowUp, FaStar, FaFilter, FaSearch, FaTimes, FaChevronDown, FaSortAmountDown, FaSortAmountUp } from "react-icons/fa";
import { ACCESS_TOKEN, BASE_URL } from "../config";
import axios from "axios";

const Genre = () => {
  const navigate = useNavigate();
  const [genres, setGenres] = useState([]);
  const [movies, setMovies] = useState([]);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [showScroll, setShowScroll] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("popularity.desc");
  const [yearRange, setYearRange] = useState({ min: "", max: "" });
  const [ratingRange, setRatingRange] = useState({ min: "", max: "" });
  
  // Temporary filter states (for user to modify before applying)
  const [tempSelectedGenres, setTempSelectedGenres] = useState([]);
  const [tempSearchTerm, setTempSearchTerm] = useState("");
  const [tempSortBy, setTempSortBy] = useState("popularity.desc");
  const [tempYearRange, setTempYearRange] = useState({ min: "", max: "" });
  const [tempRatingRange, setTempRatingRange] = useState({ min: "", max: "" });
  
  const observer = useRef();

  // Sort options
  const sortOptions = [
    { value: "popularity.desc", label: "Most Popular" },
    { value: "popularity.asc", label: "Least Popular" },
    { value: "vote_average.desc", label: "Highest Rated" },
    { value: "vote_average.asc", label: "Lowest Rated" },
    { value: "release_date.desc", label: "Newest First" },
    { value: "release_date.asc", label: "Oldest First" },
    { value: "title.asc", label: "A-Z" },
    { value: "title.desc", label: "Z-A" },
  ];

  // Fetch genres from TMDB API
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/genre/movie/list`, {
          headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
        });
        setGenres(response.data.genres);
      } catch (error) {
        console.error("Error fetching genres:", error);
      }
      setInitialLoading(false);
    };

    fetchGenres();
  }, []);

  // Fetch movies based on filters
  const fetchMovies = async (newPage = 1, reset = false) => {
    if (loading) return;
    
    setLoading(true);

    try {
      const params = {
        page: newPage,
        sort_by: sortBy,
        include_adult: false,
        include_video: false,
      };

      // Add genre filter
      if (selectedGenres.length > 0) {
        params.with_genres = selectedGenres.join(",");
      }

      // Add year filter
      if (yearRange.min) params.primary_release_date_gte = `${yearRange.min}-01-01`;
      if (yearRange.max) params.primary_release_date_lte = `${yearRange.max}-12-31`;

      // Add rating filter
      if (ratingRange.min) params.vote_average_gte = ratingRange.min;
      if (ratingRange.max) params.vote_average_lte = ratingRange.max;

      // Add search term
      let endpoint = "/discover/movie";
      if (searchTerm.trim()) {
        endpoint = "/search/movie";
        params.query = searchTerm.trim();
        delete params.sort_by; // Search doesn't support sort_by
      }

      const response = await axios.get(`${BASE_URL}${endpoint}`, {
        headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
        params,
      });

      const newMovies = response.data.results || [];
      setTotalResults(response.data.total_results || 0);

      if (reset || newPage === 1) {
        setMovies(newMovies);
      } else {
        setMovies(prev => [...prev, ...newMovies]);
      }
    } catch (error) {
      console.error("Error fetching movies:", error);
    } finally {
      setLoading(false);
    }
  };

  // Apply filters function
  const applyFilters = () => {
    setSelectedGenres(tempSelectedGenres);
    setSearchTerm(tempSearchTerm);
    setSortBy(tempSortBy);
    setYearRange(tempYearRange);
    setRatingRange(tempRatingRange);
    setPage(1);
  };

  // Reset filters
  const resetFilters = () => {
    const resetState = {
      selectedGenres: [],
      searchTerm: "",
      sortBy: "popularity.desc",
      yearRange: { min: "", max: "" },
      ratingRange: { min: "", max: "" }
    };
    
    // Reset both applied and temporary states
    setSelectedGenres(resetState.selectedGenres);
    setSearchTerm(resetState.searchTerm);
    setSortBy(resetState.sortBy);
    setYearRange(resetState.yearRange);
    setRatingRange(resetState.ratingRange);
    
    setTempSelectedGenres(resetState.selectedGenres);
    setTempSearchTerm(resetState.searchTerm);
    setTempSortBy(resetState.sortBy);
    setTempYearRange(resetState.yearRange);
    setTempRatingRange(resetState.ratingRange);
    
    setPage(1);
  };

  // Toggle genre selection in temporary state
  const handleGenreClick = (genreId) => {
    setTempSelectedGenres(prev => {
      const updated = prev.includes(genreId)
        ? prev.filter(id => id !== genreId)
        : [...prev, genreId];
      return updated;
    });
  };

  // Initialize temporary states with current applied states
  useEffect(() => {
    setTempSelectedGenres(selectedGenres);
    setTempSearchTerm(searchTerm);
    setTempSortBy(sortBy);
    setTempYearRange(yearRange);
    setTempRatingRange(ratingRange);
  }, [selectedGenres, searchTerm, sortBy, yearRange, ratingRange]);

  // Check if there are pending changes to apply
  const hasChanges = () => {
    return (
      JSON.stringify(tempSelectedGenres) !== JSON.stringify(selectedGenres) ||
      tempSearchTerm !== searchTerm ||
      tempSortBy !== sortBy ||
      JSON.stringify(tempYearRange) !== JSON.stringify(yearRange) ||
      JSON.stringify(tempRatingRange) !== JSON.stringify(ratingRange)
    );
  };

  // Infinite scroll observer
  const lastMovieRef = useCallback(
    (node) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          setPage(prevPage => prevPage + 1);
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

  // Fetch movies when filters change (only applied filters, not temporary ones)
  useEffect(() => {
    if (!initialLoading) {
      fetchMovies(1, true);
    }
  }, [selectedGenres, sortBy, yearRange, ratingRange, searchTerm]);

  // Fetch more movies when page changes
  useEffect(() => {
    if (page > 1) {
      fetchMovies(page);
    }
  }, [page]);

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
          <p className="text-gray-400 text-lg">Loading genres...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 py-12 mb-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Discover Movies by Genre
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Explore thousands of movies across all genres. Use filters to find exactly what you're looking for.
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search for movies..."
                value={tempSearchTerm}
                onChange={(e) => setTempSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && applyFilters()}
                className="w-full pl-12 pr-4 py-4 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {tempSearchTerm && (
                <button
                  onClick={() => setTempSearchTerm("")}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  <FaTimes />
                </button>
              )}
            </div>
            
            {/* Quick Apply Button for Search */}
            {tempSearchTerm !== searchTerm && tempSearchTerm.trim() && (
              <div className="mt-3 text-center">
                <button
                  onClick={applyFilters}
                  className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  <FaSearch />
                  Search for "{tempSearchTerm}"
                </button>
              </div>
            )}
          </div>

          {/* Filter Toggle */}
          <div className="text-center">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              <FaFilter />
              {showFilters ? "Hide Filters" : "Show Filters"}
              <FaChevronDown className={`transition-transform ${showFilters ? "rotate-180" : ""}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      {showFilters && (
        <div className="max-w-7xl mx-auto px-4 mb-8">
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Genre Selection */}
              <div>
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <FaFilter className="text-blue-400" />
                  Genres ({tempSelectedGenres.length} selected)
                </h3>
                <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
                  {genres.map((genre) => (
                    <button
                      key={genre.id}
                      onClick={() => handleGenreClick(genre.id)}
                      className={`px-3 py-2 text-sm rounded-full font-medium transition-all ${
                        tempSelectedGenres.includes(genre.id)
                          ? "bg-blue-600 text-white shadow-lg scale-105"
                          : "bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white"
                      }`}
                    >
                      {genre.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort & Year Range */}
              <div className="space-y-4">
                {/* Sort By */}
                <div>
                  <label className="text-white font-semibold mb-2 block flex items-center gap-2">
                    <FaSortAmountDown className="text-blue-400" />
                    Sort By
                  </label>
                  <select
                    value={tempSortBy}
                    onChange={(e) => setTempSortBy(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {sortOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Year Range */}
                <div>
                  <label className="text-white font-semibold mb-2 block">Release Year</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      placeholder="From"
                      value={tempYearRange.min}
                      onChange={(e) => setTempYearRange(prev => ({ ...prev, min: e.target.value }))}
                      className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="1900"
                      max={new Date().getFullYear()}
                    />
                    <input
                      type="number"
                      placeholder="To"
                      value={tempYearRange.max}
                      onChange={(e) => setTempYearRange(prev => ({ ...prev, max: e.target.value }))}
                      className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="1900"
                      max={new Date().getFullYear()}
                    />
                  </div>
                </div>
              </div>

              {/* Rating Range & Actions */}
              <div className="space-y-4">
                {/* Rating Range */}
                <div>
                  <label className="text-white font-semibold mb-2 block flex items-center gap-2">
                    <FaStar className="text-yellow-400" />
                    Rating Range
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={tempRatingRange.min}
                      onChange={(e) => setTempRatingRange(prev => ({ ...prev, min: e.target.value }))}
                      className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                      max="10"
                      step="0.1"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={tempRatingRange.max}
                      onChange={(e) => setTempRatingRange(prev => ({ ...prev, max: e.target.value }))}
                      className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                      max="10"
                      step="0.1"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                  {/* Apply Filters Button */}
                  <button
                    onClick={applyFilters}
                    disabled={!hasChanges()}
                    className={`w-full py-3 px-4 rounded-lg font-semibold transition-all ${
                      hasChanges()
                        ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:scale-105"
                        : "bg-gray-600 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    {hasChanges() ? "Apply Filters" : "No Changes to Apply"}
                  </button>

                  {/* Reset Filters */}
                  <button
                    onClick={resetFilters}
                    className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                  >
                    Reset All Filters
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results Summary */}
      <div className="max-w-7xl mx-auto px-4 mb-6">
        <div className="flex items-center justify-between text-gray-400">
          <p>
            {loading && movies.length === 0 ? (
              "Searching..."
            ) : (
              `Found ${totalResults.toLocaleString()} movies${selectedGenres.length > 0 ? ` in selected genres` : ""}${searchTerm ? ` for "${searchTerm}"` : ""}`
            )}
          </p>
          {selectedGenres.length > 0 && (
            <button
              onClick={() => setSelectedGenres([])}
              className="text-blue-400 hover:text-blue-300 text-sm"
            >
              Clear genre filters
            </button>
          )}
        </div>
      </div>

      {/* Movies Grid */}
      <div className="max-w-7xl mx-auto px-4 pb-12">
        {movies.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
            {movies.map((movie, index) => (
              <MovieCard
                key={`${movie.id}-${index}`}
                movie={movie}
                isLast={index === movies.length - 1}
              />
            ))}
          </div>
        ) : !loading ? (
          <div className="text-center py-20">
            <div className="text-6xl text-gray-600 mb-4">🎬</div>
            <h3 className="text-xl font-semibold text-white mb-2">No movies found</h3>
            <p className="text-gray-400 mb-6">
              Try adjusting your filters or search terms to find more movies.
            </p>
            <button
              onClick={resetFilters}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : null}

        {/* Loading indicator */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-400 text-lg">Loading more movies...</p>
          </div>
        )}
      </div>

      {/* Floating Apply Button - shows when there are unapplied changes */}
      {hasChanges() && (
        <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-40">
          <div className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full shadow-2xl transition-all hover:scale-105 flex items-center gap-3">
            <button
              onClick={applyFilters}
              className="font-semibold"
            >
              Apply Filters
            </button>
            <div className="w-px h-6 bg-blue-400"></div>
            <button
              onClick={resetFilters}
              className="text-blue-200 hover:text-white transition-colors"
            >
              Reset
            </button>
          </div>
        </div>
      )}

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

export default Genre;
