/** @format */
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api";

// 1. FETCH LIST
export const fetchEventAttendances = createAsyncThunk(
  "attendance/fetchByEvent",
  async (eventId, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/api/attendances/event/${eventId}`);

      return { eventId, attendances: data.data || [] };
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Lỗi tải danh sách điểm danh"
      );
    }
  }
);

// 2. CHECK-IN

export const checkinAttendance = createAsyncThunk(
  "attendance/checkin",

  async ({ regId, eventId }, { rejectWithValue, dispatch }) => {
    try {
      const { data } = await api.post("/api/attendances/checkin", { regId });

      await dispatch(fetchEventAttendances(eventId));

      return { ...data, regId, eventId };
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Điểm danh thất bại"
      );
    }
  }
);

// 3. CHECK-OUT

export const checkoutAttendance = createAsyncThunk(
  "attendance/checkout",
  async ({ regId, eventId }, { rejectWithValue, dispatch }) => {
    try {
      const { data } = await api.post("/api/attendances/checkout", {
        regId,
      });

      await dispatch(fetchEventAttendances(eventId));

      return { ...data, regId, eventId };
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Check-out thất bại"
      );
    }
  }
);

// 4. Submit feedback
export const submitFeedback = createAsyncThunk(
  "attendance/submitFeedback",
  async (
    { attendanceId, rating, comment, eventId },
    { rejectWithValue, dispatch }
  ) => {
    try {
      const { data } = await api.put(
        `/api/attendances/${attendanceId}/feedback`,
        { rating, comment }
      );

      if (eventId) {
        await dispatch(fetchEventAttendances(eventId));
      }

      return data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Gửi đánh giá thất bại"
      );
    }
  }
);

// 5. feedBack
export const fetchEventFeedbacks = createAsyncThunk(
  "attendance/fetchFeedbacks",
  async (eventId, { rejectWithValue }) => {
    try {
      // API: GET /api/attendances/event/:eventId/feedbacks
      const { data } = await api.get(
        `/api/attendances/event/${eventId}/feedbacks`
      );

      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Lỗi tải đánh giá");
    }
  }
);

const attendanceSlice = createSlice({
  name: "attendance",
  initialState: {
    byEvent: {},
    reviews: [],
    loading: false,
    error: null,
    successMessage: null,
  },
  reducers: {
    clearAttendanceMessages: (state) => {
      state.successMessage = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // CHECK-IN
      .addCase(checkinAttendance.pending, (state) => {
        state.loading = true;
      })
      .addCase(checkinAttendance.fulfilled, (state) => {
        state.loading = false;
        state.successMessage = "Điểm danh vào thành công!";
      })
      .addCase(checkinAttendance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // CHECK-OUT
      .addCase(checkoutAttendance.fulfilled, (state) => {
        state.loading = false;
        state.successMessage = "Điểm danh ra thành công!";
      })
      .addCase(checkoutAttendance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      //  FETCH LIST (
      .addCase(fetchEventAttendances.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchEventAttendances.fulfilled, (state, action) => {
        state.loading = false;
        const { eventId, attendances } = action.payload;

        state.byEvent[eventId] = attendances;
      })
      .addCase(fetchEventAttendances.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // FEEDBACK
      .addCase(submitFeedback.fulfilled, (state) => {
        state.successMessage = "Cảm ơn bạn đã đánh giá!";
      })
      .addCase(submitFeedback.rejected, (state, action) => {
        state.error = action.payload;
      })
      // GET FEEDBACK
      .addCase(fetchEventFeedbacks.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchEventFeedbacks.fulfilled, (state, action) => {
        state.loading = false;
        state.reviews = action.payload;
      })
      .addCase(fetchEventFeedbacks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearAttendanceMessages, addFeedback } = attendanceSlice.actions;
export default attendanceSlice.reducer;
