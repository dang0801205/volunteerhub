import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  fetchMyRecommendations,
  fetchSimilarEvents,
} from "../services/recommendationService";

const initialState = {
  myRecommendations: [],
  similarEvents: [],
  loading: false,
  error: null,
};

export const getMyRecommendations = createAsyncThunk(
  "recommendations/getMyRecommendations",
  async (limit, { rejectWithValue }) => {
    try {
      return await fetchMyRecommendations(limit);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const getSimilarEvents = createAsyncThunk(
  "recommendations/getSimilarEvents",
  async ({ eventId, limit }, { rejectWithValue }) => {
    try {
      return await fetchSimilarEvents(eventId, limit);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

const recommendationSlice = createSlice({
  name: "recommendations",
  initialState,
  reducers: {
    clearRecommendations: (state) => {
      state.myRecommendations = [];
      state.similarEvents = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // My Recommendations
      .addCase(getMyRecommendations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMyRecommendations.fulfilled, (state, action) => {
        state.loading = false;
        state.myRecommendations = action.payload.data;
      })
      .addCase(getMyRecommendations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Similar Events
      .addCase(getSimilarEvents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSimilarEvents.fulfilled, (state, action) => {
        state.loading = false;
        state.similarEvents = action.payload.data;
      })
      .addCase(getSimilarEvents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearRecommendations } = recommendationSlice.actions;
export default recommendationSlice.reducer;
