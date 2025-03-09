import React from "react";

const GenreFilter = ({ setGenre }) => {
  const genres = ["Action", "Comedy", "Drama", "Horror", "Sci-Fi", "Romance"];

  return (
    <select
      onChange={(e) => setGenre(e.target.value)}
      className="p-2 text-black rounded-md bg-white cursor-pointer"
    >
      <option value="">All Genres</option>
      {genres.map((genre) => (
        <option key={genre} value={genre}>
          {genre}
        </option>
      ))}
    </select>
  );
  
};

export default GenreFilter;
