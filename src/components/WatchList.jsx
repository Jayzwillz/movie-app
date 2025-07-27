import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { removeFromWatchlist, removeFromWatchlistAsync, fetchWatchlist } from "../redux/watchlistSlice";
import { Link } from "react-router-dom";
import { FaTrash, FaArrowUp, FaSignInAlt } from "react-icons/fa";

const Watchlist = () => {
  const { items: watchlist, isLoading, error, isBackendSync } = useSelector((state) => state.watchlist);
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [showScroll, setShowScroll] = React.useState(false);

  // Fetch watchlist from backend if authenticated
  useEffect(() => {
    if (isAuthenticated && user && !isBackendSync) {
      dispatch(fetchWatchlist(user.id));
    }
  }, [isAuthenticated, user, isBackendSync, dispatch]);

  // Show "Back to Top" button when scrolling
  React.useEffect(() => {
    const handleScroll = () => {
      setShowScroll(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // If user is not authenticated, show login prompt
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="mb-8">
            <FaSignInAlt className="text-6xl text-blue-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-4">Sign In Required</h1>
            <p className="text-gray-400 mb-6">
              Please sign in to view and manage your personal watchlist. Your watchlist will be saved and synced across all your devices.
            </p>
          </div>
          <div className="space-y-4">
            <Link
              to="/login"
              className="block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="block bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Create Account
            </Link>
            <Link
              to="/"
              className="block text-gray-400 hover:text-white underline"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Scroll to Top function
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleRemoveFromWatchlist = (movieId) => {
    if (isAuthenticated && user) {
      // Use backend API
      dispatch(removeFromWatchlistAsync({ userId: user.id, movieId }));
    } else {
      // Use localStorage
      dispatch(removeFromWatchlist(movieId));
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white py-10 px-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">My Watchlist</h2>
        {isAuthenticated && (
          <div className="text-sm text-gray-400">
            Synced with your account
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      ) : watchlist.length === 0 ? (
        <div className="text-center text-gray-400 py-20">
          <p className="text-xl mb-4">No movies in watchlist yet.</p>
          <Link to="/" className="text-blue-400 hover:text-blue-300">
            Browse movies to add to your watchlist
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {watchlist.map((movie) => (
            <div key={movie.movieId || movie.id} className="bg-gray-800 p-4 rounded-lg shadow-lg">
              <Link to={`/movie/${movie.movieId || movie.id}`} className="block">
                <div className="relative w-full aspect-[2/3] bg-gray-700 rounded-md overflow-hidden">
                  <img
                    src={movie.poster}
                    alt={movie.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-lg font-semibold mt-2">{movie.title}</h3>
                {movie.year && (
                  <p className="text-gray-400 text-sm">{movie.year}</p>
                )}
                {movie.addedAt && (
                  <p className="text-gray-500 text-xs mt-1">
                    Added {new Date(movie.addedAt).toLocaleDateString()}
                  </p>
                )}
              </Link>
              <button
                onClick={() => handleRemoveFromWatchlist(movie.movieId || movie.id)}
                disabled={isLoading}
                className="mt-3 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md transition w-full disabled:opacity-50"
              >
                <FaTrash /> Remove
              </button>
            </div>
          ))}
        </div>
      )}

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

export default Watchlist;
