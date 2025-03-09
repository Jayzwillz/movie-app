import React from "react";
import { Link } from "react-router-dom";
import MovieCard from "./MovieCard";

const MovieList = ({ movies, lastMovieRef }) => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Trending & Popular Movies</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {movies.map((movie, index) => (
          <div key={movie.id} ref={index === movies.length - 1 ? lastMovieRef : null}>
            {/* Wrap only the poster/title inside <Link> */}
            <Link to={`/movie/${movie.id}`} className="block">
              <MovieCard
                id={movie.id}
                title={movie.title}
                poster={movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : ""}
                overview={movie.overview}
              />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MovieList;
