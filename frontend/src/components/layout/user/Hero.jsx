import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

import { useState } from "react";

import HeroSlide from "../../user/HeroSlide";

export default function Hero({ data }) {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section className="w-full h-[80dvh] md:h-auto md:aspect-video rounded-b-myrad overflow-hidden">
      <Swiper
        pagination={{ clickable: true }}
        modules={[Autoplay, Pagination]}
        autoplay={{
          delay: 60000,
          disableOnInteraction: false,
          pauseOnMouseEnter: false,
        }}
        speed={800}
        onSlideChange={(s) => {
          setActiveIndex(s.realIndex);
        }}
        className="w-full h-full  "
      >
        {data.map((d, index) => {
          return (
            <SwiperSlide key={index} className=" bg-card-dark">
              <HeroSlide data={d} isActive={activeIndex === index} />
            </SwiperSlide>
          );
        })}
      </Swiper>
    </section>
  );
}
