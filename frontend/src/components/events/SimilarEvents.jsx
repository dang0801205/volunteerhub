import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getSimilarEvents } from "../../features/recommendationSlice";
import { Link } from "react-router-dom";
import { ArrowRight, Calendar, MapPin } from "lucide-react";
import { t } from "../../utils/i18n";
import { motion } from "framer-motion";

const SimilarEvents = ({ eventId }) => {
  const dispatch = useDispatch();
  const { similarEvents, loading } = useSelector(
    (state) => state.recommendations
  );

  useEffect(() => {
    if (eventId) {
      dispatch(getSimilarEvents({ eventId, limit: 4 }));
    }
  }, [dispatch, eventId]);

  if (loading) return <div>Loading similar events...</div>;
  if (similarEvents.length === 0) return <div className="mt-12 pt-8 text-center text-gray-500">Không tìm thấy sự kiện tương tự</div>;

  return (
    <section className="mt-12 border-t pt-8 dark:border-gray-700">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t("similarEvents") || "Sự kiện tương tự"}
        </h3>
        <Link 
          to="/events" 
          className="group flex items-center gap-1 text-sm font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
        >
          {t("viewAll") || "Xem tất cả"}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {similarEvents.map((event, idx) => (
          <motion.div
            key={event._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Link
              to={`/events/${event._id}`}
              className="flex flex-col h-full overflow-hidden rounded-xl bg-white dark:bg-gray-800 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg border border-gray-100 dark:border-gray-700"
            >
              <div className="relative h-40 overflow-hidden">
                <img
                  src={event.image || "/default-event.jpg"}
                  alt={event.title}
                  className="h-full w-full object-cover transition-transform duration-500 hover:scale-110"
                />
              </div>

              <div className="flex flex-1 flex-col p-4">
                <h4 className="mb-2 line-clamp-2 text-base font-bold text-gray-900 dark:text-gray-100 group-hover:text-primary-600">
                  {event.title}
                </h4>

                <div className="mt-auto space-y-2 text-xs text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5 text-primary-500" />
                    <span>
                      {new Date(event.startDate).toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-primary-500" />
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

export default SimilarEvents;
