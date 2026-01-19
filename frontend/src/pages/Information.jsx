/** @format */

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ToastContainer } from "../components/common/Toast";
import { t } from "../utils/i18n";
import {
  Eye,
  EyeOff,
  ShieldCheck,
  Bell,
  AlertCircle,
  Mail,
  Phone,
} from "lucide-react";

import {
  fetchUserProfile,
  updateUserProfile,
  deleteUser,
  changeUserPassword,
  clearMessages,
} from "../features/userSlice.js";

import defaultAvatar from "../assets/defaultAvatar.jpeg";
import { registerPush } from "../utils/pushSubscription.js";

export default function Information({ onProfileUpdate }) {
  const dispatch = useDispatch();

  // Lấy state từ Redux
  const {
    profile: reduxUser,
    message,
    error,
    profileLoading,
  } = useSelector((state) => state.user);

  const token = localStorage.getItem("token");
  const userId = token ? JSON.parse(atob(token.split(".")[1])).userId : null;

  // Local state
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [passwordModal, setPasswordModal] = useState(false);
  const [pictureFile, setPictureFile] = useState(null);
  const [picturePreview, setPicturePreview] = useState(null);
  const [toasts, setToasts] = useState([]);

  // Password state
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const addToast = (message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id) =>
    setToasts((prev) => prev.filter((t) => t.id !== id));

  useEffect(() => {
    if (reduxUser) {
      setUser(reduxUser);
    }
  }, [reduxUser]);

  // 2. Fetch user lúc đầu
  useEffect(() => {
    if (token && userId) {
      dispatch(fetchUserProfile());
    }
  }, [dispatch, userId, token]);

  // 3. Handle messages/errors toàn cục từ Redux
  useEffect(() => {
    if (message) {
      addToast(message, "success");
      dispatch(clearMessages());
    }
    if (error) {
      addToast(error, "error");
      dispatch(clearMessages());
    }
  }, [message, error, dispatch]);

  const handlePictureChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPictureFile(file);
    const url = URL.createObjectURL(file);
    setPicturePreview(url);
  };

  // --- XỬ LÝ CẬP NHẬT DÙNG SLICE ---
  const handleUpdate = async () => {
    try {
      const formData = new FormData();

      if (pictureFile) {
        formData.append("picture", pictureFile);
      }

      const pi = user.personalInformation || {};
      const nameValue = user.userName || pi.name || "";
      formData.append("userName", String(nameValue));

      if (user.phoneNumber)
        formData.append("phoneNumber", String(user.phoneNumber));

      if (pi.biography) formData.append("biography", String(pi.biography));

      const np = user.notificationPrefs || {};
      if ("emailAnnouncements" in np)
        formData.append(
          "notificationPrefs.emailAnnouncements",
          String(Boolean(np.emailAnnouncements))
        );
      if ("emailAssignments" in np)
        formData.append(
          "notificationPrefs.emailAssignments",
          String(Boolean(np.emailAssignments))
        );

      const updatedUser = await dispatch(updateUserProfile(formData)).unwrap();

      // Nếu thành công:
      if (onProfileUpdate) onProfileUpdate(updatedUser);

      // Update local storage nếu có ảnh mới
      if (
        updatedUser.profilePicture ||
        updatedUser.personalInformation?.picture
      ) {
        localStorage.setItem(
          "picture",
          updatedUser.profilePicture || updatedUser.personalInformation?.picture
        );
      }

      // Tắt chế độ edit & cleanup
      setEditing(false);
      if (picturePreview) {
        URL.revokeObjectURL(picturePreview);
        setPicturePreview(null);
      }
      setPictureFile(null);
    } catch (err) {
      addToast(
        err.response?.data?.message || "Cập nhật hồ sơ thất bại",
        "error"
      );
      setPictureFile(null);
      if (picturePreview) {
        URL.revokeObjectURL(picturePreview);
        setPicturePreview(null);
      }

      setEditing(true);
    }
  };

  // --- XỬ LÝ XÓA DÙNG SLICE ---
  const handleDelete = async () => {
    if (
      !window.confirm(
        "Bạn có chắc chắn muốn xóa tài khoản này không? Hành động này không thể hoàn tác."
      )
    )
      return;

    try {
      const targetId = user._id || user.id;

      await dispatch(deleteUser(targetId)).unwrap();
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      window.location.href = "/";
    } catch (err) {
      addToast(
        err.response?.data?.message || "Xóa tài khoản thất bại",
        "error"
      );
    }
  };

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      addToast("Vui lòng điền đầy đủ các trường mật khẩu", "warning");
      return;
    }
    if (newPassword !== confirmPassword) {
      addToast("Mật khẩu mới và xác nhận không khớp", "error");
      return;
    }

    try {
      await dispatch(
        changeUserPassword({ currentPassword: oldPassword, newPassword })
      ).unwrap();

      addToast("Đổi mật khẩu thành công!", "success");
      setPasswordModal(false);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      addToast(err || "Đổi mật khẩu thất bại", "error");
    }
  };

  if (!user)
    return <div className='p-8 text-center'>Đang tải thông tin...</div>;

  const email = user.userEmail || user.email || "—";
  const phone =
    user.phoneNumber ||
    user.personalInformation?.phoneNumber ||
    user.personalInformation?.phone ||
    "—";
  const createdAt = user.createdAt
    ? new Date(user.createdAt).toLocaleString()
    : "—";
  const updatedAt = user.updatedAt
    ? new Date(user.updatedAt).toLocaleString()
    : "—";
  const displayName =
    user.personalInformation?.name ||
    user.userName ||
    user.name ||
    "Chưa cập nhật tên";
  const biography =
    user.personalInformation?.biography ||
    "Kể câu chuyện của bạn để cộng đồng hiểu thêm về hành trình thiện nguyện.";
  const roleLabel =
    user.role === "admin" ? "Quản trị viên" : "Tình nguyện viên";

  return (
    <div className='mx-auto w-full max-w-5xl space-y-10 px-4 pb-16 dark:bg-gray-900 transition-colors'>
      <section className='relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary-600 via-primary-600 to-secondary-600 text-white shadow-xl'>
        <div
          className='pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(var(--warning-400),0.3),_transparent_55%)]'
          aria-hidden='true'
        />
        <div className='relative flex flex-col gap-8 p-8 md:flex-row md:items-center md:justify-between'>
          <div className='flex flex-col items-start gap-6 md:flex-row md:items-center md:gap-8'>
            <div className='relative h-28 w-28 shrink-0'>
              <div
                className='absolute inset-0 rounded-full bg-warning-400/40 blur-xl'
                aria-hidden='true'
              />

              {/* FIX: Ảnh hiển thị với fallback */}
              <img
                src={
                  picturePreview ||
                  user.personalInformation?.picture ||
                  user.profilePicture ||
                  defaultAvatar
                }
                alt='Ảnh hồ sơ'
                className='relative h-full w-full rounded-full border-4 border-white/70 object-cover shadow-2xl'
              />

              {editing && (
                <label className='absolute -bottom-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-2 rounded-full bg-white px-4 py-1 text-xs font-semibold uppercase tracking-wide text-blue-600 shadow-lg transition hover:bg-gray-100 cursor-pointer'>
                  <input
                    type='file'
                    accept='image/*'
                    onChange={handlePictureChange}
                    className='hidden'
                  />
                  Cập nhật ảnh
                </label>
              )}
            </div>

            <div className='flex flex-col gap-2 text-sm items-start'>
              <span className='inline-flex items-center rounded-full bg-white/25 dark:bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white'>
                {roleLabel}
              </span>
              <h1 className='text-3xl font-extrabold md:text-4xl text-white'>
                {displayName}
              </h1>
              <div className='flex flex-col gap-4 text-sm'>
                <span className='inline-flex items-center gap-2 rounded-full bg-white/20 dark:bg-white/10 px-3 py-1 text-white'>
                  <Mail className='h-4 w-4' />
                  Email: {email}
                </span>
                {/* FIX: Hiển thị SĐT */}

                <span className='inline-flex items-center gap-2 rounded-full bg-white/20 dark:bg-white/10 px-3 py-1 text-white'>
                  <Phone className='h-4 w-4' />
                  {t('profile')}: {phone}
                </span>
              </div>
              <p className='text-sm leading-relaxed text-white/90'>
                {biography}
              </p>
            </div>
          </div>

          <div className='flex flex-wrap items-center gap-3'>
            {!editing ? (
              <button
                type='button'
                onClick={() => setEditing(true)}
                className='inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-blue-600 shadow-lg transition hover:shadow-xl hover:bg-gray-50'>
                Chỉnh sửa hồ sơ
              </button>
            ) : (
              <button
                type='button'
                onClick={handleUpdate}
                disabled={profileLoading}
                className='inline-flex items-center gap-2 rounded-full bg-yellow-400 px-5 py-2.5 text-sm font-semibold text-gray-900 shadow-lg transition hover:shadow-xl hover:bg-yellow-500 disabled:opacity-70'>
                {profileLoading ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
            )}
            <button
              type='button'
              onClick={() => setPasswordModal(true)}
              className='inline-flex items-center gap-2 rounded-full bg-white/20 border border-white px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/30'>
              Đổi mật khẩu
            </button>

            <button
              type='button'
              onClick={registerPush}
              className='inline-flex items-center gap-2 rounded-full bg-green-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:bg-green-700'>
              Đăng ký thông báo
            </button>

            <button
              type='button'
              onClick={handleDelete}
              className='inline-flex items-center gap-2 rounded-full bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:bg-red-700'>
              Xoá tài khoản
            </button>
          </div>
        </div>
      </section>

      <section className='rounded-3xl border border-gray-200 bg-white p-8 shadow-lg'>
        <div className='grid gap-8 lg:grid-cols-[1.2fr_0.8fr]'>
          <div className='space-y-6'>
            <div className='space-y-2'>
              <h2 className='font-heading text-2xl font-bold text-gray-900'>
                Thông tin cá nhân
              </h2>
              <p className='text-sm text-gray-600'>
                Cập nhật tên hiển thị và chia sẻ câu chuyện của bạn để truyền
                cảm hứng cho cộng đồng.
              </p>
            </div>

            <div className='space-y-5'>
              <div className='space-y-2'>
                <label className='text-sm font-semibold uppercase tracking-wide text-gray-600'>
                  Họ và tên
                </label>
                <input
                  type='text'
                  value={user.userName || user.personalInformation?.name || ""}
                  readOnly={!editing}
                  onChange={(e) =>
                    setUser({ ...user, userName: e.target.value })
                  }
                  className={`w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-base text-gray-900 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 ${
                    !editing
                      ? "cursor-not-allowed bg-gray-100 text-gray-500"
                      : ""
                  }`}
                  placeholder='Nhập tên của bạn'
                />
              </div>

              {/* FIX: Input SĐT */}
              <div className='space-y-2'>
                <label className='text-sm font-semibold uppercase tracking-wide text-gray-600'>
                  Số điện thoại
                </label>
                <input
                  type='tel'
                  value={user.phoneNumber || ""}
                  readOnly={!editing}
                  onChange={(e) =>
                    setUser({ ...user, phoneNumber: e.target.value })
                  }
                  className={`w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-base text-gray-900 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 ${
                    !editing
                      ? "cursor-not-allowed bg-gray-100 text-gray-500"
                      : ""
                  }`}
                  placeholder='Nhập số điện thoại'
                />
              </div>

              <div className='space-y-2'>
                <label className='text-sm font-semibold uppercase tracking-wide text-gray-600'>
                  Giới thiệu bản thân
                </label>
                <textarea
                  rows={5}
                  value={user.personalInformation?.biography || ""}
                  readOnly={!editing}
                  onChange={(e) =>
                    setUser({
                      ...user,
                      personalInformation: {
                        ...(user.personalInformation || {}),
                        biography: e.target.value,
                      },
                    })
                  }
                  className={`w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-base leading-relaxed text-gray-900 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 ${
                    !editing
                      ? "cursor-not-allowed bg-gray-100 text-gray-500"
                      : ""
                  }`}
                  placeholder='Chia sẻ kinh nghiệm, đam mê và mong muốn đóng góp của bạn.'
                />
              </div>
            </div>

            {/* Notification Prefs */}
            <div className='space-y-4'>
              <h3 className='flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-gray-600'>
                <Bell className='h-4 w-4 text-blue-600' /> Thông báo
              </h3>
              <div className='grid gap-3 md:grid-cols-2'>
                <label
                  className={`flex items-start gap-3 rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 transition ${
                    editing
                      ? "hover:border-blue-400 cursor-pointer"
                      : "cursor-not-allowed opacity-70"
                  }`}>
                  <input
                    type='checkbox'
                    checked={Boolean(
                      user.notificationPrefs?.emailAnnouncements
                    )}
                    disabled={!editing}
                    onChange={(e) =>
                      setUser({
                        ...user,
                        notificationPrefs: {
                          ...(user.notificationPrefs || {}),
                          emailAnnouncements: e.target.checked,
                        },
                      })
                    }
                    className='mt-1 h-4 w-4 rounded border-gray-400 text-blue-600 focus:ring-blue-500'
                  />
                  <span>
                    Nhận email về sự kiện mới, cập nhật dự án và câu chuyện tác
                    động.
                  </span>
                </label>
                <label
                  className={`flex items-start gap-3 rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 transition ${
                    editing
                      ? "hover:border-blue-400 cursor-pointer"
                      : "cursor-not-allowed opacity-70"
                  }`}>
                  <input
                    type='checkbox'
                    checked={Boolean(user.notificationPrefs?.emailAssignments)}
                    disabled={!editing}
                    onChange={(e) =>
                      setUser({
                        ...user,
                        notificationPrefs: {
                          ...(user.notificationPrefs || {}),
                          emailAssignments: e.target.checked,
                        },
                      })
                    }
                    className='mt-1 h-4 w-4 rounded border-gray-400 text-blue-600 focus:ring-blue-500'
                  />
                  <span>
                    Thông báo khi bạn được phân công nhiệm vụ hoặc cần xác nhận
                    tham gia.
                  </span>
                </label>
              </div>
            </div>
          </div>

          <div className='flex flex-col gap-6'>
            <div className='rounded-3xl border border-gray-200 bg-gray-50 p-6'>
              <h3 className='flex items-center gap-2 text-base font-semibold text-gray-900'>
                <ShieldCheck className='h-5 w-5 text-blue-600' /> Thông tin tài
                khoản
              </h3>
              <div className='mt-4 space-y-3 text-sm text-gray-600'>
                <div>
                  <span className='font-semibold text-gray-900'>Email:</span>{" "}
                  {email}
                </div>
                <div>
                  <span className='font-semibold text-gray-900'>
                    Mã tài khoản:
                  </span>{" "}
                  {user._id || user.id || "—"}
                </div>
                <div>
                  <span className='font-semibold text-gray-900'>Ngày tạo:</span>{" "}
                  {createdAt}
                </div>
                <div>
                  <span className='font-semibold text-gray-900'>
                    Cập nhật gần nhất:
                  </span>{" "}
                  {updatedAt}
                </div>
              </div>
            </div>

            <div className='rounded-3xl border border-yellow-300 bg-yellow-50 p-6 text-sm text-gray-800'>
              <div className='flex items-start gap-3'>
                <AlertCircle className='mt-1 h-5 w-5 text-yellow-600' />
                <div className='space-y-2'>
                  <h4 className='font-semibold text-gray-900'>Lưu ý bảo mật</h4>
                  <p>
                    Thay đổi mật khẩu định kỳ và giữ thông tin liên hệ luôn cập
                    nhật để chúng tôi có thể liên lạc khi cần.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modal Đổi Mật Khẩu */}
      {passwordModal && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'>
          <div className='relative w-full max-w-md overflow-hidden rounded-3xl border border-gray-200 bg-white p-6 shadow-2xl'>
            <button
              type='button'
              onClick={() => setPasswordModal(false)}
              className='absolute right-4 top-4 text-gray-400 transition hover:text-gray-600'
              aria-label='Đóng'>
              ✕
            </button>
            <div className='mb-6 space-y-2'>
              <h2 className='font-heading text-2xl font-bold text-gray-900'>
                Đổi mật khẩu
              </h2>
              <p className='text-sm text-gray-600'>
                Đảm bảo mật khẩu mới đủ mạnh với tối thiểu 6 ký tự.
              </p>
            </div>
            {[
              {
                label: "Mật khẩu hiện tại",
                value: oldPassword,
                setValue: setOldPassword,
                show: showOld,
                setShow: setShowOld,
              },
              {
                label: "Mật khẩu mới",
                value: newPassword,
                setValue: setNewPassword,
                show: showNew,
                setShow: setShowNew,
              },
              {
                label: "Xác nhận mật khẩu",
                value: confirmPassword,
                setValue: setConfirmPassword,
                show: showConfirm,
                setShow: setShowConfirm,
              },
            ].map((field, i) => (
              <div key={i} className='relative mb-4'>
                <label className='mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-600'>
                  {field.label}
                </label>
                <input
                  type={field.show ? "text" : "password"}
                  value={field.value}
                  onChange={(e) => field.setValue(e.target.value)}
                  className='w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-base text-gray-900 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10'
                />
                <button
                  type='button'
                  onClick={() => field.setShow((s) => !s)}
                  className='absolute right-4 top-9 text-gray-400 transition hover:text-gray-600'>
                  {field.show ? (
                    <EyeOff className='h-5 w-5' />
                  ) : (
                    <Eye className='h-5 w-5' />
                  )}
                </button>
              </div>
            ))}
            <button
              onClick={handleChangePassword}
              className='mt-2 w-full rounded-full bg-gradient-to-r from-primary-600 to-secondary-600 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:shadow-xl'>
              Cập nhật mật khẩu
            </button>
          </div>
        </div>
      )}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}
