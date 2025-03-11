import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaTwitter, FaLinkedin, FaEnvelope, FaChevronUp, FaChevronDown } from "react-icons/fa";

const Footer = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-0 left-0 w-full">
      {/* Toggle Button */}
      <button
        className="absolute left-1/2 -translate-x-1/2 -top-6 bg-gray-800 text-white p-2 rounded-full shadow-lg border border-gray-600 hover:bg-gray-700 transition"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <FaChevronDown size={18} /> : <FaChevronUp size={18} />}
      </button>

      {/* Footer Content */}
      {isOpen && (
        <footer className="bg-gray-900 text-white py-4 text-center shadow-md">
          <h2 className="text-lg font-bold">XZMovies</h2>
          <p className="text-gray-400">© {new Date().getFullYear()} XZMovies. All rights reserved.</p>

          {/* Quick Links */}
          <div className="mt-3 flex justify-center space-x-6">
            <Link to="/" className="hover:text-blue-400">Home</Link>
            <Link to="/genres" className="hover:text-blue-400">Genres</Link>
            <Link to="/top-rated" className="hover:text-blue-400">Top Rated</Link>
            <Link to="/watchlist" className="hover:text-blue-400">Watchlist</Link>
          </div>

          {/* Social Links */}
          <div className="flex justify-center space-x-4 mt-3">
            <a href="https://twitter.com/@jahswill1914" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-400">
              <FaTwitter size={24} />
            </a>
            <a href="https://www.linkedin.com/in/jayzwillz/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-400">
              <FaLinkedin size={24} />
            </a>
            <a href="mailto:jahswill4jahs@gmail.com" className="text-gray-400 hover:text-blue-400">
              <FaEnvelope size={24} />
            </a>
          </div>
        </footer>
      )}
    </div>
  );
};

export default Footer;
