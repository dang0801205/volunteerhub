/** @format */

import PushSubscription from "../models/pushSubscriptionModel.js";
import webpush from "web-push";

export const pushToUsers = async ({ userIds, title, body, data }) => {
  console.log("[PUSH] pushToUsers called");
  console.log("[PUSH] Target userIds:", userIds);

  const subs = await PushSubscription.find({
    userId: { $in: userIds },
  });

  console.log(`[PUSH] Found ${subs.length} subscription(s) in DB`);

  if (subs.length === 0) {
    console.warn("[PUSH] No subscriptions found. Abort.");
    return { sent: 0, failed: 0 };
  }

  let success = 0;
  let failed = 0;

  for (const sub of subs) {
    console.log("[PUSH] Sending to:");
    console.log("   userId:", sub.userId.toString());
    console.log("   endpoint:", sub.endpoint);

    const payload = JSON.stringify({
      title,
      body,
      data,
    });

    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: sub.keys,
        },
        payload
      );

      success++;
      console.log("[PUSH] Sent successfully");
    } catch (err) {
      failed++;

      console.error("[PUSH] Send failed");
      console.error("   statusCode:", err.statusCode);
      console.error("   endpoint:", sub.endpoint);
      console.error("   message:", err.message);

      if (err.statusCode === 404 || err.statusCode === 410) {
        console.warn("[PUSH] Subscription expired → deleting");
        await PushSubscription.deleteOne({ _id: sub._id });
      }
    }
  }

  console.log("[PUSH] Final result:", {
    total: subs.length,
    success,
    failed,
  });

  return { total: subs.length, success, failed };
};
