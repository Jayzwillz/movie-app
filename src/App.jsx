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
import SearchResults from "./components/SearchResult";
import Footer from "./components/Footer"; // ✅ Import Footer Component

const App = () => {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <Provider store={store}>
      <Router>
        <Navbar setSearchTerm={setSearchTerm} />
        <div className="min-h-screen bg-gray-900 text-white pt-16 flex flex-col">
          <div className="container mx-auto px-4 py-6 flex-grow">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/movie/:id" element={<MovieDetail />} />
              <Route path="/top-rated" element={<TopRated />} />
              <Route path="/genres" element={<Genre />} />
              <Route path="/watchlist" element={<Watchlist />} />
              <Route path="/search" element={<SearchResults searchTerm={searchTerm} />} />
            </Routes>
          </div>
        </div>
        <Footer /> {/* ✅ Add Floating Footer */}
      </Router>
    </Provider>
  );
};

export default App;
