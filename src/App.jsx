import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { Provider } from "react-redux";
import { GoogleOAuthProvider } from '@react-oauth/google';
import { store } from "./redux/store";
import MovieDetail from "./components/MovieDetail";
import MovieCast from "./components/MovieCast";
import MoviePhotos from "./components/MoviePhotos";
import MovieVideos from "./components/MovieVideos";
import MovieReviews from "./components/MovieReviews";
import Navbar from "./components/Navbar";
import HomePage from "./components/HomePage";
import TopRated from "./components/TopRated";
import CategoryPage from "./components/CategoryPage";
import Genre from "./components/Genre";
import Watchlist from "./components/WatchList";
import SearchResults from "./components/SearchResult";
import Login from "./components/Login";
import Register from "./components/Register";
import Profile from "./components/Profile";
import AdminDashboard from "./components/AdminDashboard";
import EmailVerified from "./components/EmailVerified";
import ResendVerification from "./components/ResendVerification";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import AIFeaturesPage from "./pages/AIFeaturesPage";
import Footer from "./components/Footer";

// Scroll to top component
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const App = () => {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <Provider store={store}>
        <Router>
          <ScrollToTop />
          <div className="min-h-screen bg-gray-900 text-white">
            <Navbar setSearchTerm={setSearchTerm} />
            <div className="pt-16 flex flex-col min-h-screen">
              <div className="mx-auto px-8 py-6 flex-grow w-full">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/category/:category" element={<CategoryPage />} />
                  <Route path="/movie/:id" element={<MovieDetail />} />
                  <Route path="/movie/:id/cast" element={<MovieCast />} />
                  <Route path="/movie/:id/photos" element={<MoviePhotos />} />
                  <Route path="/movie/:id/videos" element={<MovieVideos />} />
                  <Route path="/movie/:id/reviews" element={<MovieReviews />} />
                  <Route path="/top-rated" element={<TopRated />} />
                  <Route path="/genres" element={<Genre />} />
                  <Route path="/watchlist" element={<Watchlist />} />
                  <Route path="/search" element={<SearchResults searchTerm={searchTerm} />} />
                  <Route path="/ai-features" element={<AIFeaturesPage />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/email-verified" element={<EmailVerified />} />
                  <Route path="/resend-verification" element={<ResendVerification />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                </Routes>
              </div>
              <Footer />
            </div>
          </div>
        </Router>
      </Provider>
    </GoogleOAuthProvider>
  );
};

export default App;
