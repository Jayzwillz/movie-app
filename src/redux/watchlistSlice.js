import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { watchlistAPI } from "../services/api";

// Async thunks for backend integration
export const fetchWatchlist = createAsyncThunk(
  'watchlist/fetchWatchlist',
  async (userId, { rejectWithValue }) => {
    try {
      const watchlist = await watchlistAPI.getWatchlist(userId);
      return watchlist;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch watchlist');
    }
  }
);

export const addToWatchlistAsync = createAsyncThunk(
  'watchlist/addToWatchlist',
  async ({ userId, movieData }, { rejectWithValue, dispatch }) => {
    // Optimistic update
    dispatch(watchlistSlice.actions.optimisticAdd(movieData));
    
    try {
      const watchlist = await watchlistAPI.addToWatchlist(userId, movieData);
      return watchlist;
    } catch (error) {
      // Revert optimistic update on error
      dispatch(watchlistSlice.actions.optimisticRemove(movieData.movieId || movieData.id));
      return rejectWithValue(error.response?.data?.message || 'Failed to add to watchlist');
    }
  }
);

export const removeFromWatchlistAsync = createAsyncThunk(
  'watchlist/removeFromWatchlist',
  async ({ userId, movieId }, { rejectWithValue, dispatch }) => {
    // Optimistic update
    dispatch(watchlistSlice.actions.optimisticRemove(movieId));
    
    try {
      const watchlist = await watchlistAPI.removeFromWatchlist(userId, movieId);
      return watchlist;
    } catch (error) {
      // Revert optimistic update on error - we'd need the full movie data to restore it
      return rejectWithValue(error.response?.data?.message || 'Failed to remove from watchlist');
    }
  }
);

// Local storage functions (fallback for non-authenticated users)
const loadFromLocalStorage = () => {
  try {
    const data = localStorage.getItem("watchlist");
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const saveToLocalStorage = (watchlist) => {
  localStorage.setItem("watchlist", JSON.stringify(watchlist));
};

const watchlistSlice = createSlice({
  name: "watchlist",
  initialState: {
    items: loadFromLocalStorage(),
    isLoading: false,
    error: null,
    isBackendSync: false, // Track if using backend or localStorage
  },
  reducers: {
    // Local storage actions (for non-authenticated users)
    addToWatchlist: (state, action) => {
      if (!state.items.find((movie) => movie.id === action.payload.id)) {
        state.items.push(action.payload);
        saveToLocalStorage(state.items);
      }
    },
    removeFromWatchlist: (state, action) => {
      state.items = state.items.filter((movie) => movie.id !== action.payload);
      saveToLocalStorage(state.items);
    },
    clearWatchlist: (state) => {
      state.items = [];
      localStorage.removeItem("watchlist");
    },
    setBackendSync: (state, action) => {
      state.isBackendSync = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    optimisticAdd: (state, action) => {
      const movieData = action.payload;
      const existingIndex = state.items.findIndex(
        item => (item.movieId || item.id) === (movieData.movieId || movieData.id)
      );
      if (existingIndex === -1) {
        state.items.push(movieData);
      }
    },
    optimisticRemove: (state, action) => {
      const movieId = action.payload;
      state.items = state.items.filter(
        item => (item.movieId || item.id) !== movieId.toString()
      );
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch watchlist
      .addCase(fetchWatchlist.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchWatchlist.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
        state.isBackendSync = true;
        state.error = null;
      })
      .addCase(fetchWatchlist.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.isBackendSync = false;
      })
      // Add to watchlist
      .addCase(addToWatchlistAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addToWatchlistAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
        state.error = null;
      })
      .addCase(addToWatchlistAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Remove from watchlist
      .addCase(removeFromWatchlistAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(removeFromWatchlistAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
        state.error = null;
      })
      .addCase(removeFromWatchlistAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { 
  addToWatchlist, 
  removeFromWatchlist, 
  clearWatchlist, 
  setBackendSync,
  clearError,
  optimisticAdd,
  optimisticRemove 
} = watchlistSlice.actions;

export default watchlistSlice.reducer;
