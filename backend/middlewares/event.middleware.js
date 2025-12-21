/** @format */
import asyncHandler from "express-async-handler";
import Event from "../models/eventModel.js";

const canModifyEvent = asyncHandler(async (req, res, next) => {
  const { eventId } = req.params;

  if (!eventId) {
    res.status(400);
    throw new Error("Missing Event ID in Route Parameters");
  }

  const event = await Event.findById(eventId);
  if (!event) {
    res.status(404);
    throw new Error("Sự kiện không tồn tại");
  }

  const isOwner = event.createdBy.toString() === req.user._id.toString();
  const isAdmin = req.user.role === "admin";

  if (!isOwner && !isAdmin) {
    res.status(403);
    throw new Error("Bạn không có quyền chỉnh sửa sự kiện này");
  }

  if (event.status === "approved" && !isAdmin) {
    res.status(400);
    throw new Error("Sự kiện đã duyệt, Manager không thể chỉnh sửa");
  }

  req.event = event;
  next();
});

export { canModifyEvent };
