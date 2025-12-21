/** @format */

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api";

export const fetchChannelByEventId = createAsyncThunk(
  "channel/fetchByEventId",
  async (eventId, { rejectWithValue }) => {
    try {
      const res = await api.get(`/api/channel/event/${eventId}`);

      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Không thể tải kênh thảo luận"
      );
    }
  }
);

const channelSlice = createSlice({
  name: "channel",
  initialState: {
    current: null,
    loading: false,
    error: null,
  },

  reducers: {
    clearChannel: (state) => {
      state.current = null;
      state.loading = false;
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchChannelByEventId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchChannelByEventId.fulfilled, (state, action) => {
        state.loading = false;
        state.current = action.payload;
      })
      .addCase(fetchChannelByEventId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

/* ======================================================
   EXPORTS
====================================================== */

export const { clearChannel } = channelSlice.actions;

export const createPost = createAsyncThunk(
  "channel/createPost",
  async ({ channelId, content, attachment }, { rejectWithValue }) => {
    try {
      const formData = new FormData();

      formData.append("channel", channelId);
      formData.append("content", content);

      if (attachment) {
        formData.append("picture", attachment.fileObject);
        formData.append("pictureType", attachment.type);
      }

      console.log("🟠 Sending request to /api/post");

      const { data } = await api.post("/api/post", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Tạo bài viết thất bại"
      );
    }
  }
);

export const createComment = createAsyncThunk(
  "channel/createComment",
  async ({ postId, parentCommentId, content }, { rejectWithValue }) => {
    try {
      const payload = { content };

      if (postId) {
        payload.post = postId;
      }

      if (parentCommentId) {
        payload.parentComment = parentCommentId;
      }

      const { data } = await api.post("/api/comment", payload);

      return data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Tạo bình luận thất bại"
      );
    }
  }
);

export const togglePostReaction = createAsyncThunk(
  "channel/toggleReaction",
  async ({ postId, type = "like" }, { rejectWithValue }) => {
    try {
      const { data } = await api.post(`/api/reaction`, {
        post: postId,
        type,
      });
      return data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Reaction thất bại"
      );
    }
  }
);

export const toggleCommentReaction = createAsyncThunk(
  "channel/toggleReaction",
  async ({ commentId, type = "like" }, { rejectWithValue }) => {
    try {
      const { data } = await api.post(`/api/reaction`, {
        comment: commentId,
        type,
      });
      return data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Reaction thất bại"
      );
    }
  }
);

export default channelSlice.reducer;
