/** @format */

import express from "express";
const router = express.Router();
import {
  getMyRecommendations,
  getSimilarEventsController,
} from "../controllers/recommendation.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

// Protected routes - require authentication
router.get("/", protect, getMyRecommendations);
router.get("/similar/:eventId", getSimilarEventsController);

export default router;
