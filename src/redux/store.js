import { configureStore } from "@reduxjs/toolkit";
import watchlistReducer from "./watchlistSlice";
import authReducer from "./authSlice";
import reviewsReducer from "./reviewsSlice";

export const store = configureStore({
  reducer: {
    watchlist: watchlistReducer,
    auth: authReducer,
    reviews: reviewsReducer,
  },
});
