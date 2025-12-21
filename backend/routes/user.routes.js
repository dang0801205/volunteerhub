/** @format */

import express from "express";
import { uploadPicture } from "../config/cloudinarystorage.js";

import {
  protect,
  allowAdminOnly,
  allowAdminOrManager,
} from "../middlewares/auth.middleware.js";

import {
  updateUserProfile,
  getAllUsers,
  deleteUser,
  getUserById,
  updateUserRole,
  changeUserPassword,
  getUserProfile,
  updateUserStatus,
  requestManagerRole,
  getSuggestedManagers,
} from "../controllers/user.controller.js";
const router = express.Router();

// @route  GET /api/users/suggested-managers
router.get(
  "/suggested-managers",
  protect,
  allowAdminOnly,
  getSuggestedManagers
);

// @route  POST /api/users/request-manager
router.route("/request-manager").post(protect, requestManagerRole);

// @route  GET/PUT /api/users/profile
router
  .route("/profile")
  .get(protect, getUserProfile)
  .put(protect, uploadPicture, updateUserProfile);

// @route  PUT /api/users/profile/change-password
router.put("/profile/change-password", protect, changeUserPassword);

// @route  GET /api/users/
router.get("/", protect, allowAdminOrManager, getAllUsers);

// @route  GET /api/users/:id
// @route  DELETE /api/users/:id
router
  .route("/:id")
  .get(protect, allowAdminOrManager, getUserById)
  .delete(protect, allowAdminOrManager, deleteUser);

// @route  PUT /api/users/:id/role
router.put("/:id/role", protect, allowAdminOnly, updateUserRole);

// @route   PUT /api/users/:id/status
router.put("/:id/status", protect, allowAdminOrManager, updateUserStatus);

export default router;
