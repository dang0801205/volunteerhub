/** @format */

import { configureStore } from "@reduxjs/toolkit";
import eventReducer from "../features/eventSlice";
import userReducer from "../features/userSlice";
import registrationReducer from "../features/registrationSlice";
import authReducer from "../features/authSlice";
import approvalReducer from "../features/approvalSlice";
import channelReducer from "../features/channelSlice";
import attendanceReducer from "../features/attendanceSlice";
import recommendationReducer from "../features/recommendationSlice";

export const store = configureStore({
  reducer: {
    event: eventReducer,
    user: userReducer,
    registration: registrationReducer,
    auth: authReducer,
    approval: approvalReducer,
    channel: channelReducer,
    attendance: attendanceReducer,
    recommendations: recommendationReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
  devTools: import.meta.env.DEV,
});

export default store;
