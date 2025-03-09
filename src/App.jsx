import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./redux/store";
import MovieDetail from "./components/MovieDetail";
import Navbar from "./components/Navbar";
import HomePage from "./components/HomePage";
import TopRated from "./components/TopRated";
import Genre from "./components/Genre";
import Watchlist from "./components/WatchList";
import SearchResults from "./components/SearchResult"; // ✅ Import Search Results Component

const App = () => {
  const [searchTerm, setSearchTerm] = useState(""); // ✅ Add search state

  return (
    <Provider store={store}>
      <Router>
        <Navbar setSearchTerm={setSearchTerm} /> {/* ✅ Pass search function */}
        <div className="min-h-screen bg-gray-900 text-white pt-16">
          <div className="container mx-auto px-4 py-6">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/movie/:id" element={<MovieDetail />} />
              <Route path="/top-rated" element={<TopRated />} />
              <Route path="/genres" element={<Genre />} />
              <Route path="/watchlist" element={<Watchlist />} />
              <Route path="/search" element={<SearchResults searchTerm={searchTerm} />} /> {/* ✅ New Route */}
            </Routes>
          </div>
        </div>
      </Router>
    </Provider>
  );
};

export default App;
