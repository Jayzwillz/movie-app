import { createSlice } from "@reduxjs/toolkit";

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
  initialState: loadFromLocalStorage(),
  reducers: {
    addToWatchlist: (state, action) => {
      if (!state.find((movie) => movie.id === action.payload.id)) {
        state.push(action.payload);
        saveToLocalStorage(state);
      }
    },
    removeFromWatchlist: (state, action) => {
      const updatedList = state.filter((movie) => movie.id !== action.payload);
      saveToLocalStorage(updatedList);
      return updatedList;
    },
  },
});

export const { addToWatchlist, removeFromWatchlist } = watchlistSlice.actions;
export default watchlistSlice.reducer;
