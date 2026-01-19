/** @format */

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Moon,
  Sun,
  Download,
  Calendar,
  FileJson,
  FileSpreadsheet,
  Bell,
  Globe,
  Smartphone,
  Zap,
  Settings as SettingsIcon,
} from "lucide-react";
import { ToastContainer } from "../components/common/Toast";
import { toggleDarkMode, getTheme } from "../utils/darkMode";
import { exportToCSV, exportToJSON, exportUserProfile } from "../utils/exportHelpers";
import { useSelector, useDispatch } from "react-redux";
import { registerPush } from "../utils/pushSubscription";
import { fetchMyRegistrations } from "../features/registrationSlice";
import { t } from "../utils/i18n";

export default function Settings() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user);
  const { myRegistrations = [] } = useSelector((state) => state.registration);

  const [theme, setTheme] = useState(getTheme());
  const [language, setLanguage] = useState(localStorage.getItem('language') || 'vi');
  const [toasts, setToasts] = useState([]);
  const [forceUpdate, setForceUpdate] = useState(0);

  const addToast = (message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id) =>
    setToasts((prev) => prev.filter((t) => t.id !== id));

  useEffect(() => {
    const currentTheme = getTheme();
    setTheme(currentTheme);
    
    // Fetch user registrations
    if (user) {
      dispatch(fetchMyRegistrations());
    }
  }, [dispatch, user]);

  const handleThemeToggle = () => {
    const newTheme = toggleDarkMode();
    setTheme(newTheme);
    addToast(
      newTheme === 'dark' ? t('darkModeEnabled') : t('darkModeDisabled'),
      'success'
    );
  };

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
    setForceUpdate(prev => prev + 1); // Force re-render to update translations
    addToast(
      t('languageChanged'),
      'success'
    );
    // Reload page to apply translations everywhere
    setTimeout(() => window.location.reload(), 500);
  };

  const handleExportProfile = (format) => {
    try {
      if (!user) {
        addToast('Không tìm thấy thông tin người dùng', 'error');
        return;
      }

      const profileData = exportUserProfile(user, myRegistrations, []);
      
      if (format === 'json') {
        exportToJSON(profileData, `profile_${user.userName}_${Date.now()}.json`);
        addToast('Đã xuất dữ liệu JSON thành công', 'success');
      } else if (format === 'csv') {
        // Convert to flat structure for CSV
        const flatData = [{
          userName: user.userName || '',
          email: user.userEmail || '',
          role: user.role || '',
          status: user.status || '',
          eventsCompleted: user.eventsCompleted || 0,
          totalHours: user.totalHours || 0,
          createdAt: user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : '',
        }];
        exportToCSV(flatData, `profile_${user.userName}_${Date.now()}.csv`);
        addToast('Đã xuất dữ liệu CSV thành công', 'success');
      }
    } catch (error) {
      console.error('Export error:', error);
      addToast('Lỗi khi xuất dữ liệu: ' + error.message, 'error');
    }
  };

  const handleExportRegistrations = (format) => {
    try {
      if (!myRegistrations || myRegistrations.length === 0) {
        addToast('Bạn chưa có đăng ký nào', 'info');
        return;
      }

      const regData = myRegistrations.map(reg => ({
        eventTitle: reg.eventId?.title || 'N/A',
        status: reg.status || '',
        registeredDate: reg.createdAt ? new Date(reg.createdAt).toLocaleDateString('vi-VN') : 'N/A',
        eventDate: reg.eventId?.startDate ? new Date(reg.eventId.startDate).toLocaleDateString('vi-VN') : 'N/A',
      }));

      if (format === 'json') {
        exportToJSON(regData, `registrations_${Date.now()}.json`);
        addToast('Đã xuất danh sách đăng ký (JSON)', 'success');
      } else if (format === 'csv') {
        exportToCSV(regData, `registrations_${Date.now()}.csv`);
        addToast('Đã xuất danh sách đăng ký (CSV)', 'success');
      }
    } catch (error) {
      console.error('Export registrations error:', error);
      addToast('Lỗi khi xuất danh sách: ' + error.message, 'error');
    }
  };

  const settingsGroups = [
    {
      title: t('appearance'),
      icon: Moon,
      items: [
        {
          label: t('darkMode'),
          description: t('darkModeDesc'),
          action: (
            <button
              onClick={handleThemeToggle}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                theme === 'dark' ? 'bg-blue-600' : 'bg-gray-300'
              }`}>
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${
                  theme === 'dark' ? 'translate-x-7' : 'translate-x-1'
                }`}>
                {theme === 'dark' ? (
                  <Moon className="w-4 h-4 text-blue-600 m-auto mt-1" />
                ) : (
                  <Sun className="w-4 h-4 text-amber-500 m-auto mt-1" />
                )}
              </span>
            </button>
          ),
        },
        {
          label: t('language'),
          description: t('languageDesc'),
          action: (
            <div className="flex gap-2">
              <button
                onClick={() => handleLanguageChange('vi')}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition ${
                  language === 'vi'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}>
                🇻🇳 Tiếng Việt
              </button>
              <button
                onClick={() => handleLanguageChange('en')}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition ${
                  language === 'en'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}>
                🇬🇧 English
              </button>
            </div>
          ),
        },
      ],
    },
    {
      title: t('notifications'),
      icon: Bell,
      items: [
        {
          label: t('pushNotifications'),
          description: t('pushNotificationsDesc'),
          action: (
            <button
              onClick={() => {
                registerPush();
                addToast(t('notificationsEnabled'), 'success');
              }}
              className="px-4 py-2 rounded-lg bg-green-600 text-white font-semibold text-sm hover:bg-green-700 transition flex items-center gap-2">
              <Smartphone className="w-4 h-4" />
              {t('enableNotifications')}
            </button>
          ),
        },
      ],
    },
    {
      title: t('exportData'),
      icon: Download,
      items: [
        {
          label: t('exportProfile'),
          description: t('exportProfileDesc'),
          action: (
            <div className="flex gap-2">
              <button
                onClick={() => handleExportProfile('json')}
                className="px-4 py-2 rounded-lg bg-amber-600 text-white font-semibold text-sm hover:bg-amber-700 transition flex items-center gap-2">
                <FileJson className="w-4 h-4" />
                JSON
              </button>
              <button
                onClick={() => handleExportProfile('csv')}
                className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700 transition flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4" />
                CSV
              </button>
            </div>
          ),
        },
        {
          label: t('exportRegistrations'),
          description: t('exportRegistrationsDesc'),
          action: (
            <div className="flex gap-2">
              <button
                onClick={() => handleExportRegistrations('json')}
                className="px-4 py-2 rounded-lg bg-amber-600 text-white font-semibold text-sm hover:bg-amber-700 transition flex items-center gap-2">
                <FileJson className="w-4 h-4" />
                JSON
              </button>
              <button
                onClick={() => handleExportRegistrations('csv')}
                className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700 transition flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4" />
                CSV
              </button>
            </div>
          ),
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 transition-colors">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl">
              <SettingsIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('settingsTitle')}</h1>
              <p className="text-gray-500 dark:text-gray-400">{t('settingsSubtitle')}</p>
            </div>
          </div>
        </div>

        {/* Settings Groups */}
        <div className="space-y-6">
          {settingsGroups.map((group, index) => (
            <motion.div
              key={group.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-3 mb-6">
                <group.icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{group.title}</h2>
              </div>

              <div className="space-y-6">
                {group.items.map((item, itemIndex) => (
                  <div
                    key={itemIndex}
                    className="flex items-center justify-between pb-6 border-b border-gray-100 dark:border-gray-700 last:border-0 last:pb-0">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                        {item.label}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{item.description}</p>
                    </div>
                    <div className="ml-4">{item.action}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6">
          <div className="flex items-start gap-3">
            <Zap className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                {t('tipsTitle')}
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                {t('tipsDesc')}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}
