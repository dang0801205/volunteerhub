/** @format */

import PushSubscription from "../models/pushSubscriptionModel.js";
import webpush from "web-push";

// @desc    Lưu hoặc cập nhật thông tin đăng ký nhận thông báo (Subscription Token)
// @access  Private
export const saveSubscription = async (req, res) => {
  try {
    const { subscription } = req.body;
    const userId = req.user?._id;

    if (!subscription || !subscription.endpoint) {
      return res.status(400).json({ message: "Invalid subscription" });
    }

    const { endpoint, keys } = subscription;

    let existing = await PushSubscription.findOne({ endpoint });

    if (existing) {
      existing.userId = userId;
      existing.keys = keys;
      existing.userAgent = req.headers["user-agent"];
      await existing.save();

      return res.json({
        message: "Subscription updated",
        data: existing,
      });
    }

    const newSub = await PushSubscription.create({
      userId,
      endpoint,
      keys,
      userAgent: req.headers["user-agent"],
    });

    res.json({
      message: "Subscription saved",
      data: newSub,
    });
  } catch (error) {
    console.error("SAVE SUB ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Hủy đăng ký và xóa thông tin nhận thông báo
// @access  Private
export const deleteSubscription = async (req, res) => {
  try {
    const { endpoint } = req.body;

    if (!endpoint) {
      return res.status(400).json({ message: "Missing endpoint" });
    }

    await PushSubscription.deleteOne({ endpoint });

    res.json({ message: "Subscription removed" });
  } catch (error) {
    console.error("DELETE SUB ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Gửi thông báo đẩy (Push Notification) trực tiếp cho một người dùng cụ thể
// @access  Private (Admin/System)
export const sendNotificationToUser = async (req, res) => {
  try {
    const { userId, title, body } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "Missing userId" });
    }

    const subs = await PushSubscription.find({ userId });

    if (!subs.length) {
      return res.status(404).json({ message: "User has no subscriptions" });
    }

    const payload = JSON.stringify({ title, body });

    let success = 0;
    let failed = 0;

    for (const sub of subs) {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: sub.keys,
          },
          payload
        );
        success++;
      } catch (err) {
        failed++;

        console.error("PUSH ERROR:", err.statusCode, sub.endpoint);

        if (err.statusCode === 404 || err.statusCode === 410) {
          await PushSubscription.deleteOne({ _id: sub._id });
        }
      }
    }

    res.json({
      message: "Push notification sent",
      total: subs.length,
      success,
      failed,
    });
  } catch (error) {
    console.error("SEND PUSH ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};
