/** @format */

import { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Calendar,
  MapPin,
  Clock,
  History,
  CheckCircle2,
  XCircle,
  Hourglass,
  Award,
  TrendingUp,
  Filter,
  Search,
} from "lucide-react";
import { motion } from "framer-motion";
import { fetchMyRegistrations } from "../../features/registrationSlice";
import { REGISTRATION_STATUS } from "../../types";

// --- 1. SỬA LẠI MAP: Dùng key động từ REGISTRATION_STATUS ---
const STATUS_MAP = {
  // Trạng thái chờ (Waitlisted/Pending)
  [REGISTRATION_STATUS.WAITLISTED]: {
    label: "Chờ duyệt",
    color: "bg-yellow-100 text-yellow-700",
    icon: Hourglass,
  },
  [REGISTRATION_STATUS.PENDING]: { // Fallback nếu backend dùng pending
    label: "Đang xử lý",
    color: "bg-yellow-100 text-yellow-700",
    icon: Hourglass,
  },
  // Trạng thái đã duyệt (Registered/Accepted)
  [REGISTRATION_STATUS.REGISTERED]: {
    label: "Đã duyệt",
    color: "bg-green-100 text-green-700",
    icon: CheckCircle2,
  },
  [REGISTRATION_STATUS.ACCEPTED]: { // Fallback
    label: "Đã duyệt",
    color: "bg-green-100 text-green-700",
    icon: CheckCircle2,
  },
  // Trạng thái bị từ chối/Hủy (Cancelled/Rejected)
  [REGISTRATION_STATUS.CANCELLED]: {
    label: "Đã hủy",
    color: "bg-red-100 text-red-700",
    icon: XCircle,
  },
  [REGISTRATION_STATUS.REJECTED]: { // Fallback
    label: "Bị từ chối",
    color: "bg-red-100 text-red-700",
    icon: XCircle,
  },
};

// --- 2. SỬA LẠI FILTER: Dùng value chuẩn ---
const STATUS_FILTERS = [
  { label: "Tất cả", value: "all" },
  { label: "Chờ duyệt", value: REGISTRATION_STATUS.WAITLISTED },
  { label: "Đã duyệt", value: REGISTRATION_STATUS.REGISTERED },
  { label: "Đã hủy/Từ chối", value: REGISTRATION_STATUS.CANCELLED },
];

const COMPLETION_MAP = {
  completed: {
    label: "Đã hoàn thành",
    color: "bg-blue-100 text-blue-700",
    icon: Award,
  },
  "not-completed": {
    label: "Chưa hoàn thành",
    color: "bg-gray-100 text-gray-600",
    icon: Clock,
  },
};

const COMPLETION_FILTERS = [
  { label: "Tất cả", value: "all" },
  { label: "Đã hoàn thành", value: "completed" },
  { label: "Chưa hoàn thành", value: "not-completed" },
];

export default function VolunteerHistory({ user }) {
  const dispatch = useDispatch();
  const { myRegistrations, myLoading } = useSelector(
    (state) => state.registration
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [completionFilter, setCompletionFilter] = useState("all");

  useEffect(() => {
    if (user) {
      dispatch(fetchMyRegistrations());
    }
    console.log("🟢 history:", myRegistrations);
  }, [dispatch, user]);

  // --- 3. LOGIC MAP: Giữ nguyên status gốc từ backend ---
  const registrations = useMemo(() => {
  return myRegistrations.map((reg) => {
    let completionStatus = "not-completed";

    if (reg.attendanceStatus === "completed") {
      completionStatus = "completed";
    }

    // in-progress | absent | null => not-completed
    return {
      ...reg,
      event: reg.eventId,
      status: reg.status || REGISTRATION_STATUS.WAITLISTED,
      completionStatus, // 👈 QUYẾT ĐỊNH TẠI ĐÂY
    };
  });
}, [myRegistrations]);

  
  const loading = myLoading;

  const stats = useMemo(() => {
    const total = registrations.length;

    // Sử dụng đúng Enum để so sánh
    const pending = registrations.filter(
      (r) => r.status === REGISTRATION_STATUS.WAITLISTED
    ).length;

    const accepted = registrations.filter(
      (r) => r.status === REGISTRATION_STATUS.REGISTERED
    ).length;

    const rejected = registrations.filter(
      (r) => r.status === REGISTRATION_STATUS.CANCELLED || r.status === REGISTRATION_STATUS.REJECTED
    ).length;

    const completed = registrations.filter(
      (r) => r.completionStatus === "completed"
    ).length;

    const totalHours = registrations
      .filter((r) => r.completionStatus === "completed" && r.event)
      .reduce((sum, r) => {
        if (!r.event?.startDate || !r.event?.endDate) return sum;
        const start = new Date(r.event.startDate);
        const end = new Date(r.event.endDate);
        const hours = Math.max(0, (end - start) / (1000 * 60 * 60));
        return sum + hours;
      }, 0);

    return {
      total,
      pending,
      accepted,
      rejected,
      completed,
      totalHours: Math.round(totalHours),
    };
  }, [registrations]);

  const filteredRegistrations = useMemo(() => {
    return registrations.filter((reg) => {
      const matchesSearch =
        !searchQuery ||
        reg.event?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        reg.event?.location?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || reg.status === statusFilter;

      const matchesCompletion =
        completionFilter === "all" ||
        (reg.completionStatus || "not-completed") === completionFilter;

      return matchesSearch && matchesStatus && matchesCompletion;
    });
  }, [registrations, searchQuery, statusFilter, completionFilter]);

  const sortedRegistrations = useMemo(() => {
    return [...filteredRegistrations].sort(
      (a, b) => new Date(b.registeredAt) - new Date(a.registeredAt)
    );
  }, [filteredRegistrations]);

  if (loading) {
    return (
      <div className='w-full min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto'></div>
          <p className='mt-4 text-gray-600'>Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='w-full min-h-screen bg-gray-50 px-4 sm:px-6 py-8'>
      <div className='max-w-6xl mx-auto space-y-6'>
        {/* Header */}
        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
          <div className='flex items-center gap-3'>
            <div className='p-3 bg-blue-100 rounded-xl'>
              <History className='h-6 w-6 text-blue-600' />
            </div>
            <div>
              <h1 className='text-2xl font-bold text-gray-900'>
                Lịch sử tham gia
              </h1>
              <p className='text-sm text-gray-500'>
                Theo dõi các sự kiện bạn đã đăng ký
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4'>
          <StatCard
            label='Tổng đăng ký'
            value={stats.total}
            icon={<Calendar className='h-5 w-5' />}
            color='bg-blue-500'
          />
          <StatCard
            label='Chờ duyệt'
            value={stats.pending}
            icon={<Hourglass className='h-5 w-5' />}
            color='bg-yellow-500'
          />
          <StatCard
            label='Đã duyệt'
            value={stats.accepted}
            icon={<CheckCircle2 className='h-5 w-5' />}
            color='bg-green-500'
          />
          <StatCard
            label='Đã hủy/Từ chối'
            value={stats.rejected}
            icon={<XCircle className='h-5 w-5' />}
            color='bg-red-500'
          />
          <StatCard
            label='Đã hoàn thành'
            value={stats.completed}
            icon={<Award className='h-5 w-5' />}
            color='bg-purple-500'
          />
          <StatCard
            label='Số giờ TNV'
            value={`${stats.totalHours}h`}
            icon={<TrendingUp className='h-5 w-5' />}
            color='bg-indigo-500'
          />
        </div>

        {/* Filters */}
        <div className='bg-white rounded-xl shadow-sm p-4 border border-gray-100'>
          <div className='flex flex-col lg:flex-row gap-4 lg:items-end'>
            {/* Search Box */}
            <div className='flex-1'>
              <label className='block text-xs font-medium text-gray-500 mb-1 ml-1'>
                Tìm kiếm
              </label>
              <div className='relative'>
                <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400' />
                <input
                  type='text'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder='Tìm theo tên sự kiện, địa điểm...'
                  className='w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900'
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className='flex flex-col gap-1 min-w-[200px]'>
              <label className='text-xs font-medium text-gray-500 ml-1'>
                Trạng thái đăng ký
              </label>
              <div className='relative'>
                <div className='absolute left-3 top-1/2 -translate-y-1/2'>
                  <Filter className='h-4 w-4 text-gray-400' />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className='w-full pl-9 pr-8 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 appearance-none cursor-pointer'>
                  {STATUS_FILTERS.map((f) => (
                    <option key={f.value} value={f.value}>
                      {f.label}
                    </option>
                  ))}
                </select>
                <div className='absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none'>
                  <svg className='h-4 w-4 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M19 9l-7 7-7-7'></path>
                  </svg>
                </div>
              </div>
            </div>

            {/* Completion Filter */}
            <div className='flex flex-col gap-1 min-w-[200px]'>
              <label className='text-xs font-medium text-gray-500 ml-1'>
                Kết quả tham gia
              </label>
              <div className='relative'>
                <div className='absolute left-3 top-1/2 -translate-y-1/2'>
                  <Award className='h-4 w-4 text-gray-400' />
                </div>
                <select
                  value={completionFilter}
                  onChange={(e) => setCompletionFilter(e.target.value)}
                  className='w-full pl-9 pr-8 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 appearance-none cursor-pointer'>
                  {COMPLETION_FILTERS.map((f) => (
                    <option key={f.value} value={f.value}>
                      {f.label}
                    </option>
                  ))}
                </select>
                <div className='absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none'>
                  <svg className='h-4 w-4 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M19 9l-7 7-7-7'></path>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* List */}
        <div className='space-y-4'>
          {sortedRegistrations.length === 0 ? (
            <div className='bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100'>
              <History className='h-16 w-16 text-gray-300 mx-auto' />
              <h3 className='mt-4 text-lg font-semibold text-gray-900'>
                Chưa có lịch sử
              </h3>
              <p className='mt-2 text-gray-500'>
                {registrations.length === 0
                  ? "Bạn chưa đăng ký tham gia sự kiện nào."
                  : "Không tìm thấy kết quả phù hợp với bộ lọc."}
              </p>
            </div>
          ) : (
            sortedRegistrations.map((reg, index) => (
              <RegistrationCard
                key={reg._id}
                registration={reg}
                index={index}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className='bg-white rounded-xl shadow-sm p-4 border border-gray-100'>
      <div className='flex items-center gap-3'>
        <div className={`p-2 rounded-lg ${color} text-white`}>{icon}</div>
        <div>
          <p className='text-2xl font-bold text-gray-900'>{value}</p>
          <p className='text-xs text-gray-500'>{label}</p>
        </div>
      </div>
    </motion.div>
  );
}

function RegistrationCard({ registration, index }) {
  const {
    event,
    status,
    completionStatus = "not-completed",
    registeredAt,
  } = registration;

  // --- 4. SỬA HIỂN THỊ CARD: Lấy info từ Map mới ---
  const statusInfo = STATUS_MAP[status] || {
    label: "Không xác định",
    color: "bg-gray-100 text-gray-600",
    icon: Hourglass,
  };

  const completionInfo =
    COMPLETION_MAP[completionStatus] || COMPLETION_MAP["not-completed"];
  const StatusIcon = statusInfo.icon;
  const CompletionIcon = completionInfo.icon;

  const hours = useMemo(() => {
    if (!event?.startDate || !event?.endDate) return null;
    const start = new Date(event.startDate);
    const end = new Date(event.endDate);
    return Math.max(0, Math.round((end - start) / (1000 * 60 * 60)));
  }, [event]);

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("vi-VN", {
      weekday: "short",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!event) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className='bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow'>
      <div className='flex flex-col sm:flex-row'>
        {event.imageUrl && (
          <div className='sm:w-48 h-32 sm:h-auto flex-shrink-0'>
            <img
              src={event.imageUrl}
              alt={event.title}
              className='w-full h-full object-cover'
            />
          </div>
        )}

        <div className='flex-1 p-4 sm:p-5'>
          <div className='flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3'>
            <h3 className='text-lg font-semibold text-gray-900 line-clamp-2'>
              {event.title}
            </h3>
            <div className='flex flex-wrap gap-2'>
              {/* Hiển thị badge trạng thái chính xác */}
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                <StatusIcon className='h-3.5 w-3.5' />
                {statusInfo.label}
              </span>
              
              {/* Hiển thị badge hoàn thành nếu đã được duyệt */}
              {(status === REGISTRATION_STATUS.REGISTERED || status === REGISTRATION_STATUS.ACCEPTED) && (
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${completionInfo.color}`}>
                  <CompletionIcon className='h-3.5 w-3.5' />
                  {completionInfo.label}
                </span>
              )}
            </div>
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600'>
            <div className='flex items-center gap-2'>
              <Calendar className='h-4 w-4 text-gray-400' />
              <span>{formatDate(event.startDate)}</span>
            </div>
            <div className='flex items-center gap-2'>
              <Clock className='h-4 w-4 text-gray-400' />
              <span>
                {formatTime(event.startDate)} - {formatTime(event.endDate)}
              </span>
              {hours !== null && (
                <span className='text-blue-600 font-medium'>({hours}h)</span>
              )}
            </div>
            <div className='flex items-center gap-2 sm:col-span-2'>
              <MapPin className='h-4 w-4 text-gray-400' />
              <span className='line-clamp-1'>{event.location}</span>
            </div>
          </div>

          {event.tags && event.tags.length > 0 && (
            <div className='flex flex-wrap gap-1.5 mt-3'>
              {event.tags.slice(0, 3).map((tag, i) => (
                <span
                  key={i}
                  className='px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs'>
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <div className='mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500'>
            Đăng ký lúc: {new Date(registeredAt).toLocaleString("vi-VN")}
          </div>
        </div>
      </div>
    </motion.div>
  );
}