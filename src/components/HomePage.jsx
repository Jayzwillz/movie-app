import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { FaArrowUp } from "react-icons/fa";
import MovieList from "./MovieList";
import { ACCESS_TOKEN, BASE_URL } from "../config";

const HomePage = () => {
  const [allMovies, setAllMovies] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showScroll, setShowScroll] = useState(false);
  const observer = useRef();

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
    fetchMovies(page);
  }, [page]);

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

  return (
    <div className="mt-4">
      <MovieList movies={allMovies} lastMovieRef={lastMovieRef} />
      {loading && <p className="text-center text-gray-400">Loading more...</p>}

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

export default HomePage;
