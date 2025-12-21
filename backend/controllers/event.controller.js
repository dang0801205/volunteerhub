/** @format */

import asyncHandler from "express-async-handler";
import Event from "../models/eventModel.js";
import ApprovalRequest from "../models/approvalRequestModel.js";
import Registration from "../models/registrationModel.js";
import {
  emitNotification,
  emitToMultiple,
} from "../utils/notificationHelper.js";

// @desc    Get all APPROVED events (Public)
// @route   GET /api/events
const getEvents = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const filter = { status: "approved" };

  if (req.query.search) {
    filter.$or = [
      { title: { $regex: req.query.search, $options: "i" } },
      { description: { $regex: req.query.search, $options: "i" } },
    ];
  }
  if (req.query.tag) filter.tags = req.query.tag;
  if (req.query.minRating)
    filter.averageRating = { $gte: parseFloat(req.query.minRating) };

  let sortOption = { startDate: 1 };
  if (req.query.sort === "newest") sortOption = { createdAt: -1 };

  const events = await Event.find(filter)
    .sort(sortOption)
    .skip(skip)
    .limit(limit)
    .select("-__v")
    .populate("createdBy", "userName userEmail profilePicture phoneNumber");

  const total = await Event.countDocuments(filter);

  res.json({
    message: "Danh sách sự kiện",
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    data: events,
  });
});

export const getMyEvents = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const userId = req.user._id;
    const role = req.user.role;

    let query = { status: "approved" };

    if (role === "volunteer") {
      query.volunteers = userId;
    } else if (role === "manager") {
      query.managers = userId;
    } else if (role === "admin") {
    } else {
      return res.status(403).json({ message: "Role not supported" });
    }

    const events = await Event.find(query)
      .sort({ startDate: -1 })
      .populate("managers", "userName avatar")
      .populate("volunteers", "userName avatar")
      .populate("channel");

    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({
      message: "Server error",
    });
  }
};

// @desc    Get event by ID (Public nếu approved)
// @route   GET /api/events/:id
const getEventById = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.eventId)
    .populate("createdBy", "userName userEmail profilePicture phoneNumber")
    .select("-__v");

  if (!event) {
    res.status(404);
    throw new Error("Sự kiện không tồn tại");
  }
  res.json(event);
});

// @desc    Manager tạo sự kiện
// @route   POST /api/events
const createEvent = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    location,
    startDate,
    endDate,
    maxParticipants,
    tags,
    image,
  } = req.body;

  if (!title || !startDate || !endDate || !location || !maxParticipants) {
    res.status(400);
    throw new Error("Vui lòng điền đầy đủ thông tin");
  }

  const event = await Event.create({
    title,
    description,
    location,
    startDate,
    endDate,
    maxParticipants,
    tags,
    image,
    createdBy: req.user._id,
    status: "pending",
  });

  const approvalRequest = await ApprovalRequest.create({
    event: event._id,
    requestedBy: req.user._id,
    type: "event_approval",
  });

  event.approvalRequest = approvalRequest._id;
  await event.save();
  emitNotification(req, "admin", {
    title: "Sự kiện mới chờ duyệt",
    message: `Manager ${req.user.userName} vừa tạo sự kiện "${title}"`,
    type: "warning",
    link: `/admin/dashboard?tab=events_management&action=view&highlight=${event._id}`,
  });

  res.status(201).json({ message: "Tạo sự kiện thành công", data: event });
});
// @desc    Update event
// @route   PUT /api/events/:eventId
const updateEvent = asyncHandler(async (req, res) => {
  const { eventId } = req.params;

  const event = await Event.findById(eventId);
  if (!event) {
    res.status(404);
    throw new Error("Không tìm thấy sự kiện");
  }

  if (
    ["cancelled", "rejected", "cancel_pending"].includes(event.status) &&
    !isAdmin
  ) {
    res.status(400);
    throw new Error(
      `Không thể chỉnh sửa sự kiện đang ở trạng thái: ${event.status}`
    );
  }

  const allowedUpdates = [
    "title",
    "description",
    "location",
    "coordinate",
    "startDate",
    "endDate",
    "maxParticipants",
    "tags",
    "image",
  ];

  const updates = {};
  Object.keys(req.body).forEach((key) => {
    if (allowedUpdates.includes(key)) {
      updates[key] = req.body[key];
    }
  });

  if (
    updates.maxParticipants &&
    updates.maxParticipants < event.registeredCount
  ) {
    res.status(400);
    throw new Error(
      `Số lượng tối đa (${updates.maxParticipants}) không thể nhỏ hơn số người đã đăng ký hiện tại (${event.registeredCount})`
    );
  }

  const updatedEvent = await Event.findByIdAndUpdate(eventId, updates, {
    new: true,
    runValidators: true,
  });

  if (event.status === "approved") {
    try {
      const participants = await Registration.find({
        eventId: event._id,
        status: { $in: ["registered", "approved"] },
      }).populate("userId", "email userName");
    } catch (error) {
      console.error("Lỗi gửi thông báo:", error);
    }
  }
  res.json({ message: "Cập nhật thành công", data: updatedEvent });
});

// @desc    Admin duyệt/hủy sự kiện
// @route   PATCH /api/events/:eventId/approve
const approveEvent = asyncHandler(async (req, res) => {
  const { status, adminNote } = req.body;
  const event = await Event.findById(req.params.eventId);

  if (!event) {
    res.status(404);
    throw new Error(`Sự kiện không tồn tại (ID: ${req.params.eventId})`);
  }

  if (!["approved", "rejected"].includes(status)) {
    res.status(400);
    throw new Error("Trạng thái không hợp lệ");
  }

  event.status = status;
  await event.save();

  await ApprovalRequest.findOneAndUpdate(
    { event: event._id, status: "pending" },
    {
      status: status,
      adminNote: adminNote,
      reviewedBy: req.user._id,
      reviewedAt: new Date(),
    }
  );
  emitNotification(req, event.createdBy.toString(), {
    title:
      status === "approved" ? "Sự kiện đã được duyệt" : "Sự kiện bị từ chối",
    message:
      status === "approved"
        ? `Sự kiện "${event.title}" đã được đăng công khai.`
        : `Sự kiện "${event.title}" không được duyệt. Lý do: ${adminNote}`,
    type: status === "approved" ? "success" : "danger",
    link: "/dashboard?tab=events",
  });

  res.json({ message: `Sự kiện đã được ${status}`, data: event });
});

// @desc    Manager yêu cầu hủy / Admin hủy cưỡng chế
// @route   PUT /api/events/:eventId/cancel
const cancelEvent = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  const eventId = req.params.eventId;

  const event = await Event.findById(eventId);
  if (!event) {
    res.status(404);
    throw new Error("Không tìm thấy sự kiện");
  }

  const isOwner = event.createdBy.toString() === req.user._id.toString();
  const isAdmin = req.user.role === "admin";

  if (!isOwner && !isAdmin) {
    res.status(403);
    throw new Error("Bạn không có quyền hủy sự kiện này.");
  }

  if (isAdmin) {
    event.status = "cancelled";
    event.cancellationReason = reason || "Admin hủy trực tiếp.";
    event.cancelledBy = req.user._id;
    await event.save();
    await Registration.updateMany(
      {
        eventId: eventId,
        status: { $in: ["pending", "registered", "waitlisted"] },
      },
      { status: "event_cancelled" }
    );

    await ApprovalRequest.findOneAndUpdate(
      { event: eventId, type: "event_cancellation", status: "pending" },
      { status: "approved", adminNote: "Đã thực hiện hủy trực tiếp bởi Admin." }
    );

    const registrations = await Registration.find({ eventId }).select("userId");
    const volunteerIds = registrations.map((r) => r.userId.toString());

    emitToMultiple(req, volunteerIds, {
      title: "Sự kiện đã bị HỦY",
      message: `Rất tiếc, sự kiện "${event.title}" đã bị hủy. Vui lòng kiểm tra lại lịch trình.`,
      type: "danger",
      link: "/history",
    });

    emitToMultiple(req, volunteerIds, {
      title: "Sự kiện đã bị HỦY",
      message: `Rất tiếc, sự kiện "${event.title}" đã bị hủy. Vui lòng kiểm tra lại lịch trình.`,
      type: "danger",
      link: "/history",
    });

    return res.json({
      message: "Đã hủy sự kiện thành công (Admin Action).",
      data: event,
    });
  }

  if (isOwner) {
    const existingRequest = await ApprovalRequest.findOne({
      event: eventId,
      type: "event_cancellation",
      status: "pending",
    });

    if (existingRequest) {
      res.status(400);
      throw new Error("Bạn đã gửi yêu cầu hủy cho sự kiện này rồi.");
    }

    await ApprovalRequest.create({
      type: "event_cancellation",
      event: eventId,
      requestedBy: req.user._id,
      reason: reason || "Manager yêu cầu hủy sự kiện.",
      status: "pending",
    });

    event.status = "cancel_pending";
    await event.save();

    emitNotification(req, "admin", {
      title: "Yêu cầu HỦY sự kiện",
      message: `Manager ${req.user.userName} muốn hủy sự kiện "${event.title}"`,
      type: "danger",
      link: `/admin/dashboard?tab=events_management&action=review_cancel&highlight=${eventId}`,
    });

    return res.json({
      message: "Đã gửi yêu cầu hủy sự kiện. Vui lòng chờ Admin duyệt.",
      data: event,
    });
  }
});

// @desc    Lấy danh sách đăng ký
// @route   GET /api/events/:eventId/registrations
const getEventRegistrations = asyncHandler(async (req, res) => {
  const registrations = await Registration.find({ eventId: req.params.eventId })
    .populate("userId", "userName userEmail profilePicture phoneNumber")
    .sort({ createdAt: -1 });

  const formatted = registrations.map((reg) => ({
    ...reg.toObject(),
    volunteer: reg.userId,
    user: reg.userId,
  }));

  res.json(formatted);
});

// @desc    Lấy danh sách quản lý (Admin View)
// @route   GET /api/events/management
const getAllEvents = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.search) {
    filter.$or = [
      { title: { $regex: req.query.search, $options: "i" } },
      { location: { $regex: req.query.search, $options: "i" } },
    ];
  }

  const events = await Event.find(filter)
    .sort({ createdAt: -1 })
    .populate("createdBy", "userName userEmail");

  res.json({
    message: "Success",
    data: events,
    pagination: { page: 1, limit: 100, total: events.length },
  });
});

// @desc    Xóa sự kiện
// @route   DELETE /api/events/:eventId
const deleteEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.eventId);

  if (!event) {
    res.status(404);
    throw new Error("Không tìm thấy sự kiện");
  }

  await ApprovalRequest.deleteMany({ event: event._id });
  await Registration.deleteMany({ eventId: event._id });
  await Event.findByIdAndDelete(event._id);

  res.json({ message: "Đã xóa sự kiện thành công" });
});

export {
  getEvents,
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  approveEvent,
  getEventRegistrations,
  cancelEvent,
};
