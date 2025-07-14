import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { reviewAPI } from '../services/api';

// Async thunks
export const addReview = createAsyncThunk(
  'reviews/addReview',
  async (reviewData, { rejectWithValue }) => {
    try {
      const response = await reviewAPI.addReview(reviewData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add review');
    }
  }
);

export const fetchMovieReviews = createAsyncThunk(
  'reviews/fetchMovieReviews',
  async (movieId, { rejectWithValue }) => {
    try {
      const response = await reviewAPI.getMovieReviews(movieId);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch reviews');
    }
  }
);

export const fetchUserReviews = createAsyncThunk(
  'reviews/fetchUserReviews',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await reviewAPI.getUserReviews(userId);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user reviews');
    }
  }
);

export const updateReview = createAsyncThunk(
  'reviews/updateReview',
  async ({ reviewId, reviewData }, { rejectWithValue }) => {
    try {
      const response = await reviewAPI.updateReview(reviewId, reviewData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update review');
    }
  }
);

export const deleteReview = createAsyncThunk(
  'reviews/deleteReview',
  async (reviewId, { rejectWithValue }) => {
    try {
      const response = await reviewAPI.deleteReview(reviewId);
      return { reviewId, message: response.message };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete review');
    }
  }
);

const reviewsSlice = createSlice({
  name: 'reviews',
  initialState: {
    movieReviews: {},  // Store reviews by movieId
    userReviews: [],   // Store current user's reviews
    isLoading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearMovieReviews: (state) => {
      state.movieReviews = {};
    },
    clearUserReviews: (state) => {
      state.userReviews = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Add review
      .addCase(addReview.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addReview.fulfilled, (state, action) => {
        state.isLoading = false;
        const { review } = action.payload;
        
        // Add to user reviews
        state.userReviews.unshift(review);
        
        // Add to movie reviews if that movie's reviews are loaded
        if (state.movieReviews[review.movieId]) {
          state.movieReviews[review.movieId].reviews.unshift(review);
          state.movieReviews[review.movieId].totalReviews += 1;
          
          // Recalculate average rating
          const reviews = state.movieReviews[review.movieId].reviews;
          const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
          state.movieReviews[review.movieId].averageRating = 
            parseFloat((totalRating / reviews.length).toFixed(1));
        }
        
        state.error = null;
      })
      .addCase(addReview.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Fetch movie reviews
      .addCase(fetchMovieReviews.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMovieReviews.fulfilled, (state, action) => {
        state.isLoading = false;
        const { movieId, ...reviewData } = action.payload;
        state.movieReviews[movieId] = reviewData;
        state.error = null;
      })
      .addCase(fetchMovieReviews.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Fetch user reviews
      .addCase(fetchUserReviews.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserReviews.fulfilled, (state, action) => {
        state.isLoading = false;
        state.userReviews = action.payload.reviews;
        state.error = null;
      })
      .addCase(fetchUserReviews.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Update review
      .addCase(updateReview.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateReview.fulfilled, (state, action) => {
        state.isLoading = false;
        const { review } = action.payload;
        
        // Update in user reviews
        const userReviewIndex = state.userReviews.findIndex(r => r.id === review.id);
        if (userReviewIndex !== -1) {
          state.userReviews[userReviewIndex] = review;
        }
        
        // Update in movie reviews
        if (state.movieReviews[review.movieId]) {
          const movieReviewIndex = state.movieReviews[review.movieId].reviews
            .findIndex(r => r.id === review.id);
          if (movieReviewIndex !== -1) {
            state.movieReviews[review.movieId].reviews[movieReviewIndex] = review;
            
            // Recalculate average rating
            const reviews = state.movieReviews[review.movieId].reviews;
            const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
            state.movieReviews[review.movieId].averageRating = 
              parseFloat((totalRating / reviews.length).toFixed(1));
          }
        }
        
        state.error = null;
      })
      .addCase(updateReview.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Delete review
      .addCase(deleteReview.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteReview.fulfilled, (state, action) => {
        state.isLoading = false;
        const { reviewId } = action.payload;
        
        // Remove from user reviews
        state.userReviews = state.userReviews.filter(r => r.id !== reviewId);
        
        // Remove from movie reviews and recalculate ratings
        Object.keys(state.movieReviews).forEach(movieId => {
          const movieReview = state.movieReviews[movieId];
          const initialLength = movieReview.reviews.length;
          movieReview.reviews = movieReview.reviews.filter(r => r.id !== reviewId);
          
          if (movieReview.reviews.length < initialLength) {
            movieReview.totalReviews -= 1;
            
            if (movieReview.reviews.length > 0) {
              const totalRating = movieReview.reviews.reduce((sum, r) => sum + r.rating, 0);
              movieReview.averageRating = parseFloat((totalRating / movieReview.reviews.length).toFixed(1));
            } else {
              movieReview.averageRating = 0;
            }
          }
        });
        
        state.error = null;
      })
      .addCase(deleteReview.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearMovieReviews, clearUserReviews } = reviewsSlice.actions;
export default reviewsSlice.reducer;
