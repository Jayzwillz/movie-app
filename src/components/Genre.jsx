import React, { useEffect, useState } from "react";
import { FaArrowUp } from "react-icons/fa";
import MovieCard from "./MovieCard";

const Genre = () => {
  const [genres, setGenres] = useState([]);
  const [movies, setMovies] = useState([]);
  const [selectedGenres, setSelectedGenres] = useState([28]); // Action genre by default
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showScroll, setShowScroll] = useState(false);

  const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

  // Fetch genres from TMDB API
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const response = await fetch(
          `https://api.themoviedb.org/3/genre/movie/list?api_key=${API_KEY}`
        );
        const data = await response.json();
        setGenres(data.genres);
      } catch (error) {
        console.error("Error fetching genres:", error);
      }
    };

    fetchGenres();
  }, []);

  // Fetch movies based on selected genres
  const fetchMovies = async (newPage = 1) => {
    if (selectedGenres.length === 0) {
      setMovies([]);
      return;
    }

    setLoading(true);

    try {
      const genreQuery = selectedGenres.join(",");
      const response = await fetch(
        `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&with_genres=${genreQuery}&page=${newPage}`
      );
      const data = await response.json();

      setMovies((prevMovies) => (newPage === 1 ? data.results : [...prevMovies, ...data.results]));
    } catch (error) {
      console.error("Error fetching movies:", error);
    } finally {
      setLoading(false);
    }
  };

  // Toggle genre selection
  const handleGenreClick = (genreId) => {
    setSelectedGenres((prevGenres) => {
      const updatedGenres = prevGenres.includes(genreId)
        ? prevGenres.filter((id) => id !== genreId) // Remove genre
        : [...prevGenres, genreId]; // Add genre

      setPage(1);
      return updatedGenres;
    });
  };

  // Infinite scroll & show back-to-top button
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

  // Load more movies when page changes
  useEffect(() => {
    fetchMovies(page);
  }, [page, selectedGenres]);

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="text-center">
      <h2 className="text-2xl font-bold mb-4">Movie Genres</h2>

      {/* Genre Buttons */}
      <div className="flex flex-wrap justify-center gap-2 mb-6">
        {genres.map((genre) => (
          <button
            key={genre.id}
            className={`px-3 py-1 text-sm rounded-md shadow ${
              selectedGenres.includes(genre.id) ? "bg-blue-500 text-white" : "bg-gray-700 text-gray-200"
            } hover:bg-blue-600 transition`}
            onClick={() => handleGenreClick(genre.id)}
          >
            {genre.name}
          </button>
        ))}
      </div>

      {/* Movies List */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {movies.map((movie) => (
          <MovieCard
            key={movie.id}
            id={movie.id}
            title={movie.title}
            poster={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
            overview={movie.overview}
            textAlignment="left" // Pass prop for left-aligned text
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

export default Genre;
