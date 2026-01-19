/** @format */

// Hệ thống huy hiệu cho tình nguyện viên
export const BADGES = {
  NEWCOMER: {
    id: "newcomer",
    name: "Người mới",
    description: "Hoàn thành sự kiện đầu tiên",
    icon: "🌱",
    color: "bg-green-100 text-green-700",
    requirement: { type: "events", value: 1 },
  },
  DEDICATED: {
    id: "dedicated",
    name: "Nhiệt tâm",
    description: "Tham gia 5 sự kiện",
    icon: "⭐",
    color: "bg-blue-100 text-blue-700",
    requirement: { type: "events", value: 5 },
  },
  VETERAN: {
    id: "veteran",
    name: "Kỳ cựu",
    description: "Tham gia 15 sự kiện",
    icon: "🏅",
    color: "bg-purple-100 text-purple-700",
    requirement: { type: "events", value: 15 },
  },
  LEGEND: {
    id: "legend",
    name: "Huyền thoại",
    description: "Tham gia 30 sự kiện",
    icon: "👑",
    color: "bg-yellow-100 text-yellow-700",
    requirement: { type: "events", value: 30 },
  },
  HOUR_WARRIOR: {
    id: "hour_warrior",
    name: "Chiến binh thời gian",
    description: "Đóng góp 50+ giờ",
    icon: "⏰",
    color: "bg-orange-100 text-orange-700",
    requirement: { type: "hours", value: 50 },
  },
  TIME_MASTER: {
    id: "time_master",
    name: "Bậc thầy thời gian",
    description: "Đóng góp 100+ giờ",
    icon: "⌛",
    color: "bg-red-100 text-red-700",
    requirement: { type: "hours", value: 100 },
  },
  SOCIAL_BUTTERFLY: {
    id: "social_butterfly",
    name: "Bướm xã hội",
    description: "Tương tác 50+ bài viết",
    icon: "🦋",
    color: "bg-pink-100 text-pink-700",
    requirement: { type: "interactions", value: 50 },
  },
  PERFECT_ATTENDANCE: {
    id: "perfect_attendance",
    name: "Chuyên cần",
    description: "Không vắng mặt lần nào",
    icon: "✅",
    color: "bg-emerald-100 text-emerald-700",
    requirement: { type: "attendance_rate", value: 100 },
  },
  EARLY_BIRD: {
    id: "early_bird",
    name: "Người sớm",
    description: "Check-in trước 10+ lần",
    icon: "🐦",
    color: "bg-sky-100 text-sky-700",
    requirement: { type: "early_checkins", value: 10 },
  },
  COMMUNITY_STAR: {
    id: "community_star",
    name: "Ngôi sao cộng đồng",
    description: "Nhận 100+ reactions",
    icon: "💫",
    color: "bg-indigo-100 text-indigo-700",
    requirement: { type: "reactions_received", value: 100 },
  },
};

/**
 * Tính toán badges đạt được dựa trên stats
 */
export const calculateEarnedBadges = (stats) => {
  const {
    eventsCompleted = 0,
    totalHours = 0,
    interactions = 0,
    attendanceRate = 0,
    earlyCheckins = 0,
    reactionsReceived = 0,
  } = stats;

  const earned = [];

  Object.values(BADGES).forEach((badge) => {
    let isEarned = false;

    switch (badge.requirement.type) {
      case "events":
        isEarned = eventsCompleted >= badge.requirement.value;
        break;
      case "hours":
        isEarned = totalHours >= badge.requirement.value;
        break;
      case "interactions":
        isEarned = interactions >= badge.requirement.value;
        break;
      case "attendance_rate":
        isEarned = attendanceRate >= badge.requirement.value;
        break;
      case "early_checkins":
        isEarned = earlyCheckins >= badge.requirement.value;
        break;
      case "reactions_received":
        isEarned = reactionsReceived >= badge.requirement.value;
        break;
      default:
        break;
    }

    if (isEarned) {
      earned.push(badge);
    }
  });

  return earned;
};

/**
 * Tính điểm tổng cho leaderboard
 */
export const calculateVolunteerScore = (stats) => {
  const {
    eventsCompleted = 0,
    totalHours = 0,
    interactions = 0,
    reactionsReceived = 0,
  } = stats;

  // Công thức tính điểm
  const eventPoints = eventsCompleted * 10;
  const hourPoints = totalHours * 5;
  const interactionPoints = interactions * 2;
  const reactionPoints = reactionsReceived * 1;

  return eventPoints + hourPoints + interactionPoints + reactionPoints;
};

/**
 * Xếp hạng badges theo độ hiếm
 */
export const getBadgeRarity = (badge) => {
  const rarityMap = {
    newcomer: 1,
    dedicated: 2,
    veteran: 3,
    legend: 4,
    hour_warrior: 2,
    time_master: 3,
    social_butterfly: 2,
    perfect_attendance: 4,
    early_bird: 2,
    community_star: 3,
  };
  return rarityMap[badge.id] || 1;
};
