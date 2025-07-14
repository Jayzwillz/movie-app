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
import Login from "./components/Login";
import Register from "./components/Register";
import Profile from "./components/Profile";
import AdminDashboard from "./components/AdminDashboard";
import Footer from "./components/Footer";

const App = () => {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <Provider store={store}>
      <Router>
        <div className="min-h-screen bg-gray-900 text-white">
          <Navbar setSearchTerm={setSearchTerm} />
          <div className="pt-16 flex flex-col min-h-screen">
            <div className="container mx-auto px-4 py-6 flex-grow">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/movie/:id" element={<MovieDetail />} />
                <Route path="/top-rated" element={<TopRated />} />
                <Route path="/genres" element={<Genre />} />
                <Route path="/watchlist" element={<Watchlist />} />
                <Route path="/search" element={<SearchResults searchTerm={searchTerm} />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/admin" element={<AdminDashboard />} />
              </Routes>
            </div>
            <Footer />
          </div>
        </div>
      </Router>
    </Provider>
  );
};

export default App;
