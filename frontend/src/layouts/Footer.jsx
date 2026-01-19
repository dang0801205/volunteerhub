/** @format */

import React from "react";
import { Facebook, Instagram, Linkedin, Youtube } from "lucide-react";

const Footer = () => {
  return (
    <footer className='border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400 py-5 text-xs transition-colors'>
      <div className='mx-auto max-w-7xl px-4'>
        <div className='flex flex-col md:flex-row md:justify-between gap-8 md:gap-12'>
          <div className='md:w-1/3 flex flex-col justify-between'>
            <div>
              <h3 className='text-base font-bold text-gray-900 dark:text-white mb-2'>
                VolunteerHub
              </h3>
              <p className='text-gray-500 dark:text-gray-400 leading-relaxed mb-4 max-w-xs'>
                Kết nối trái tim nhân ái, tạo nên thay đổi tích cực cho cộng
                đồng.
              </p>
            </div>

            <div className='flex gap-3'>
              <SocialLink icon={<Facebook size={16} />} />
              <SocialLink icon={<Instagram size={16} />} />
              <SocialLink icon={<Linkedin size={16} />} />
              <SocialLink icon={<Youtube size={16} />} />
            </div>
          </div>

          <div className='md:w-2/3 grid grid-cols-3 gap-4'>
            <div>
              <h4 className='font-semibold text-gray-900 dark:text-white mb-2'>
                Về chúng tôi
              </h4>
              <ul className='space-y-1'>
                <FooterLink href='/about'>Sứ mệnh</FooterLink>
                <FooterLink href='/blog'>Tin tức</FooterLink>
                <FooterLink href='/contact'>Liên hệ</FooterLink>
              </ul>
            </div>

            <div>
              <h4 className='font-semibold text-gray-900 dark:text-white mb-2'>Tình nguyện</h4>
              <ul className='space-y-1'>
                <FooterLink href='/search'>Tìm cơ hội</FooterLink>
                <FooterLink href='/login'>Đăng nhập</FooterLink>
                <FooterLink href='/register'>Đăng ký</FooterLink>
              </ul>
            </div>

            <div>
              <h4 className='font-semibold text-gray-900 dark:text-white mb-2'>Tổ chức</h4>
              <ul className='space-y-1'>
                <FooterLink href='/org/new'>Đăng tin</FooterLink>
                <FooterLink href='/org/guide'>Hướng dẫn</FooterLink>
                <FooterLink href='/partners'>Đối tác</FooterLink>
              </ul>
            </div>
          </div>
        </div>

        <div className='mt-6 pt-3 border-t border-border text-center text-text-muted text-[10px] uppercase tracking-wide'>
          © {new Date().getFullYear()} VolunteerHub. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

const FooterLink = ({ href, children }) => (
  <li>
    <a
      href={href}
      className='hover:text-primary-600 dark:hover:text-primary-400 transition-colors block py-0.5'>
      {children}
    </a>
  </li>
);

const SocialLink = ({ icon }) => (
  <a
    href='#'
    className='text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors bg-white dark:bg-gray-800 p-1.5 rounded-full border border-gray-200 dark:border-gray-700 hover:border-primary-600 dark:hover:border-primary-400'>
    {icon}
  </a>
);

export default Footer;
