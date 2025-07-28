import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { FaBars, FaTimes, FaSearch, FaUser, FaSignOutAlt } from "react-icons/fa";
import { logout } from "../redux/authSlice";
import Logo from "../assets/Logo.png";

const Navbar = ({ setSearchTerm }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mediumUserMenuOpen, setMediumUserMenuOpen] = useState(false);
  const [navDropdownOpen, setNavDropdownOpen] = useState(false);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const userMenuRef = useRef(null);
  const mediumUserMenuRef = useRef(null);
  const navDropdownRef = useRef(null);
  
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
      if (mediumUserMenuRef.current && !mediumUserMenuRef.current.contains(event.target)) {
        setMediumUserMenuOpen(false);
      }
      if (navDropdownRef.current && !navDropdownRef.current.contains(event.target)) {
        setNavDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!setSearchTerm) return;
    setSearchTerm(query);
    navigate("/search");
  };

  const handleLogout = () => {
    dispatch(logout());
    setUserMenuOpen(false);
    setMediumUserMenuOpen(false);
    navigate("/");
  };

  return (
    <nav className="fixed top-0 left-0 w-full bg-gray-800 text-white shadow-md z-50">
      <div className="mx-auto px-4 md:px-6 lg:px-8 py-3 flex items-center justify-between w-full">
        {/* Logo & App Name */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <Link to="/" className="flex items-center gap-2">
            <img src={Logo} alt="XZMovies" className="h-8 w-8" />
            <span className="text-lg font-bold">XZMovies</span>
          </Link>
        </div>
        
        {/* Desktop Navigation - Large screens */}
        <div className="hidden lg:flex items-center gap-6">
          <Link to="/" className="hover:underline text-sm">Home</Link>
          <Link to="/genres" className="hover:underline text-sm">Genres</Link>
          <Link to="/top-rated" className="hover:underline text-sm">Top Rated</Link>
          <Link to="/watchlist" className="hover:underline text-sm">Watchlist</Link>
          <Link to="/ai-features" className="hover:underline text-sm bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent font-medium">
            🤖 AI Features
          </Link>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Search movies..."
              className="bg-gray-700 text-white rounded-full pl-4 pr-10 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button type="submit" className="absolute right-0 top-0 mt-1 mr-3">
              <FaSearch />
            </button>
          </form>

          {/* Authentication Section */}
          {isAuthenticated ? (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 px-3 py-1 rounded-md hover:bg-gray-700 transition-colors"
              >
                <FaUser className="h-4 w-4" />
                <span className="hidden xl:block">{user?.name}</span>
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
                className="text-blue-400 hover:text-blue-300 transition-colors text-sm"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-blue-600 hover:bg-blue-700 px-4 py-1 rounded-md transition-colors text-sm"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>

        {/* Medium Screen Navigation - Dropdown */}
        <div className="hidden md:flex lg:hidden items-center gap-4">
          {/* Navigation Dropdown */}
          <div className="relative" ref={navDropdownRef}>
            <button
              onClick={() => setNavDropdownOpen(!navDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1 rounded-md hover:bg-gray-700 transition-colors text-sm"
            >
              <FaBars className="h-4 w-4" />
              <span>Menu</span>
            </button>
            
            {navDropdownOpen && (
              <div className="absolute left-0 mt-2 w-48 bg-gray-700 rounded-md shadow-lg py-1 z-50">
                <Link
                  to="/"
                  onClick={() => setNavDropdownOpen(false)}
                  className="block px-4 py-2 text-sm text-white hover:bg-gray-600"
                >
                  Home
                </Link>
                <Link
                  to="/genres"
                  onClick={() => setNavDropdownOpen(false)}
                  className="block px-4 py-2 text-sm text-white hover:bg-gray-600"
                >
                  Genres
                </Link>
                <Link
                  to="/top-rated"
                  onClick={() => setNavDropdownOpen(false)}
                  className="block px-4 py-2 text-sm text-white hover:bg-gray-600"
                >
                  Top Rated
                </Link>
                <Link
                  to="/watchlist"
                  onClick={() => setNavDropdownOpen(false)}
                  className="block px-4 py-2 text-sm text-white hover:bg-gray-600"
                >
                  Watchlist
                </Link>
                <Link
                  to="/ai-features"
                  onClick={() => setNavDropdownOpen(false)}
                  className="block px-4 py-2 text-sm text-white hover:bg-gray-600 bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent font-medium"
                >
                  🤖 AI Features
                </Link>
              </div>
            )}
          </div>

          {/* Compact Search Bar */}
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Search..."
              className="bg-gray-700 text-white rounded-full pl-4 pr-10 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-32"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button type="submit" className="absolute right-0 top-0 mt-1 mr-3">
              <FaSearch />
            </button>
          </form>

          {/* Authentication Section */}
          {isAuthenticated ? (
            <div className="relative" ref={mediumUserMenuRef}>
              <button
                onClick={() => setMediumUserMenuOpen(!mediumUserMenuOpen)}
                className="flex items-center gap-2 px-3 py-1 rounded-md hover:bg-gray-700 transition-colors"
              >
                <FaUser className="h-4 w-4" />
              </button>
              
              {mediumUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-gray-700 rounded-md shadow-lg py-1 z-50">
                  <div className="px-4 py-2 text-sm text-gray-300 border-b border-gray-600">
                    {user?.name}
                  </div>
                  <Link
                    to="/profile"
                    onClick={() => setMediumUserMenuOpen(false)}
                    className="block px-4 py-2 text-sm text-white hover:bg-gray-600"
                  >
                    Profile
                  </Link>
                  {user?.role === 'admin' && (
                    <Link
                      to="/admin"
                      onClick={() => setMediumUserMenuOpen(false)}
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
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="text-blue-400 hover:text-blue-300 transition-colors text-sm"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded-md transition-colors text-sm"
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
            <Link to="/" onClick={() => setMenuOpen(false)} className="hover:underline text-sm">Home</Link>
            <Link to="/genres" onClick={() => setMenuOpen(false)} className="hover:underline text-sm">Genres</Link>
            <Link to="/top-rated" onClick={() => setMenuOpen(false)} className="hover:underline text-sm">Top Rated</Link>
            <Link to="/watchlist" onClick={() => setMenuOpen(false)} className="hover:underline text-sm">Watchlist</Link>
            <Link to="/ai-features" onClick={() => setMenuOpen(false)} className="hover:underline text-sm bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent font-medium">
              🤖 AI Features
            </Link>

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
                  className="text-blue-400 hover:text-blue-300 text-sm"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMenuOpen(false)}
                  className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded-md text-sm"
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
                className="w-full bg-gray-700 text-white rounded-full pl-4 pr-10 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
