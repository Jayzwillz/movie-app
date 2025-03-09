import React, { useEffect, useState } from "react";
import { FaArrowUp } from "react-icons/fa";
import MovieCard from "./MovieCard";

const TopRated = () => {
  const [movies, setMovies] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showScroll, setShowScroll] = useState(false);

  const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

  // Fetch top-rated movies
  const fetchMovies = async (newPage = 1) => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/movie/top_rated?api_key=${API_KEY}&page=${newPage}`
      );
      const data = await response.json();
      setMovies((prevMovies) => (newPage === 1 ? data.results : [...prevMovies, ...data.results]));
    } catch (error) {
      console.error("Error fetching top-rated movies:", error);
    } finally {
      setLoading(false);
    }
  };

  // Infinite Scroll & Show Back-to-Top Button
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100 && !loading) {
        setPage((prevPage) => prevPage + 1);
      }
      setShowScroll(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loading]);

  // Load movies when page changes
  useEffect(() => {
    fetchMovies(page);
  }, [page]);

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="text-center">
      <h2 className="text-2xl font-bold mb-4">Top Rated Movies</h2>

      {/* Movies List */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {movies.map((movie) => (
          <MovieCard
            key={movie.id}
            id={movie.id}
            title={movie.title}
            poster={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
            overview={movie.overview}
          />
        ))}
      </div>

      {/* Loading Indicator */}
      {loading && <p className="text-gray-400 mt-4">Loading more movies...</p>}

      {/* Back to Top Button */}
      {showScroll && (
        <button
          className="fixed bottom-5 right-5 bg-blue-500 text-white p-3 rounded-full shadow-lg hover:bg-blue-600 transition"
          onClick={scrollToTop}
        >
          <FaArrowUp size={20} />
        </button>
      )}
    </div>
  );
};

export default TopRated;
