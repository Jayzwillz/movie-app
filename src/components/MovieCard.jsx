import React from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addToWatchlist, removeFromWatchlist } from "../redux/watchlistSlice";

const MovieCard = ({ id, title, poster, overview }) => {
  const dispatch = useDispatch();
  const watchlist = useSelector((state) => state.watchlist);
  const isInWatchlist = watchlist.some((movie) => movie.id === id);

  const handleWatchlistClick = (event) => {
    event.stopPropagation();
    event.preventDefault();

    if (isInWatchlist) {
      dispatch(removeFromWatchlist(id));
    } else {
      dispatch(addToWatchlist({ id, title, poster, overview }));
    }
  };

  return (
    <Link to={`/movie/${id}`} className="block">
      <div className="movie-card bg-gray-900 p-4 rounded-lg shadow-lg text-white text-left"> {/* Left-aligned text */}
        <img
          src={poster}
          alt={title}
          className="w-full h-64 object-cover rounded-md"
        />
        <h3 className="text-lg font-semibold mt-2">{title}</h3>
        <p className="text-sm text-gray-400">
          {overview ? overview.slice(0, 100) : "No overview available"}...
        </p>
        <div className="flex justify-between items-center mt-3">
          <button
            onClick={handleWatchlistClick}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition ${
              isInWatchlist
                ? "bg-red-600 hover:bg-red-700"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {isInWatchlist ? "Remove from Watchlist" : "Add to Watchlist"}
          </button>
        </div>
      </div>
    </Link>
  );
};

export default MovieCard;
