/** @format */

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api";

// =============================================
// 1. PUBLIC: Lấy danh sách sự kiện
export const fetchEvents = createAsyncThunk(
  "event/fetchAll",
  async (
    {
      page = 1,
      limit = 1000,
      search = "",
      tag = "",
      status = "approved",
      sort = "upcoming",
      minRating = 0,
    } = {},
    { rejectWithValue }
  ) => {
    try {
      const { data } = await api.get("/api/events", {
        params: { page, limit, search, tag, status, sort, minRating },
      });
      return data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Lỗi tải danh sách sự kiện"
      );
    }
  }
);

// 1b. MANAGER/ADMIN: Lấy danh sách sự kiện quản lý
export const fetchManagementEvents = createAsyncThunk(
  "event/fetchManagement",
  async (
    { page = 1, limit = 10, search = "", status = "" } = {},
    { rejectWithValue }
  ) => {
    try {
      const { data } = await api.get("/api/events/management", {
        params: { page, limit, search, status },
      });
      return data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Lỗi tải danh sách quản lý"
      );
    }
  }
);

// 1c. VOLUNTEER / MANAGER: Lấy danh sách event mình tham gia (approved)
export const fetchMyEvents = createAsyncThunk(
  "event/fetchMyEvents",
  async ({ page = 1, limit = 10 } = {}, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/api/events/me", {
        params: { page, limit },
      });

      return data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Lỗi tải sự kiện của tôi"
      );
    }
  }
);

// 2. Lấy chi tiết 1 sự kiện (public nếu approved, private nếu pending + có quyền)
export const fetchEventById = createAsyncThunk(
  "event/fetchById",
  async (eventId, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/api/events/${eventId}`);
      return data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Không tìm thấy sự kiện"
      );
    }
  }
);

// 3. Manager: Tạo sự kiện mới
export const createEvent = createAsyncThunk(
  "event/create",
  async (eventData, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/api/events", eventData);
      return data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Tạo sự kiện thất bại"
      );
    }
  }
);

// 4. Manager: Cập nhật sự kiện
export const updateEvent = createAsyncThunk(
  "event/update",
  async ({ eventId, eventData }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/api/events/${eventId}`, eventData);
      return data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Cập nhật thất bại"
      );
    }
  }
);

// 5. Admin: Duyệt / Từ chối sự kiện
export const approveEvent = createAsyncThunk(
  "event/approve",
  async ({ eventId, status, adminNote = "" }, { rejectWithValue }) => {
    try {
      const { data } = await api.patch(`/api/events/${eventId}/approve`, {
        status,
        adminNote,
      });
      return data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Duyệt sự kiện thất bại"
      );
    }
  }
);

// 6. Lấy danh sách đăng ký của sự kiện
export const fetchEventRegistrations = createAsyncThunk(
  "event/fetchRegistrations",
  async (eventId, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/api/events/${eventId}/registrations`);
      return data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Lỗi tải danh sách đăng ký"
      );
    }
  }
);

// 7. Xóa sự kiện
export const deleteEvent = createAsyncThunk(
  "event/deleteEvent",
  async (eventId, { rejectWithValue }) => {
    try {
      await api.delete(`/api/events/${eventId}`);
      return eventId;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Xóa thất bại");
    }
  }
);

// 8. ADMIN: Hủy sự kiện (Force Cancel)
export const cancelEvent = createAsyncThunk(
  "event/cancel",
  async ({ eventId, reason }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/api/events/${eventId}/cancel`, {
        reason,
      });
      return data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Hủy sự kiện thất bại"
      );
    }
  }
);

// 9. MANAGER: Yêu cầu hủy sự kiện
export const requestCancelEvent = createAsyncThunk(
  "event/requestCancel",
  async ({ eventId, reason }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/api/events/${eventId}/cancel`, {
        reason,
      });
      return data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Gửi yêu cầu hủy thất bại"
      );
    }
  }
);

// =============================================
// Slice
const eventSlice = createSlice({
  name: "event",
  initialState: {
    list: [],
    myEvents: [], // event user tham gia
    pagination: {
      page: 1,
      limit: 1000,
      total: 0,
      pages: 0,
    },

    filters: {
      search: "",
      tag: "",
      status: "approved",
      sort: "upcoming",
      minRating: 0,
      page: 1,
    },
    loading: false,
    error: null,
    current: null,
    currentLoading: false,
    registrations: [],
    registrationsLoading: false,
    successMessage: null,
  },

  reducers: {
    clearEventMessages: (state) => {
      state.successMessage = null;
      state.error = null;
    },
    clearCurrentEvent: (state) => {
      state.current = null;
    },
    clearEventError: (state) => {
      state.error = null;
    },
    clearRegistrations: (state) => {
      state.registrations = [];
      state.registrationsLoading = false;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = {
        search: "",
        tag: "",
        status: "approved",
        sort: "upcoming",
        minRating: 0,
        page: 1,
      };
    },
  },

  extraReducers: (builder) => {
    // === FETCH ALL ===
    builder
      .addCase(fetchEvents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEvents.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchEvents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // === FETCH MY EVENTS (VOLUNTEER / MANAGER) ===
    builder
      .addCase(fetchMyEvents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyEvents.fulfilled, (state, action) => {
        state.loading = false;

        // ghi vào myEvents, KHÔNG phải list
        state.myEvents = action.payload.data || action.payload;
      })
      .addCase(fetchMyEvents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // === FETCH MANAGEMENT EVENTS ===
    builder
      .addCase(fetchManagementEvents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchManagementEvents.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchManagementEvents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // === FETCH BY ID ===
    builder
      .addCase(fetchEventById.pending, (state) => {
        state.currentLoading = true;
        state.error = null;
      })
      .addCase(fetchEventById.fulfilled, (state, action) => {
        state.currentLoading = false;
        state.current = action.payload;
      })
      .addCase(fetchEventById.rejected, (state, action) => {
        state.currentLoading = false;
        state.error = action.payload;
      });

    // === CREATE ===
    builder
      .addCase(createEvent.fulfilled, (state) => {
        state.successMessage = "Tạo sự kiện thành công! Đang chờ duyệt.";
      })
      .addCase(createEvent.rejected, (state, action) => {
        state.error = action.payload;
      });

    // === UPDATE ===
    builder
      .addCase(updateEvent.fulfilled, (state, action) => {
        state.successMessage = "Cập nhật sự kiện thành công!";
        if (state.current?._id === action.payload._id)
          state.current = action.payload;
        state.list = state.list.map((e) =>
          e._id === action.payload._id ? action.payload : e
        );
      })
      .addCase(updateEvent.rejected, (state, action) => {
        state.error = action.payload;
      });

    // === APPROVE / REJECT ===
    builder
      .addCase(approveEvent.fulfilled, (state, action) => {
        const updatedEvent = action.payload;
        state.successMessage =
          updatedEvent.status === "approved"
            ? "Sự kiện đã được duyệt!"
            : "Đã từ chối sự kiện.";
        state.list = state.list.map((e) =>
          e._id === updatedEvent._id ? updatedEvent : e
        );
        if (state.current?._id === updatedEvent._id)
          state.current = updatedEvent;
      })
      .addCase(approveEvent.rejected, (state, action) => {
        state.error = action.payload;
      });

    // === REGISTRATIONS ===
    builder
      .addCase(fetchEventRegistrations.pending, (state) => {
        state.registrationsLoading = true;
      })
      .addCase(fetchEventRegistrations.fulfilled, (state, action) => {
        state.registrationsLoading = false;
        state.registrations = action.payload;
      })
      .addCase(fetchEventRegistrations.rejected, (state, action) => {
        state.registrationsLoading = false;
        state.error = action.payload;
        state.registrations = [];
      });

    // === DELETE ===
    builder
      .addCase(deleteEvent.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteEvent.fulfilled, (state, action) => {
        state.loading = false;
        state.list = state.list.filter((event) => event._id !== action.payload);
        if (state.current?._id === action.payload) state.current = null;
        state.successMessage = "Đã xóa sự kiện thành công!";
      })
      .addCase(deleteEvent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // === CANCEL (ADMIN) ===
    builder
      .addCase(cancelEvent.pending, (state) => {
        state.loading = true;
      })
      .addCase(cancelEvent.fulfilled, (state, action) => {
        state.loading = false;
        const cancelledEvent = action.payload;
        state.successMessage = "Đã hủy sự kiện thành công!";

        state.list = state.list.map((e) =>
          e._id === cancelledEvent._id ? cancelledEvent : e
        );
        if (state.current?._id === cancelledEvent._id)
          state.current = cancelledEvent;
      })
      .addCase(cancelEvent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // === REQUEST CANCEL (MANAGER) ===
    builder
      .addCase(requestCancelEvent.pending, (state) => {
        state.loading = true;
      })
      .addCase(requestCancelEvent.fulfilled, (state, action) => {
        state.loading = false;
        const updatedEvent = action.payload;
        state.successMessage = "Đã gửi yêu cầu hủy thành công!";

        state.list = state.list.map((e) =>
          e._id === updatedEvent._id ? updatedEvent : e
        );
      })
      .addCase(requestCancelEvent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearEventMessages,
  clearCurrentEvent,
  clearEventError,
  clearRegistrations,
  setFilters,
  resetFilters,
} = eventSlice.actions;

export default eventSlice.reducer;
