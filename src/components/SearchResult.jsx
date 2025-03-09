import React, { useEffect, useState } from "react";
import axios from "axios";
import { ACCESS_TOKEN, BASE_URL } from "../config";
import MovieList from "./MovieList"; 

const SearchResults = ({ searchTerm }) => {
  const [movies, setMovies] = useState([]);

  useEffect(() => {
    if (!searchTerm) return; // Prevent unnecessary API calls

    const fetchMovies = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/search/movie`, {
          headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
          params: { query: searchTerm },
        });
        setMovies(response.data.results);
      } catch (error) {
        console.error("Error fetching search results:", error);
      }
    };

    fetchMovies();
  }, [searchTerm]);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-5">
      <h2 className="text-3xl font-bold mb-6 text-center">
        Search Results for "{searchTerm}"
      </h2>

      {movies.length > 0 ? (
        <MovieList movies={movies} />
      ) : (
        <p className="text-center text-gray-400">No results found.</p>
      )}
    </div>
  );
};

export default SearchResults;
