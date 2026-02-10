import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

export default function StudioTypeCard({ datacard, ...props }) {
  return (
    <Swiper
      modules={[Navigation]}
      navigation
      breakpoints={{
        0: {
          slidesPerView: 1,
          slidesPerGroup: 1,
          spaceBetween: 16,
          slidesOffsetBefore: 20,
          slidesOffsetAfter: 20,
        },
        768: {
          slidesPerView: 2,
          slidesPerGroup: 2,
          spaceBetween: 20,
          slidesOffsetBefore: 40,
          slidesOffsetAfter: 40,
        },
        1024: {
          slidesPerView: 3,
          slidesPerGroup: 3,
          spaceBetween: 20,
          slidesOffsetBefore: 40,
          slidesOffsetAfter: 40,
        },
      }}
      className="mt-4 md:mt-5"
      {...props}
    >
      {datacard.map((dc, index) => (
        <SwiperSlide key={index}>
          <div className="relative rounded-myrad  overflow-hidden aspect-3/2">
            <img src={dc.image} alt="" className="w-full h-full object-cover" />

            <div className="absolute bottom-0 left-0 w-full p-3.5 pt-5 bg-linear-to-t from-black to-black/0">
              <p className="font-bold">{dc.name}</p>
              <p className="text-sm text-tx-light/74 mt-1">{dc.description}</p>
            </div>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
