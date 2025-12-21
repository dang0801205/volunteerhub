/** @format */

import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import { Quote } from "lucide-react";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

const testimonials = [
  {
    quote:
      "Tham gia VolunteerHub là một trong những quyết định tuyệt vời nhất của tôi. Tôi không chỉ được giúp đỡ cộng đồng mà còn học hỏi và kết nối với những người bạn tuyệt vời.",
    name: "Nguyễn An Nhiên",
    project: "Dự án Mùa Hè Xanh 2023",
    image: "https://placehold.co/600x400/a8d0e6/005a9c?text=Hoạt+Động+1",
  },
  {
    quote:
      "Mỗi cuối tuần, tôi lại mong chờ đến ngày được tham gia hoạt động. Năng lượng và sự nhiệt huyết ở đây thật sự truyền cảm hứng.",
    name: "Trần Minh Khang",
    project: "Chương trình Bữa Cơm Yêu Thương",
    image: "https://placehold.co/600x400/f4a261/ffffff?text=Hoạt+Động+2",
  },
  {
    quote:
      "Tôi đã trưởng thành hơn rất nhiều qua các dự án. Cảm ơn VolunteerHub đã cho tôi cơ hội để cống hiến và phát triển bản thân.",
    name: "Lê Thuỳ Linh",
    project: "Lớp học Tình thương",
    image: "https://placehold.co/600x400/2a9d8f/ffffff?text=Hoạt+Động+3",
  },
  {
    quote:
      "Ban đầu tôi chỉ định tham gia cho vui, nhưng không ngờ lại gắn bó đến vậy. Môi trường ở đây thật sự ấm áp và đầy ý nghĩa.",
    name: "Phạm Gia Hân",
    project: "Dự án Dọn dẹp Bờ biển",
    image: "https://placehold.co/600x400/e76f51/ffffff?text=Hoạt+Động+4",
  },
];

export default function Slider() {
  return (
    <div className='w-full py-16 sm:py-20 bg-surface-base'>
      <div className='container mx-auto px-4'>
        <div className='text-center mb-12'>
          <h2 className='text-3xl sm:text-4xl font-bold text-text-main'>
            Khoảnh khắc & Cảm nhận
          </h2>
          <p className='mt-4 text-lg text-text-secondary max-w-2xl mx-auto'>
            Lắng nghe chia sẻ từ những tình nguyện viên đã và đang đồng hành
            cùng chúng tôi trên hành trình tạo nên sự thay đổi.
          </p>
        </div>

        <Swiper
          spaceBetween={30}
          centeredSlides={true}
          loop={true}
          autoplay={{
            delay: 4000,
            disableOnInteraction: false,
          }}
          pagination={{
            clickable: true,
          }}
          navigation={true}
          modules={[Autoplay, Pagination, Navigation]}
          className='mySwiper rounded-2xl shadow-xl'>
          {testimonials.map((item, index) => (
            <SwiperSlide key={index}>
              <div className='flex flex-col md:flex-row bg-surface-base'>
                {/* Hình ảnh nền */}
                {/* Cột 1: Hình ảnh */}
                <div className='w-full md:w-5/12 h-64 md:h-auto'>
                  <img
                    src={item.image}
                    alt={item.project}
                    className='w-full h-full object-cover'
                  />
                </div>
                {/* Cột 2: Nội dung cảm nghĩ */}
                <div className='w-full md:w-7/12 p-8 md:p-12 relative flex flex-col justify-center'>
                  <Quote className='absolute top-6 left-6 w-20 h-20 text-accent-100 z-0' />

                  <div className='relative z-10'>
                    <p className='text-base sm:text-lg italic text-text-secondary mb-6 whitespace-pre-line'>
                      {item.quote}
                    </p>

                    <div className='font-bold text-lg text-accent-600'>
                      {item.name}
                    </div>
                    <div className='text-sm text-text-muted'>
                      {item.project}
                    </div>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
}
