import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { removeFromWatchlist } from "../redux/watchlistSlice";
import { Link } from "react-router-dom";
import { FaTrash, FaArrowUp } from "react-icons/fa";

const Watchlist = () => {
  const watchlist = useSelector((state) => state.watchlist);
  const dispatch = useDispatch();
  const [showScroll, setShowScroll] = React.useState(false);

  // Show "Back to Top" button when scrolling
  React.useEffect(() => {
    const handleScroll = () => {
      setShowScroll(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Scroll to Top function
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white py-10 px-4">
      <h2 className="text-3xl font-bold text-center mb-6">My Watchlist</h2>

      {watchlist.length === 0 ? (
        <p className="text-center text-gray-400">No movies in watchlist yet.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {watchlist.map((movie) => (
            <div key={movie.id} className="bg-gray-800 p-4 rounded-lg shadow-lg">
              <Link to={`/movie/${movie.id}`} className="block">
                <img
                  src={movie.poster}
                  alt={movie.title}
                  className="w-full h-64 object-cover rounded-md"
                />
                <h3 className="text-lg font-semibold mt-2">{movie.title}</h3>
              </Link>
              <button
                onClick={() => dispatch(removeFromWatchlist(movie.id))}
                className="mt-3 flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md transition w-full"
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
