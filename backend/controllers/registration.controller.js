/** @format */

import asyncHandler from "express-async-handler";
import Registration from "../models/registrationModel.js";
import Event from "../models/eventModel.js";
import Attendance from "../models/attendanceModel.js";
import {
  emitNotification,
  emitToMultiple,
} from "../utils/notificationHelper.js";
import { pushToUsers } from "../utils/pushHelper.js";
import { REGISTRATION_STATUS, EVENT_STATUS } from "../config/typeEnum.js";

// @desc    Đăng ký tham gia sự kiện (Mặc định là WAITLISTED - Chờ duyệt)
// @route   POST /api/registrations
// @access  Private (Volunteer)
const registerForEvent = asyncHandler(async (req, res) => {
  const { eventId } = req.body;

  const event = await Event.findById(eventId);
  if (!event || event.status !== EVENT_STATUS.APPROVED) {
    res.status(400);
    throw new Error("Sự kiện không tồn tại hoặc chưa được duyệt");
  }

  const existingReg = await Registration.findOne({
    userId: req.user._id,
    eventId,
  });

  if (existingReg) {
    if (existingReg.status === REGISTRATION_STATUS.CANCELLED) {
      existingReg.status = REGISTRATION_STATUS.WAITLISTED;
      await existingReg.save();

      return res.status(200).json({
        message: "Đăng ký lại thành công! Vui lòng chờ duyệt.",
        data: existingReg,
      });
    }

    res.status(400);
    throw new Error("Bạn đã đăng ký sự kiện này rồi.");
  }

  const registration = await Registration.create({
    userId: req.user._id,
    eventId,
    status: REGISTRATION_STATUS.WAITLISTED,
  });

  emitNotification(req, event.createdBy.toString(), {
    title: "Đăng ký mới",
    message: `Có tình nguyện viên mới vừa đăng ký tham gia sự kiện "${event.title}".`,
    type: "info",
    link: `/dashboard?tab=registrations&highlight=${registration._id}`,
  });
  res.status(201).json({
    message: "Đăng ký thành công, vui lòng chờ duyệt",
    data: registration,
  });
});

// @desc    Hủy đăng ký (User tự hủy)
// @route   DELETE /api/registrations/:id
// @access  Private (Owner/Manager)
const cancelRegistration = asyncHandler(async (req, res) => {
  const registration = await Registration.findById(req.params.id);

  if (!registration) {
    res.status(404);
    throw new Error("Không tìm thấy đăng ký");
  }

  if (
    registration.userId.toString() !== req.user._id.toString() &&
    req.user.role !== "manager" &&
    req.user.role !== "admin"
  ) {
    res.status(403);
    throw new Error("Không có quyền thực hiện hành động này");
  }

  if (registration.status === REGISTRATION_STATUS.CANCELLED) {
    return res
      .status(400)
      .json({ message: "Đơn đăng ký này đã bị hủy trước đó." });
  }

  const event = await Event.findById(registration.eventId);

  if (registration.status === REGISTRATION_STATUS.REGISTERED && event) {
    event.currentParticipants = Math.max(0, event.currentParticipants - 1);
    await event.save();
  }

  registration.status = REGISTRATION_STATUS.CANCELLED;
  await registration.save();

  res.json({ message: "Hủy đăng ký thành công" });
});

// @desc    Lấy danh sách đăng ký của tôi
// @route   GET /api/registrations/my-registrations
// @access  Private
const getMyRegistrations = asyncHandler(async (req, res) => {
  const registrations = await Registration.find({ userId: req.user._id })
    .populate("eventId")
    .sort({ createdAt: -1 });

  const regIds = registrations.map((r) => r._id);

  const attendances = await Attendance.find({
    regId: { $in: regIds },
  });

  const attendanceMap = {};
  attendances.forEach((att) => {
    attendanceMap[att.regId.toString()] = att;
  });

  const result = registrations.map((reg) => {
    const att = attendanceMap[reg._id.toString()];

    return {
      ...reg.toObject(),
      attendanceStatus: att?.status || null,
    };
  });

  res.status(200).json({
    success: true,
    data: result,
  });
});

const getMyQRCode = asyncHandler(async (req, res) => {
  const { eventId } = req.params;

  const registration = await Registration.findOne({
    eventId,
    userId: req.user._id,
    status: "registered",
  });

  if (!registration || !registration.qrToken) {
    return res.status(404).json({ message: "Chưa có QR" });
  }

  res.json({
    qrToken: registration.qrToken,
  });
});

export const checkOutByQr = async (req, res) => {
  try {
    const { qrToken } = req.body;
    const userId = req.user._id;

    if (!qrToken) {
      return res.status(400).json({
        message: "Thiếu qrToken",
      });
    }

    const registration = await Registration.findOne({ qrToken });

    if (!registration) {
      return res.status(404).json({
        message: "QR không hợp lệ hoặc không tồn tại",
      });
    }

    const event = await Event.findById(registration.eventId);

    if (!event) {
      return res.status(404).json({
        message: "Không tìm thấy sự kiện",
      });
    }

    const isManager = event.managers.some(
      (managerId) => managerId.toString() === userId.toString()
    );

    if (!isManager) {
      return res.status(403).json({
        message: "Bạn không có quyền check-out cho sự kiện này",
      });
    }

    const attendance = await Attendance.findOne({
      regId: registration._id,
    });

    if (!attendance) {
      return res.status(404).json({
        message: "Trạng thái tham gia không tồn tại",
      });
    }

    console.log("ATTENDANCE FOUND:", attendance._id);

    if (attendance.checkOut) {
      return res.status(400).json({
        message: "Người dùng đã check-out trước đó",
      });
    }

    attendance.checkOut = new Date();
    attendance.status = "completed";
    await attendance.save();

    await attendance.populate({
      path: "regId",
      populate: [
        { path: "userId", select: "name email" },
        { path: "eventId", select: "title" },
      ],
    });

    console.log("CHECK-OUT SUCCESS");
    return res.json({
      message: "Check-out thành công",
      data: {
        user: attendance.regId.userId,
        event: attendance.regId.eventId,
        checkOut: attendance.checkOut,
      },
    });
  } catch (error) {
    console.error("CHECK-OUT ERROR:", error);
    return res.status(500).json({
      message: "Lỗi server khi check-out",
    });
  }
};

// @desc    Lấy TOÀN BỘ danh sách đăng ký cho Admin (thay vì chỉ pending)
// @route   GET /api/registrations/admin/all
// @access  Private (Manager/Admin)
const getAllRegistrationsForManagement = asyncHandler(async (req, res) => {
  const registrations = await Registration.find({})
    .populate({
      path: "userId",
      select: "userName userEmail profilePicture phoneNumber",
    })
    .populate({
      path: "eventId",
      select: "title startDate endDate",
    })
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: registrations,
  });
});

// @desc    Manager duyệt đơn đăng ký
// @route   PUT /api/registrations/:id/accept
// @access  Private (Manager/Admin)
const acceptRegistration = asyncHandler(async (req, res) => {
  const registration = await Registration.findById(req.params.id);

  if (!registration) {
    res.status(404);
    throw new Error("Không tìm thấy đơn đăng ký");
  }

  const event = await Event.findById(registration.eventId);
  if (!event) {
    res.status(404);
    throw new Error("Sự kiện không tồn tại");
  }

  if (
    event.createdBy.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    res.status(403);
    throw new Error("Bạn không có quyền duyệt đơn cho sự kiện này");
  }

  if (event.currentParticipants >= event.maxParticipants) {
    res.status(400);
    throw new Error("Sự kiện đã đủ người tham gia, không thể duyệt thêm.");
  }

  if (registration.status !== REGISTRATION_STATUS.REGISTERED) {
    registration.status = REGISTRATION_STATUS.REGISTERED;
    await registration.save();

    const userIdStr = registration.userId.toString();
    const volunteerIds = event.volunteers.map((v) => v.toString());

    if (!volunteerIds.includes(userIdStr)) {
      event.volunteers.push(registration.userId);
    }

    await event.save();

    event.currentParticipants += 1;
    await event.save();

    await Attendance.create({
      regId: registration._id,
      status: "in-progress",
    });
    await pushToUsers({
      userIds: [registration.userId],
      title: "🎉 Đăng ký được duyệt",
      body: `Bạn đã được chấp nhận tham gia sự kiện "${event.title}". Hẹn gặp bạn nhé!`,
      data: {
        type: "EVENT_APPROVED",
        eventId: event._id,
      },
    });

    emitNotification(req, registration.userId.toString(), {
      title: "Kết quả đăng ký sự kiện",
      message:
        registration.status === "registered"
          ? `Chúc mừng! Bạn đã được duyệt tham gia sự kiện "${event.title}".`
          : `Yêu cầu tham gia sự kiện "${event.title}" của bạn đã bị từ chối.`,
      type: registration.status === "registered" ? "success" : "danger",
      link: "/history",
    });
    res.json({
      message: "Đã duyệt đơn đăng ký",
      data: registration,
    });
  }
});

// @desc    Manager từ chối đơn đăng ký (Kick User)
// @route   PUT /api/registrations/:id/reject
// @access  Private (Manager/Admin)
const rejectRegistration = asyncHandler(async (req, res) => {
  const registration = await Registration.findById(req.params.id);

  if (!registration) {
    res.status(404);
    throw new Error("Không tìm thấy đơn đăng ký");
  }

  const event = await Event.findById(registration.eventId);

  if (
    event &&
    event.createdBy.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    res.status(403);
    throw new Error("Bạn không có quyền từ chối đơn này");
  }

  if (registration.status === REGISTRATION_STATUS.REGISTERED && event) {
    event.currentParticipants = Math.max(0, event.currentParticipants - 1);
    await event.save();
  }
  registration.status = REGISTRATION_STATUS.CANCELLED;
  await registration.save();
  emitNotification(req, registration.userId.toString(), {
    title: "Kết quả đăng ký sự kiện",
    message:
      registration.status === "registered"
        ? `Chúc mừng! Bạn đã được duyệt tham gia sự kiện "${event.title}".`
        : `Yêu cầu tham gia sự kiện "${event.title}" của bạn đã bị từ chối.`,
    type: registration.status === "registered" ? "success" : "danger",
    link: "/history",
  });

  res.json({
    message: "Đã từ chối đơn đăng ký",
    data: registration,
  });
});

export {
  registerForEvent,
  cancelRegistration,
  getMyRegistrations,
  getMyQRCode,
  getAllRegistrationsForManagement,
  acceptRegistration,
  rejectRegistration,
};
