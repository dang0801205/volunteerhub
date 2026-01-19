import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getMyRecommendations } from "../../features/recommendationSlice";
import { Link } from "react-router-dom";
import { Calendar, MapPin, Star } from "lucide-react";
import { motion } from "framer-motion";
import { t } from "../../utils/i18n";

const RecommendedEvents = ({ user }) => {
  const dispatch = useDispatch();
  const { myRecommendations, loading } = useSelector(
    (state) => state.recommendations
  );

  useEffect(() => {
    if (user?._id) {
      dispatch(getMyRecommendations(5)); // Fetch top 5 recommendations
    }
  }, [dispatch, user]);

  if (!user) return null;

  if (loading) {
     return <div className="p-8 text-center text-gray-500">Loading recommendations...</div>;
  }
  
  if (myRecommendations.length === 0) {
     return <div className="mb-10 w-full p-6 text-center bg-gray-50 dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-700 dark:text-gray-200">Không có gợi ý nào</h2>
        <p className="text-gray-500">Hãy tham gia thêm sự kiện để chúng tôi hiểu sở thích của bạn nhé!</p>
     </div>;
  }

  return (
    <section className="mb-10 w-full">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-white">
          <Star className="h-6 w-6 text-yellow-500 fill-current" />
          {t("recommendedForYou") || "Gợi ý cho bạn"}
        </h2>
        
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {myRecommendations.map((event, idx) => (
          <motion.div
            key={event._id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="min-w-[280px] w-[280px] flex-shrink-0"
          >
            <Link
              to={`/events/${event._id}`}
              className="group block h-full overflow-hidden rounded-xl bg-white dark:bg-gray-800 shadow-md transition-all hover:shadow-xl border border-gray-100 dark:border-gray-700"
            >
              <div className="relative h-40 overflow-hidden">
                <img
                  src={event.image || "/default-event.jpg"}
                  alt={event.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute top-2 right-2 rounded-full bg-white/90 px-2 py-1 text-xs font-bold text-primary-600 shadow-sm backdrop-blur-sm">
                  {event.matchScore ? `${Math.round(event.matchScore)}% Match` : "Recommended"}
                </div>
              </div>

              <div className="p-4">
                <h3 className="mb-2 line-clamp-1 text-lg font-bold text-gray-900 dark:text-gray-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                  {event.title}
                </h3>

                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary-500" />
                    <span>
                      {new Date(event.startDate).toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary-500" />
                    <span className="line-clamp-1">
                      {event.location || "TBD"}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default RecommendedEvents;
