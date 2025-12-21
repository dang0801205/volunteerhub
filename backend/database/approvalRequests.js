/** @format */

// Hàm sinh dữ liệu Approval Request
const generateApprovalRequests = (volunteers, pendingEvents, managers) => {
  const requests = [];

  pendingEvents.forEach((event) => {
    const randomManager = managers[Math.floor(Math.random() * managers.length)];

    requests.push({
      type: "event_approval",
      event: event._id,
      requestedBy: event.createdBy || randomManager?._id,
      status: "pending",
    });
  });

  const candidates = volunteers.slice(0, 10);

  candidates.forEach((vol) => {
    requests.push({
      type: "manager_promotion",
      requestedBy: vol._id,
      status: "pending",

      promotionData: {
        eventsCompleted: Math.floor(Math.random() * 20) + 5,
        totalAttendanceHours: parseFloat((Math.random() * 50 + 20).toFixed(1)),
        averageRating: parseFloat((Math.random() * 1.5 + 3.5).toFixed(1)),
      },
    });
  });

  if (volunteers.length > 12) {
    requests.push({
      type: "manager_promotion",
      requestedBy: volunteers[11]._id,
      status: "rejected",
      adminNote:
        "Hồ sơ chưa đủ kinh nghiệm lãnh đạo. Cần tham gia thêm các sự kiện lớn.",
      reviewedAt: new Date(),
      promotionData: {
        eventsCompleted: 2,
        totalAttendanceHours: 8.5,
        averageRating: 3.8,
      },
    });
  }
  if (volunteers.length > 13) {
    requests.push({
      type: "manager_promotion",
      requestedBy: volunteers[12]._id,
      status: "approved",
      adminNote: "Thành tích xuất sắc. Đồng ý thăng cấp.",
      reviewedAt: new Date(),
      promotionData: {
        eventsCompleted: 30,
        totalAttendanceHours: 120,
        averageRating: 4.9,
      },
    });
  }

  return requests;
};

export default generateApprovalRequests;
