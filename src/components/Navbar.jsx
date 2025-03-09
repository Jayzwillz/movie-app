import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaBars, FaTimes, FaSearch } from "react-icons/fa";
import Logo from "../assets/Logo.png";

const Navbar = ({ setSearchTerm }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const navigate = useNavigate(); // ✅ Allows redirection

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!setSearchTerm) return; // Prevents errors if not passed
    setSearchTerm(query);
    navigate("/search"); // ✅ Redirects to search results
  };

  return (
    <nav className="fixed top-0 left-0 w-full bg-gray-800 text-white shadow-md z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo & App Name */}
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2">
            <img src={Logo} alt="XZMovies" className="h-8 w-8" />
            <span className="text-xl font-bold">XZMovies</span>
          </Link>
        </div>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          <Link to="/" className="hover:underline">Home</Link>
          <Link to="/genres" className="hover:underline">Genres</Link>
          <Link to="/top-rated" className="hover:underline">Top Rated</Link>
          <Link to="/watchlist" className="hover:underline">Watchlist</Link>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Search movies..."
              className="bg-gray-700 text-white rounded-full pl-4 pr-10 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button type="submit" className="absolute right-0 top-0 mt-1 mr-3">
              <FaSearch />
            </button>
          </form>
        </div>

        {/* Mobile Menu Toggle */}
        <div className="md:hidden">
          <button onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <FaTimes className="h-6 w-6" /> : <FaBars className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {menuOpen && (
        <div className="md:hidden bg-gray-800">
          <div className="px-4 py-2 flex flex-col gap-2">
            <Link to="/" onClick={() => setMenuOpen(false)} className="hover:underline">Home</Link>
            <Link to="/genres" onClick={() => setMenuOpen(false)} className="hover:underline">Genres</Link>
            <Link to="/top-rated" onClick={() => setMenuOpen(false)} className="hover:underline">Top Rated</Link>
            <Link to="/watchlist" onClick={() => setMenuOpen(false)} className="hover:underline">Watchlist</Link>

            {/* Mobile Search Bar */}
            <form onSubmit={handleSearchSubmit} className="relative mt-2">
              <input
                type="text"
                placeholder="Search movies..."
                className="w-full bg-gray-700 text-white rounded-full pl-4 pr-10 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button type="submit" className="absolute right-0 top-0 mt-1 mr-3">
                <FaSearch />
              </button>
            </form>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
