/** @format */
import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { t } from "../utils/i18n";
import {
  Calendar,
  MapPin,
  MessageSquare,
  ArrowLeft,
  Clock,
  QrCode,
  Users,
  ChevronRight,
  Star,
  AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AttendanceManagement from "../components/socials/AttendanceManagement.jsx";

// QR & Logic Components
import QRCode from "../components/socials/QRCode.jsx";
import ManagerQrScanner from "../components/socials/ManagerQrScanner.jsx";

// Redux Actions
import { fetchMyEvents } from "../features/eventSlice";
import { fetchChannelByEventId, clearChannel } from "../features/channelSlice";
import { fetchMyQRCode } from "../features/registrationSlice";
import { checkOutByQr } from "../features/registrationSlice";
import { useRef } from "react";

// Event Components
import EventFeed from "../components/socials/EventFeed";
import EventTabs from "../components/events/EventTabs";
import EventReviews from "../components/events/EventReviews.jsx";
import VolunteersList from "../components/registrations/VolunteersList";
import MyRegistrationStatus from "../components/registrations/MyRegistrationStatus";
import { EventMediaGallery } from "../components/socials/EventMediaGallery.jsx";

const EventDetailView = ({ event, user, onBack }) => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("discussion");
  const [scanError, setScanError] = useState(null);

  const {
    checkOutMessage,
    checkOutError,
    checkOutLoading,
    myQrToken,
    qrLoading,
  } = useSelector((state) => state.registration);
  const [scrollToPostId, setScrollToPostId] = useState(null);
  const currentChannel = useSelector((state) => state.channel.current);

  useEffect(() => {
    if (activeTab === "qr" && user.role === "volunteer") {
      dispatch(fetchMyQRCode(event._id));
    }
  }, [activeTab, user.role, event._id, dispatch]);

  useEffect(() => {
    dispatch(fetchChannelByEventId(event._id));
    return () => dispatch(clearChannel());
  }, [dispatch, event._id]);

  const lastScannedTokenRef = useRef(null);

  const handleScanSuccess = useCallback(
    (token) => {
      if (lastScannedTokenRef.current === token) {
        return;
      }

      lastScannedTokenRef.current = token;

      dispatch(checkOutByQr({ qrToken: token }));
    },
    [dispatch]
  );

  const handleScanError = useCallback((err) => {
    setScanError(err);
  }, []);

  const attendanceRegistrations = (currentChannel?.attendances || []).map(
    (att) => ({
      _id: att._id,
      userId: att.regId?.userId,
      status: att.status,
      registeredAt: att.regId?.registeredAt,
      checkOut: att.checkOut,
      feedback: att.feedback,
    })
  );

  return (
    <div className='flex-1 bg-[#F1F5F9] dark:bg-gray-950 min-h-screen'>
      <div className='relative h-[400px] md:h-[500px] w-full overflow-hidden bg-slate-300 dark:bg-gray-800'>
        <motion.img
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5 }}
          src={event.image}
          alt={event.title}
          className='w-full h-full object-cover'
        />

        <div className='absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent z-10' />
        <div className='absolute inset-0 bg-black/10 z-10' />

        {/* Nút Quay Lại - Dark Glassmorphism */}
        <button
          onClick={onBack}
          className='absolute top-6 left-6 z-30 flex items-center gap-2 px-5 py-2.5 bg-black/40 backdrop-blur-xl border border-white/20 text-white rounded-full hover:bg-black/60 transition-all shadow-2xl active:scale-95'>
          <ArrowLeft className='w-5 h-5' />
          <span className='font-bold text-sm tracking-tight'>Quay lại</span>
        </button>

        {/* Nội dung chữ trên ảnh */}
        <div className='absolute bottom-0 left-0 w-full p-6 md:p-12 z-20'>
          <div className='max-w-6xl mx-auto'>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className='space-y-6'>
              <div className='inline-flex items-center gap-2 px-3 py-1 bg-blue-600 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded shadow-xl'>
                Community Hub
              </div>

              <h1 className='text-4xl md:text-7xl font-black text-white leading-tight tracking-tighter drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)] uppercase italic'>
                {event.title}
              </h1>

              {/* Glass Capsules - Đảm bảo dù nền trắng vẫn đọc được */}
              <div className='flex flex-wrap items-center gap-4'>
                <div className='flex items-center gap-2 px-4 py-2 bg-black/50 backdrop-blur-lg border border-white/10 rounded-2xl shadow-xl'>
                  <Calendar className='w-5 h-5 text-blue-400' />
                  <span className='text-white text-sm md:text-base font-bold'>
                    {new Date(event.startDate).toLocaleDateString("vi-VN")}
                  </span>
                </div>

                <div className='flex items-center gap-2 px-4 py-2 bg-black/50 backdrop-blur-lg border border-white/10 rounded-2xl shadow-xl'>
                  <MapPin className='w-5 h-5 text-red-400' />
                  <span className='text-white text-sm md:text-base font-bold line-clamp-1'>
                    {event.location}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <div className='max-w mx-auto px-4 md:px-8 -mt-12 relative z-30 pb-20'>
        <div className='mb-6 shadow-2xl'>
          <MyRegistrationStatus eventId={event._id} userId={user._id} />
        </div>

        <div className='bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-[2rem] p-1.5 shadow-xl border border-white dark:border-gray-700 sticky top-4 z-40'>
          <EventTabs activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>

        <div className=''>
          <AnimatePresence mode='wait'>
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}>
              {activeTab === "discussion" && (
                <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
                  <div className='lg:col-span-2'>
                    <EventFeed
                      event={event}
                      user={user}
                      scrollToPostId={scrollToPostId}
                      onScrolled={() => setScrollToPostId(null)}
                    />
                  </div>
                  <div className='hidden lg:block'>
                    <div className='bg-white dark:bg-gray-800 rounded-[2.5rem] p-8 shadow-sm border border-slate-200/60 dark:border-gray-700'>
                      <h4 className='font-black text-xl mb-4 text-slate-800 dark:text-white tracking-tight uppercase italic'>
                        {t('discussion')}
                      </h4>
                      <p className='text-slate-500 dark:text-gray-300 text-sm leading-relaxed font-medium'>
                        {t('discussionDescription')}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "reviews" && (
                <div className='bg-white dark:bg-gray-800 rounded-[3rem] p-8 md:p-12 shadow-sm border border-slate-200/60 dark:border-gray-700'>
                  <div className='flex items-center gap-3 mb-8'>
                    <Star className='text-yellow-500 fill-yellow-500 w-8 h-8' />
                    <h2 className='text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase italic'>
                      {t('reviews')}
                    </h2>
                  </div>
                  <EventReviews user={user} eventId={event._id} />
                </div>
              )}

              {activeTab === "members" && (
                <div className='bg-white dark:bg-gray-800 rounded-[3rem] p-8 md:p-12 shadow-sm border border-slate-200/60 dark:border-gray-700'>
                  <div className='flex items-center justify-between mb-10'>
                    <h2 className='text-3xl font-black text-slate-900 dark:text-white tracking-tight italic uppercase'>
                      {t('members')}
                    </h2>
                    <div className='p-4 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-[1.5rem]'>
                      <Users size={28} />
                    </div>
                  </div>
                  <VolunteersList
                    registrations={attendanceRegistrations}
                    compact={false}
                    canView={true}
                    onUserClick={(u) => console.log(u)}
                    userRole={user?.role}
                    addToast={(msg, type) => console.log(msg, type)}
                  />
                </div>
              )}

              {activeTab === "attendance" && (
                <div className='bg-white dark:bg-gray-800 rounded-[3rem] md:p-12 border border-slate-200/60 dark:border-gray-700'>
                  <AttendanceManagement
                    attendances={currentChannel?.attendances || []}
                  />
                </div>
              )}

              {activeTab === "about" && (
                <div className='bg-white dark:bg-gray-800 rounded-[3rem] p-8 md:p-14 shadow-sm border border-slate-200/60 dark:border-gray-700'>
                  <h2 className='text-4xl font-black mb-8 text-slate-900 dark:text-white tracking-tighter italic uppercase underline decoration-blue-500 dark:decoration-blue-400 decoration-8 underline-offset-8'>
                    {t('about')}
                  </h2>
                  <p className='text-slate-600 dark:text-gray-300 text-xl leading-relaxed whitespace-pre-line font-medium tracking-tight italic'>
                    {event.description}
                  </p>
                </div>
              )}

              {activeTab === "media" && (
                <EventMediaGallery
                  posts={currentChannel?.posts || []}
                  user={user}
                  eventId={event._id || event.id}
                />
              )}

              {activeTab === "qr" && (
                <div className='max-w-xl mx-auto bg-white dark:bg-gray-800 rounded-[4rem] p-10 md:p-20 shadow-2xl border border-slate-100 dark:border-gray-700 text-center relative overflow-hidden mt-10'>
                  <div className='absolute top-0 right-0 w-40 h-40 bg-blue-600/5 dark:bg-blue-400/5 rounded-full -mr-20 -mt-20 blur-3xl' />
                  <div className='mb-8 inline-flex p-6 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full shadow-inner ring-8 ring-blue-50/50 dark:ring-blue-900/20'>
                    <QrCode size={48} />
                  </div>
                  <h2 className='text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tight'>
                    QR CODE
                  </h2>

                  {user.role === "volunteer" && (
                    <>
                      <p className='text-slate-500 dark:text-gray-400 mb-12 font-semibold'>
                        Dùng mã này để điểm danh tại sự kiện.
                      </p>
                      <div className='p-2 bg-slate-100 dark:bg-gray-700 rounded-[3.5rem] inline-block shadow-inner border border-slate-200 dark:border-gray-600'>
                        <div className='bg-white dark:bg-gray-900 p-8 rounded-[3rem] shadow-sm border border-slate-200/50 dark:border-gray-700'>
                          {qrLoading ? (
                            <div className='w-[220px] h-[220px] bg-slate-50 dark:bg-gray-700 animate-pulse rounded-2xl' />
                          ) : myQrToken ? (
                            <QRCode value={myQrToken} size={220} />
                          ) : (
                            <p className='text-slate-400 dark:text-gray-500'>Không có mã</p>
                          )}
                        </div>
                      </div>
                    </>
                  )}

                  {user.role === "manager" && (
                    <div className='space-y-6'>
                      <ManagerQrScanner
                        onScanSuccess={handleScanSuccess}
                        onScanError={handleScanError}
                      />

                      {/* HIỂN THỊ TRẠNG THÁI & LỖI (Sửa lỗi scanError unused) */}
                      <div className='mt-6 space-y-4'>
                        {checkOutLoading && (
                          <div className='p-4 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl font-black animate-pulse uppercase italic'>
                            Đang xử lý...
                          </div>
                        )}
                        {checkOutMessage && (
                          <div className='p-4 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-2xl font-black uppercase italic tracking-wider shadow-sm border border-green-100 dark:border-green-800 animate-bounce'>
                            ✔ {checkOutMessage}
                          </div>
                        )}
                        {checkOutError && (
                          <div className='p-4 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-2xl font-black uppercase italic tracking-wider shadow-sm border border-red-100 dark:border-red-800'>
                            ❌ {checkOutError}
                          </div>
                        )}

                        {scanError && (
                          <div className='flex items-center justify-center gap-2 p-4 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-2xl font-bold text-sm border border-amber-100 dark:border-amber-800'>
                            <AlertCircle size={18} />
                            <span>
                              Lỗi thiết bị: {scanError.message || scanError}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

const Media = ({ user }) => {
  const dispatch = useDispatch();
  const { myEvents, loading } = useSelector((state) => state.event);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    if (user) dispatch(fetchMyEvents());
  }, [dispatch, user]);

  if (selectedEvent) {
    return (
      <EventDetailView
        event={selectedEvent}
        user={user}
        onBack={() => setSelectedEvent(null)}
      />
    );
  }

  return (
    <div className='flex-1 bg-[#F8FAFC] dark:bg-gray-950 min-h-screen'>
      <div className='max-w-6xl mx-auto p-6 md:p-16'>
        <header className='mb-16'>
          <motion.h1
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className='text-6xl md:text-8xl font-black text-slate-900 dark:text-white tracking-tighter italic uppercase leading-none'>
            Cộng đồng <br />{" "}
            <span className='text-blue-600 dark:text-blue-400 underline decoration-blue-600/20 dark:decoration-blue-400/20'>
              của tôi
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className='text-slate-500 dark:text-gray-400 mt-6 text-xl md:text-2xl font-semibold tracking-tight italic'>
            Nơi kết nối đam mê thiện nguyện.
          </motion.p>
        </header>

        {loading ? (
          <div className='grid md:grid-cols-2 gap-12'>
            {[1, 2].map((n) => (
              <div
                key={n}
                className='h-96 bg-slate-200 dark:bg-gray-800 rounded-[4rem] animate-pulse'
              />
            ))}
          </div>
        ) : myEvents.length === 0 ? (
          <div className='bg-white dark:bg-gray-800 rounded-[4rem] p-24 text-center border-2 border-dashed border-slate-200 dark:border-gray-700'>
            <Calendar size={64} className='mx-auto mb-6 text-slate-300 dark:text-gray-600' />
            <p className='text-slate-400 dark:text-gray-500 text-2xl font-black uppercase tracking-tighter italic'>
              Chưa có hoạt động
            </p>
          </div>
        ) : (
          <div className='grid md:grid-cols-2 gap-12'>
            {myEvents.map((event, index) => (
              <motion.div
                key={event._id}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -15 }}
                className='group bg-white dark:bg-gray-800 rounded-[4rem] overflow-hidden shadow-sm hover:shadow-[0_40px_80px_-15px_rgba(0,0,0,0.12)] dark:hover:shadow-[0_40px_80px_-15px_rgba(0,0,0,0.5)] transition-all duration-500 border border-slate-100 dark:border-gray-700 flex flex-col h-full'>
                <div className='relative h-72 overflow-hidden bg-slate-200 dark:bg-gray-700'>
                  <img
                    src={event.image}
                    alt={event.title}
                    className='w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110'
                  />
                  <div className='absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-90' />

                  <div className='absolute bottom-8 left-10'>
                    <div className='flex items-center gap-3 text-white text-sm font-black italic tracking-widest uppercase bg-blue-600 dark:bg-blue-500 px-4 py-1.5 rounded shadow-lg ring-2 ring-blue-400/20 dark:ring-blue-500/30'>
                      <Clock size={16} />
                      {new Date(event.startDate).toLocaleDateString("vi-VN")}
                    </div>
                  </div>
                </div>

                <div className='p-12 flex-1 flex flex-col justify-between'>
                  <div>
                    <h3 className='text-3xl font-black text-slate-900 dark:text-white mb-4 line-clamp-2 leading-[1.1] tracking-tighter group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors uppercase italic'>
                      {event.title}
                    </h3>
                    <div className='flex items-center gap-2 text-slate-400 dark:text-gray-500 font-bold text-xs tracking-widest uppercase mb-10'>
                      <MapPin size={18} className='text-red-500 dark:text-red-400' />
                      {event.location}
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedEvent(event)}
                    className='w-full py-6 bg-slate-900 dark:bg-gray-700 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-blue-600 dark:hover:bg-blue-500 transition-all shadow-xl active:scale-95 shadow-slate-300 dark:shadow-gray-900 italic'>
                    {t('joinDiscussion')}
                    <ChevronRight
                      size={20}
                      className='group-hover:translate-x-1 transition-transform'
                    />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Media;
