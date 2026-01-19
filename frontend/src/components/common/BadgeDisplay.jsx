/** @format */

import React from "react";
import { motion } from "framer-motion";
import { Trophy, Medal, Award } from "lucide-react";

const BadgeDisplay = ({ badges = [], size = "md", showCount = false }) => {
  if (!badges || badges.length === 0) {
    return (
      <div className="text-gray-400 text-sm italic">
        Chưa có huy hiệu nào
      </div>
    );
  }

  const sizeClasses = {
    sm: "w-8 h-8 text-lg",
    md: "w-12 h-12 text-2xl",
    lg: "w-16 h-16 text-3xl",
  };

  return (
    <div className="flex flex-wrap gap-2">
      {badges.map((badge, index) => (
        <motion.div
          key={badge.id}
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: index * 0.1, type: "spring" }}
          className={`${sizeClasses[size]} ${badge.color} rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform cursor-pointer relative group`}
          title={`${badge.name}: ${badge.description}`}
        >
          <span className="text-center">{badge.icon}</span>
          
          {/* Tooltip */}
          <div className="absolute bottom-full mb-2 hidden group-hover:block z-50 w-48">
            <div className="bg-gray-900 text-white text-xs rounded-lg p-2 shadow-xl">
              <p className="font-bold">{badge.name}</p>
              <p className="text-gray-300 mt-1">{badge.description}</p>
            </div>
          </div>
        </motion.div>
      ))}
      {showCount && badges.length > 0 && (
        <div className="flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full text-sm font-bold text-gray-700">
          <Award className="w-4 h-4" />
          {badges.length}
        </div>
      )}
    </div>
  );
};

export default BadgeDisplay;
