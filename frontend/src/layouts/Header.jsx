/** @format */

import { motion } from "framer-motion";
import { t } from "../utils/i18n";
import {
  Users,
  Sparkles,
  LogOut,
  LogIn,
  Menu,
  X,
  Home as HomeIcon,
  Info as InfoIcon,
  Calendar,
  ShieldCheck,
  History,
  Settings,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { fullUrl } from "../api.js";
import { Link, useLocation } from "react-router-dom";
import NotificationBell from "../components/common/NotificationBell";

export default function Header({ setAuthModal, user, handleLogout, PAGES }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const location = useLocation();
  const profileRef = useRef(null);
  const token = !!user;
  const picture =
    user?.personalInformation?.picture ||
    user?.profilePicture ||
    user?.picture ||
    null;
  const displayName =
    user?.personalInformation?.name || user?.userName || user?.name || "";
  const roleLabel = user?.role
    ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
    : "";

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setProfileOpen(false);
  }, [location.pathname]);

  const defaultPages = [
    token
      ? { key: t('dashboard'), path: "/dashboard", icon: HomeIcon }
      : { key: t('home'), path: "/", icon: HomeIcon },
    { key: t('events'), path: "/events", icon: Calendar },
    { key: t('about'), path: "/about", icon: InfoIcon },
    ...(token ? [{ key: t('socialMedia'), path: "/media", icon: Users }] : []),
    ...(token && user?.role === "admin"
      ? [{ key: "Admin", path: "/admin/dashboard", icon: ShieldCheck }]
      : []),
    ...(token && user?.role === "manager"
      ? [{ key: "Manager", path: "/manager/dashboard", icon: ShieldCheck }]
      : []),
  ];
  PAGES = PAGES && PAGES.length ? PAGES : defaultPages;
  return (
    <header className='sticky top-0 z-30 border-b border-border/30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/70 dark:supports-[backdrop-filter]:bg-gray-900/70 transition-colors'>
      <div className='mx-auto flex h-16 max-w-7xl items-center justify-between px-3 sm:px-6 lg:px-8'>
        {/* Logo */}
        <div className='flex items-center gap-3'>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}>
            <div className='relative'>
              <Sparkles className='absolute -top-2 -right-2 h-4 w-4 text-warning-500' />
              <img
                src='/logo.svg'
                alt='VolunteerHub Logo'
                className='h-9 w-9 drop-shadow-lg'
              />
            </div>
          </motion.div>
          <div>
            <p className='bg-gradient-to-r from-primary-600 via-secondary-500 to-warning-500 bg-clip-text text-xl font-extrabold text-transparent'>
              VolunteerHub
            </p>
            <h1 className='text-xs uppercase tracking-[0.4em] text-text-muted'>
              for community
            </h1>
          </div>
        </div>

        {/* Right buttons */}
        <div className='flex items-center gap-2'>
          <nav className='hidden md:flex items-center gap-1'>
            {PAGES.map((page) => {
              if (page.requiresAuth && !token) {
                return null;
              }
              const isActive = location.pathname === page.path;
              const Icon = page.icon;
              return (
                <Link
                  key={page.key}
                  to={page.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-medium transition ${
                    isActive
                      ? "bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 shadow-sm"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                  }`}>
                  <Icon className='h-4 w-4' />
                  <span>{page.key}</span>
                </Link>
              );
            })}
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className='rounded-xl p-2 text-gray-600 dark:text-gray-300 transition hover:bg-gray-100 dark:hover:bg-gray-800 md:hidden'>
            {mobileMenuOpen ? (
              <X className='h-6 w-6' />
            ) : (
              <Menu className='h-6 w-6' />
            )}
          </button>
          {token ? (
            <div className='flex items-center gap-3'>
              <NotificationBell user={user} />
              <div className='relative' ref={profileRef}>
                <button
                  type='button'
                  onClick={() => setProfileOpen((open) => !open)}
                  aria-haspopup='true'
                  aria-expanded={profileOpen}
                  className='flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-primary-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm transition hover:border-primary-500 dark:hover:border-primary-400'>
                  {picture ? (
                    <img
                      src={fullUrl(picture)}
                      alt='Ảnh đại diện'
                      className='h-full w-full object-cover'
                    />
                  ) : (
                    <span className='text-sm font-semibold text-gray-600 dark:text-gray-300'>
                      {displayName ? displayName.charAt(0).toUpperCase() : "U"}
                    </span>
                  )}
                </button>

                {profileOpen && (
                  <div className='absolute right-0 z-40 mt-3 w-64 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-xl'>
                    <div className='flex items-start gap-3'>
                      <div className='h-12 w-12 overflow-hidden rounded-full border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-700'>
                        {picture ? (
                          <img
                            src={fullUrl(picture)}
                            alt='Ảnh đại diện'
                            className='h-full w-full object-cover'
                          />
                        ) : (
                          <div className='flex h-full w-full items-center justify-center text-sm font-semibold text-gray-500 dark:text-gray-400'>
                            {displayName
                              ? displayName.charAt(0).toUpperCase()
                              : "U"}
                          </div>
                        )}
                      </div>
                      <div className='min-w-0'>
                        <p className='truncate text-sm font-semibold text-gray-900 dark:text-white'>
                          {displayName || "Tài khoản"}
                        </p>
                        {roleLabel ? (
                          <p className='text-xs font-medium text-blue-600 dark:text-blue-400'>
                            {roleLabel}
                          </p>
                        ) : null}
                        <p className='truncate text-xs text-gray-500'>
                          {user.userEmail || user.email}
                        </p>
                      </div>
                    </div>

                    <div className='mt-4 space-y-2 text-sm'>
                      <Link
                        to='/information'
                        onClick={() => setProfileOpen(false)}
                        className='block rounded-xl bg-gray-100 dark:bg-gray-700 px-3 py-2 font-medium text-gray-700 dark:text-gray-200 transition hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-700 dark:hover:text-blue-400'>
                        {t('profile')}
                      </Link>
                      <Link
                        to='/history'
                        onClick={() => setProfileOpen(false)}
                        className='flex items-center gap-2 rounded-xl bg-gray-100 dark:bg-gray-700 px-3 py-2 font-medium text-gray-700 dark:text-gray-200 transition hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-700 dark:hover:text-blue-400'>
                        <History className='h-4 w-4' />
                        {t('history')}
                      </Link>
                      <Link
                        to='/settings'
                        onClick={() => setProfileOpen(false)}
                        className='flex items-center gap-2 rounded-xl bg-gray-100 dark:bg-gray-700 px-3 py-2 font-medium text-gray-700 dark:text-gray-200 transition hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-700 dark:hover:text-blue-400'>
                        <Settings className='h-4 w-4' />
                        {t('settings')}
                      </Link>
                      <button
                        type='button'
                        onClick={() => {
                          setProfileOpen(false);
                          handleLogout();
                        }}
                        className='flex items-center gap-2 w-full justify-center px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 transition text-sm font-medium'>
                        <LogOut className='h-4 w-4' /> {t('logout')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <>
              <button
                onClick={() => setAuthModal("login")}
                className='flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-medium text-text-secondary hover:bg-surface-50 transition'>
                <LogIn className='h-4 w-4' />
                {t('login')}
              </button>

              <button
                onClick={() => setAuthModal("register")}
                className='flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-medium text-white bg-gradient-to-r from-secondary-500 via-secondary-600 to-warning-500 hover:shadow-lg transition border-none'>
                {t('register')}
              </button>
            </>
          )}
        </div>
      </div>
      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className='absolute left-0 right-0 top-16 border-b border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl shadow-lg md:hidden'>
          <nav className='px-4 py-3 space-y-2'>
            {PAGES.map((page) => {
              if (page.requiresAuth && !token) {
                return null;
              }
              const isActive = location.pathname === page.path;
              const Icon = page.icon;
              return (
                <Link
                  key={page.key}
                  to={page.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 font-medium transition ${
                    isActive
                      ? "bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}>
                  <Icon className='h-5 w-5' />
                  <span>{page.key}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
