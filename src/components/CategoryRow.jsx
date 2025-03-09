import React from "react";
import { Link } from "react-router-dom";
import MovieCard from "./MovieCard";
import { IMAGE_BASE_URL } from "../config";

const CategoryRow = ({ title, movies }) => {
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      <div className="flex space-x-4 overflow-x-auto pb-2">
        {movies.map((movie) => (
          <div key={movie.id} className="flex-shrink-0 w-48">
            <Link to={`/movie/${movie.id}`}>
              <MovieCard
                id={movie.id}
                title={movie.title}
                poster={`${IMAGE_BASE_URL}${movie.poster_path}`}
                overview={movie.overview}
              />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryRow;
