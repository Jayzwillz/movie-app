import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { addToWatchlist, removeFromWatchlist, addToWatchlistAsync, removeFromWatchlistAsync } from "../redux/watchlistSlice";
import { ACCESS_TOKEN, BASE_URL } from "../config";
import { FaArrowLeft, FaPlus, FaCheck } from "react-icons/fa";

const MovieDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { items: watchlist, isLoading: watchlistLoading } = useSelector((state) => state.watchlist);
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const [movie, setMovie] = useState(null);
  const [credits, setCredits] = useState([]);
  const [trailer, setTrailer] = useState(null);
  const [recommendedMovies, setRecommendedMovies] = useState([]);
  const [similarMovies, setSimilarMovies] = useState([]);
  const [streamingProviders, setStreamingProviders] = useState(null);

  // Improved watchlist checking with better ID comparison
  const isInWatchlist = watchlist.some((m) => {
    const movieId = (m.movieId || m.id).toString();
    const currentId = id.toString();
    return movieId === currentId;
  });

  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        const [
          movieRes,
          creditsRes,
          videosRes,
          recommendationsRes,
          similarRes,
          providersRes,
        ] = await Promise.all([
          axios.get(`${BASE_URL}/movie/${id}`, {
            headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
          }),
          axios.get(`${BASE_URL}/movie/${id}/credits`, {
            headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
          }),
          axios.get(`${BASE_URL}/movie/${id}/videos`, {
            headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
          }),
          axios.get(`${BASE_URL}/movie/${id}/recommendations`, {
            headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
          }),
          axios.get(`${BASE_URL}/movie/${id}/similar`, {
            headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
          }),
          axios.get(`${BASE_URL}/movie/${id}/watch/providers`, {
            headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
          }),
        ]);

        setMovie(movieRes.data);
        setCredits(creditsRes.data.cast.slice(0, 6));
        setRecommendedMovies(recommendationsRes.data.results.slice(0, 6));
        setSimilarMovies(similarRes.data.results.slice(0, 6));
        setStreamingProviders(providersRes.data.results);

        const trailerVideo = videosRes.data.results.find(
          (video) => video.type === "Trailer" && video.site === "YouTube"
        );
        if (trailerVideo) {
          setTrailer(`https://www.youtube.com/embed/${trailerVideo.key}`);
        }
      } catch (error) {
        console.error("Error fetching movie details", error);
      }
    };

    fetchMovieDetails();
  }, [id]);

  const allFlatrateProviders = [];

for (const country in streamingProviders) {
  const region = streamingProviders[country];
  if (region?.flatrate) {
    region.flatrate.forEach((provider) => {
      // Avoid duplicates (some providers exist in many regions)
      if (!allFlatrateProviders.some(p => p.provider_id === provider.provider_id)) {
        allFlatrateProviders.push(provider);
      }
    });
  }
}

const getProviderLink = (providerName, movieTitle) => {
  const domainMap = {
    "Netflix": "https://www.netflix.com",
    "Amazon Prime Video": "https://www.primevideo.com",
    "Disney Plus": "https://www.disneyplus.com",
    "Hulu": "https://www.hulu.com",
    "HBO Max": "https://www.max.com",
    "Apple TV": "https://tv.apple.com",
    "Peacock": "https://www.peacocktv.com",
    "Paramount Plus": "https://www.paramountplus.com",
    // Add more as needed
  };

  return domainMap[providerName] || `https://www.google.com/search?q=${encodeURIComponent(movieTitle)}+on+${encodeURIComponent(providerName)}`;
};


   

  if (!movie) return <p className="text-center text-gray-400">Loading...</p>;

  return (
    <div className="p-6 min-h-screen bg-gray-900 text-white relative">
      {/* Blurred Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-30 blur-lg"
        style={{
          backgroundImage: `url(https://image.tmdb.org/t/p/w1280${movie.backdrop_path || movie.poster_path})`,
        }}
      ></div>

      <div className="relative z-10">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg mb-4"
        >
          <FaArrowLeft /> Back
        </button>

        <div className="flex flex-col md:flex-row items-center">
          {/* Movie Poster */}
          <img
            src={
              movie.poster_path
                ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                : "https://via.placeholder.com/500x750?text=No+Image"
            }
            alt={movie.title}
            className="w-full max-w-md rounded-lg shadow-lg"
          />

          {/* Movie Info */}
          <div className="md:ml-6 mt-4 md:mt-0">
            <h1 className="text-3xl font-bold">{movie.title}</h1>
            <p className="text-gray-400">{movie.release_date || "Unknown Release Date"}</p>
            <p className="text-yellow-400 text-lg mt-2">⭐ {movie.vote_average?.toFixed(1) || "N/A"}</p>

            {/* IMDb Link */}
            {movie.imdb_id && (
              <a
                href={`https://www.imdb.com/title/${movie.imdb_id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-yellow-400 hover:underline block mt-2"
              >
                View on IMDb
              </a>
            )}

            <p className="mt-4">{movie.overview || "No overview available."}</p>

            {/* Movie Details */}
            <p className="text-sm text-gray-300 mt-3">
              <strong>Genres:</strong> {movie.genres?.map((g) => g.name).join(", ") || "N/A"}
            </p>
            <p className="text-sm text-gray-300">
              <strong>Runtime:</strong> {movie.runtime ? `${movie.runtime} mins` : "N/A"}
            </p>
            <p className="text-sm text-gray-300">
              <strong>Language:</strong> {movie.original_language?.toUpperCase() || "N/A"}
            </p>
            <p className="text-sm text-gray-300">
              <strong>Budget:</strong> ${movie.budget?.toLocaleString() || "N/A"}
            </p>
            <p className="text-sm text-gray-300">
              <strong>Revenue:</strong> ${movie.revenue?.toLocaleString() || "N/A"}
            </p>

            {/* Watchlist Button */}
            <button
              onClick={() => {
                // If user is not authenticated, redirect to login with return URL
                if (!isAuthenticated) {
                  // Store the movie data in localStorage to add after login
                  const movieData = {
                    id: movie.id,
                    movieId: movie.id.toString(),
                    title: movie.title,
                    // Pass complete poster URL for consistency
                    poster: movie.poster_path
                      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                      : "https://via.placeholder.com/500x750?text=No+Image",
                    overview: movie.overview,
                    vote_average: movie.vote_average,
                    year: movie.release_date ? new Date(movie.release_date).getFullYear().toString() : new Date().getFullYear().toString(),
                  };
                  localStorage.setItem('pendingWatchlistItem', JSON.stringify(movieData));
                  localStorage.setItem('returnUrl', `/movie/${movie.id}`);
                  navigate('/login');
                  return;
                }

                const movieData = {
                  id: movie.id,
                  movieId: movie.id.toString(),
                  title: movie.title,
                  // Pass complete poster URL for consistency
                  poster: movie.poster_path
                    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                    : "https://via.placeholder.com/500x750?text=No+Image",
                  overview: movie.overview,
                  vote_average: movie.vote_average,
                  year: movie.release_date ? new Date(movie.release_date).getFullYear().toString() : new Date().getFullYear().toString(),
                };

                if (isInWatchlist) {
                  dispatch(removeFromWatchlistAsync({ userId: user.id, movieId: movie.id.toString() }));
                } else {
                  dispatch(addToWatchlistAsync({ userId: user.id, movieData }));
                }
              }}
              className={`mt-3 px-4 py-2 font-semibold rounded-lg flex items-center gap-2 transition ${
                isInWatchlist && isAuthenticated
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {isInWatchlist && isAuthenticated ? <FaCheck /> : <FaPlus />}
              {isInWatchlist && isAuthenticated ? "Remove from Watchlist" : "Add to Watchlist"}
            </button>
          </div>
        </div>

        {/* Cast Section */}
        {credits.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-bold">🎭 Cast</h3>
            <div className="flex gap-4 overflow-x-auto">
              {credits.map((actor) => (
                <div key={actor.id} className="text-center">
                  <img
                    src={`https://image.tmdb.org/t/p/w200${actor.profile_path}`}
                    alt={actor.name}
                    className="h-24 w-24 rounded-full object-cover"
                  />
                  <p className="text-sm">{actor.name}</p>
                  <p className="text-xs text-gray-400">{actor.character}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Trailer Section */}
        {trailer && (
          <div className="mt-6">
            <h3 className="text-lg font-bold">🎬 Watch Trailer</h3>
            <iframe
              className="w-full h-64 rounded-lg shadow-lg"
              src={trailer}
              title="Movie Trailer"
              frameBorder="0"
              allowFullScreen
            ></iframe>
          </div>
        )}

        {/* Production Companies Section */}
        {movie.production_companies && movie.production_companies.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-bold">🏭 Production Companies</h3>
            <div className="flex gap-2 flex-wrap mt-2">
              {movie.production_companies.map((company) => (
                <div key={company.id} className="flex items-center space-x-2 bg-gray-800 p-2 rounded-lg">
                  {company.logo_path && (
                    <img
                      src={`https://image.tmdb.org/t/p/w200${company.logo_path}`}
                      alt={company.name}
                      className="h-10"
                    />
                  )}
                  <p className="text-sm">{company.name}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Streaming Providers */}
        {allFlatrateProviders.length > 0 && (
  <div className="mt-6">
    <h3 className="text-lg font-bold">📺 Available on</h3>
    <div className="flex gap-4 mt-2 flex-wrap">
      {allFlatrateProviders.map((provider) => (
        <a
          key={provider.provider_id}
          href={getProviderLink(provider.provider_name, movie.title)}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:scale-105 transition"
        >
          <img
            src={`https://image.tmdb.org/t/p/w92${provider.logo_path}`}
            alt={provider.provider_name}
            title={provider.provider_name}
            className="w-12 h-12 rounded-md"
          />
        </a>
      ))}
    </div>
  </div>
)}




        {/* Recommended Movies */}
        {recommendedMovies.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-bold">🎞️ Recommended Movies</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {recommendedMovies.map((recMovie) => (
                <Link
                  to={`/movie/${recMovie.id}`}
                  key={recMovie.id}
                  className="block hover:scale-105 transition transform"
                >
                  <img
                    src={`https://image.tmdb.org/t/p/w500${recMovie.poster_path}`}
                    alt={recMovie.title}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <p className="text-center text-sm mt-2">{recMovie.title}</p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Similar Movies */}
        {similarMovies.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-bold">🎥 Similar Movies</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {similarMovies.map((simMovie) => (
                <Link
                  to={`/movie/${simMovie.id}`}
                  key={simMovie.id}
                  className="block hover:scale-105 transition transform"
                >
                  <img
                    src={`https://image.tmdb.org/t/p/w500${simMovie.poster_path}`}
                    alt={simMovie.title}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <p className="text-center text-sm mt-2">{simMovie.title}</p>
                </Link>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default MovieDetail;
