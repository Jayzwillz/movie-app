import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { addToWatchlist, removeFromWatchlist, addToWatchlistAsync, removeFromWatchlistAsync } from "../redux/watchlistSlice";

const MovieCard = ({ id, title, poster, overview }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items: watchlist, isLoading } = useSelector((state) => state.watchlist);
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  
  // Improved watchlist checking with better ID comparison
  const isInWatchlist = watchlist.some((movie) => {
    const movieId = (movie.movieId || movie.id).toString();
    const currentId = id.toString();
    return movieId === currentId;
  });

  const handleWatchlistClick = (event) => {
    event.stopPropagation();
    event.preventDefault();

    // If user is not authenticated, redirect to login with return URL
    if (!isAuthenticated) {
      // Store the movie data in localStorage to add after login
      const movieData = { 
        movieId: id.toString(), 
        title, 
        poster, 
        year: overview?.year || new Date().getFullYear().toString()
      };
      localStorage.setItem('pendingWatchlistItem', JSON.stringify(movieData));
      localStorage.setItem('returnUrl', window.location.pathname);
      navigate('/login');
      return;
    }

    const movieData = { 
      movieId: id.toString(), 
      title, 
      poster, 
      year: overview?.year || new Date().getFullYear().toString()
    };

    if (isInWatchlist) {
      dispatch(removeFromWatchlistAsync({ userId: user.id, movieId: id.toString() }));
    } else {
      dispatch(addToWatchlistAsync({ userId: user.id, movieData }));
    }
  };

  return (
    <div className="movie-card bg-gray-900 p-3 rounded-lg shadow-lg text-white text-left"> {/* Left-aligned text */}
      <div className="relative w-full aspect-[2/3] bg-gray-800 rounded-md overflow-hidden">
        <img
          src={poster}
          alt={title}
          className="w-full h-full object-cover"
        />
      </div>
      <h3 className="text-base font-semibold mt-2">{title}</h3>
      <p className="text-xs text-gray-400">
        {overview ? overview.slice(0, 100) : "No overview available"}...
      </p>
      <div className="flex justify-between items-center mt-3">
        <button
          onClick={handleWatchlistClick}
          disabled={isLoading}
          className={`px-4 py-2 text-sm font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed ${
            isInWatchlist && isAuthenticated
              ? "bg-red-600 hover:bg-red-700"
              : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {isLoading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              {isInWatchlist && isAuthenticated ? "Removing..." : "Adding..."}
            </div>
          ) : (
            isInWatchlist && isAuthenticated ? "Remove from Watchlist" : "Add to Watchlist"
          )}
        </button>
      </div>
    </div>
  );
};

export default MovieCard;
