/** @format */

import mongoose from "mongoose";
import dotenv from "dotenv";
import Event from "../models/eventModel.js";
import ApprovalRequest from "../models/approvalRequestModel.js";
import User from "../models/userModel.js";
import connectDB from "../config/mongodb.js";

dotenv.config();
connectDB();

/* ======================
   SEED APPROVAL REQUEST
====================== */
const seedApprovalRequests = async () => {
  try {
    console.log("🚀 Seeding approval requests...");

    // 1️⃣ Lấy tất cả event cần duyệt
    const events = await Event.find({
      status: { $in: ["pending", "cancel_pending"] },
    }).populate("managers");

    let createdCount = 0;

    for (const event of events) {
      // 2️⃣ Kiểm tra đã có approvalRequest chưa
      const existed = await ApprovalRequest.findOne({
        event: event._id,
        status: "pending",
      });

      if (existed) {
        console.log(`⚠️ ApprovalRequest already exists for event: ${event.title}`);
        continue;
      }

      // 3️⃣ Lọc managers hợp lệ
      const validManagers = event.managers.filter(
        (m) => m && m.role === "manager"
      );

      if (validManagers.length === 0) {
        console.log(`❌ Event "${event.title}" has no valid manager`);
        continue;
      }

      // 4️⃣ Chọn ngẫu nhiên 1 manager
      const requestedBy =
        validManagers[Math.floor(Math.random() * validManagers.length)]._id;

      // 5️⃣ Xác định loại request
      let type = "event_approval";
      let reason = undefined;

      if (event.status === "cancel_pending") {
        type = "event_cancellation";
        reason = event.cancellationReason || "Yêu cầu hủy sự kiện";
      }

      // 6️⃣ Tạo ApprovalRequest
      await ApprovalRequest.create({
        type,
        event: event._id,
        requestedBy,
        status: "pending",
        reason,
      });

      createdCount++;
      console.log(`✅ Created ${type} for event: ${event.title}`);
    }

    console.log(`🎉 Done! Created ${createdCount} approval requests`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeder error:", error);
    process.exit(1);
  }
};

/* ======================
   RUN
====================== */
await connectDB();
await seedApprovalRequests();
