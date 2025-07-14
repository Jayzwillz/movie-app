import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { FaBars, FaTimes, FaSearch, FaUser, FaSignOutAlt } from "react-icons/fa";
import { logout } from "../redux/authSlice";
import Logo from "../assets/Logo.png";

const Navbar = ({ setSearchTerm }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!setSearchTerm) return;
    setSearchTerm(query);
    navigate("/search");
  };

  const handleLogout = () => {
    dispatch(logout());
    setUserMenuOpen(false);
    navigate("/");
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

          {/* Authentication Section */}
          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 px-3 py-1 rounded-md hover:bg-gray-700 transition-colors"
              >
                <FaUser className="h-4 w-4" />
                <span className="hidden lg:block">{user?.name}</span>
              </button>
              
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-gray-700 rounded-md shadow-lg py-1 z-50">
                  <Link
                    to="/profile"
                    onClick={() => setUserMenuOpen(false)}
                    className="block px-4 py-2 text-sm text-white hover:bg-gray-600"
                  >
                    Profile
                  </Link>
                  {user?.role === 'admin' && (
                    <Link
                      to="/admin"
                      onClick={() => setUserMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-white hover:bg-gray-600"
                    >
                      Admin Dashboard
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-600"
                  >
                    <FaSignOutAlt className="inline mr-2" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link
                to="/login"
                className="text-blue-400 hover:text-blue-300 transition-colors"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-blue-600 hover:bg-blue-700 px-4 py-1 rounded-md transition-colors"
              >
                Sign Up
              </Link>
            </div>
          )}
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

            {/* Mobile Authentication */}
            {isAuthenticated ? (
              <div className="border-t border-gray-700 mt-2 pt-2">
                <Link
                  to="/profile"
                  onClick={() => setMenuOpen(false)}
                  className="block py-1 hover:underline"
                >
                  <FaUser className="inline mr-2" />
                  {user?.name}
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setMenuOpen(false);
                  }}
                  className="block py-1 hover:underline text-left"
                >
                  <FaSignOutAlt className="inline mr-2" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="border-t border-gray-700 mt-2 pt-2 flex gap-4">
                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="text-blue-400 hover:text-blue-300"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMenuOpen(false)}
                  className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded-md"
                >
                  Sign Up
                </Link>
              </div>
            )}

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
