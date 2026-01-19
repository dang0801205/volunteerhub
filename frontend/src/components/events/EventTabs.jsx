/** @format */

import React from "react";
import { t } from "../../utils/i18n";
import {
  MessageSquare,
  Info,
  Users,
  ImageIcon,
  Star,
  QrCodeIcon,
} from "lucide-react";

const getTabsConfig = () => [
  {
    id: "discussion",
    label: t('discussion'),
    icon: MessageSquare,
    badge: null,
  },
  {
    id: "reviews",
    label: t('reviews'),
    icon: Star,
    badge: null,
  },
  {
    id: "about",
    label: t('about'),
    icon: Info,
    badge: null,
  },
  {
    id: "members",
    label: t('members'),
    icon: Users,
    badge: null,
  },
  {
    id: "attendance",
    label: t('attendance'),
    icon: Users,
    badge: null,
  },
  {
    id: "media",
    label: t('media'),
    icon: ImageIcon,
    badge: null,
  },
  {
    id: "qr",
    label: t('qrCode'),
    icon: QrCodeIcon,
    badge: null,
  },
];

const EventTabs = ({ activeTab, setActiveTab, badgeCounts = {} }) => {
  const TABS_CONFIG = getTabsConfig();
  
  return (
    <div className='bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <nav className='flex items-center gap-1 py-2 overflow-x-auto no-scrollbar'>
          {TABS_CONFIG.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const count = badgeCounts[tab.id] || tab.badge;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2.5 px-5 py-3 text-sm font-medium rounded-lg transition-all whitespace-nowrap relative
                  ${
                    isActive
                      ? "bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm border border-gray-200 dark:border-gray-600"
                      : "text-gray-600 dark:text-gray-400 hover:bg-white/80 dark:hover:bg-gray-700/80 hover:text-gray-900 dark:hover:text-gray-200"
                  }`}>
                <Icon
                  className={`w-4.5 h-4.5 ${
                    isActive ? "text-primary-600" : "text-gray-500"
                  }`}
                />
                <span>{tab.label}</span>

                {count > 0 && (
                  <span className='absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1.5 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full'>
                    {count > 99 ? "99+" : count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default EventTabs;
