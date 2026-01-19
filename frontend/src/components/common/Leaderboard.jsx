/** @format */

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { Trophy, Medal, Crown, TrendingUp, Award } from "lucide-react";
import { calculateVolunteerScore, calculateEarnedBadges } from "../../utils/badges";

// CSS for custom scrollbar
const scrollbarStyles = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: #d1d5db;
    border-radius: 20px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background-color: #9ca3af;
  }
`;

const Leaderboard = ({ volunteers = [], currentUserId = null, onUserClick = null }) => {
  const rankedVolunteers = useMemo(() => {
    return volunteers
      .map((volunteer) => {
        const stats = {
          eventsCompleted: volunteer.eventsCompleted || 0,
          totalHours: volunteer.totalHours || 0,
          interactions: volunteer.interactions || 0,
          reactionsReceived: volunteer.reactionsReceived || 0,
          attendanceRate: volunteer.attendanceRate || 100,
          earlyCheckins: volunteer.earlyCheckins || 0,
        };

        const score = calculateVolunteerScore(stats);
        const badges = calculateEarnedBadges(stats);

        return {
          ...volunteer,
          score,
          badges,
          stats,
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  }, [volunteers]);

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Medal className="w-6 h-6 text-orange-400" />;
      default:
        return <Trophy className="w-5 h-5 text-gray-400" />;
    }
  };

  const getRankColor = (rank) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-300";
      case 2:
        return "bg-gradient-to-r from-gray-50 to-gray-100 border-gray-300";
      case 3:
        return "bg-gradient-to-r from-orange-50 to-orange-100 border-orange-300";
      default:
        return "bg-white border-gray-200";
    }
  };

  if (!rankedVolunteers || rankedVolunteers.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
        <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">Chưa có dữ liệu bảng xếp hạng</p>
      </div>
    );
  }

  return (
    <>
      <style>{scrollbarStyles}</style>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-500 to-blue-500 p-6">
        <div className="flex items-center gap-3 text-white">
          <Trophy className="w-8 h-8" />
          <div>
            <h2 className="text-2xl font-bold">Bảng Xếp Hạng</h2>
            <p className="text-emerald-100 text-sm">
              Top 5 tình nguyện viên xuất sắc nhất
            </p>
          </div>
        </div>
      </div>

      {/* Leaderboard List */}
      <div className="p-6 space-y-3 max-h-[450px] overflow-y-auto custom-scrollbar">
        {rankedVolunteers.map((volunteer, index) => {
          const rank = index + 1;
          const isCurrentUser = volunteer._id === currentUserId;

          return (
            <motion.div
              key={volunteer._id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => onUserClick?.(volunteer)}
              className={`relative flex items-center gap-4 p-4 rounded-xl border-2 transition-all hover:shadow-md ${getRankColor(
                rank
              )} ${isCurrentUser ? "ring-2 ring-emerald-500" : ""} ${onUserClick ? "cursor-pointer hover:scale-[1.02]" : ""}`}
            >
              {/* Rank */}
              <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center">
                {getRankIcon(rank)}
              </div>

              {/* Avatar & Info */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center text-white font-bold text-lg overflow-hidden flex-shrink-0">
                  {volunteer.profilePicture ? (
                    <img
                      src={volunteer.profilePicture}
                      alt={volunteer.userName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    volunteer.userName?.charAt(0).toUpperCase()
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-gray-900 truncate">
                      {volunteer.userName}
                      {isCurrentUser && (
                        <span className="ml-2 text-xs bg-emerald-500 text-white px-2 py-0.5 rounded-full">
                          Bạn
                        </span>
                      )}
                    </h3>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                    <span className="flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      {volunteer.stats.eventsCompleted} sự kiện
                    </span>
                    <span className="flex items-center gap-1">
                      <Award className="w-3 h-3" />
                      {volunteer.badges.length} huy hiệu
                    </span>
                  </div>
                </div>
              </div>

              {/* Score */}
              <div className="text-right flex-shrink-0">
                <div className="text-2xl font-black text-gray-900">
                  {volunteer.score.toLocaleString()}
                </div>
                <div className="text-xs text-gray-500 font-medium">điểm</div>
              </div>

              {/* Top 3 Badge */}
              {rank <= 3 && (
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                  #{rank}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="bg-gray-50 p-4 text-center text-xs text-gray-500">
        Điểm được tính dựa trên số sự kiện, giờ tham gia và tương tác
      </div>
    </div>
    </>
  );
};

export default Leaderboard;
