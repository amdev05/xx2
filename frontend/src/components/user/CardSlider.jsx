import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

import { formatDuration } from "../../utils/formatDuration";

export default function CardSlider({ datacard, ...props }) {
  // Format release date
  const formatReleaseDate = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Check if movie is released
  const isReleased = (releaseDate) => {
    if (!releaseDate) return true;
    const release = new Date(releaseDate);
    const today = new Date();
    return release <= today;
  };

  return (
    <>
      <Swiper
        modules={[Navigation]}
        // speed={500}
        breakpoints={{
          0: {
            slidesPerView: 2.2,
            slidesPerGroup: 2,
            spaceBetween: 16,
            slidesOffsetBefore: 20,
            slidesOffsetAfter: 20,
          },
          768: {
            slidesPerView: 4,
            slidesPerGroup: 4,
            spaceBetween: 20,
            slidesOffsetBefore: 40,
            slidesOffsetAfter: 40,
          },
          1024: {
            slidesPerView: 6,
            slidesPerGroup: 6,
            spaceBetween: 20,
            slidesOffsetBefore: 40,
            slidesOffsetAfter: 40,
          },
        }}
        className="relative mt-3 md:mt-4"
        {...props}
      >
        {datacard.map((dc, index) => (
          <SwiperSlide key={index}>
            <Link to={`/movie/${dc.id}`} className="relative rounded-myrad inline-block overflow-hidden aspect-2/3 w-full">
              <img src={dc.poster} alt="poster" className="w-full h-full object-cover" />

              <div className="absolute top-3 left-3.5 ">
                <span className="text-4xl font-semibold text-shadow-lg">{index + 1}</span>
              </div>
              <div className="absolute top-3.5 right-3.5 rounded-full bg-dark/50 px-2 border border-light/50 text-[10px] py-0.5">
                <span className="font-medium opacity-75">{isReleased(dc.releaseDate) ? "Tayang" : formatReleaseDate(dc.releaseDate)}</span>
              </div>

              <div className="absolute bottom-0 left-0 w-full text-xs px-3.5 pb-2 pt-5 space-x-2 bg-linear-to-t from-black to-black/0 text-tx-light/75 font-medium">
                <span>{formatDuration(dc.duration)}</span>
                <span>{dc.age}</span>
                <span>{dc.genre[0]}</span>
              </div>
            </Link>
          </SwiperSlide>
        ))}
        <div className="hidden md:block absolute h-full w-10 left-0 top-0 bg-linear-to-r from-dark via-75% via-dark to-dark/0 z-10"></div>
        <div className="hidden md:block absolute h-full w-10 right-0 top-0 bg-linear-to-l from-dark via-75% via-dark to-dark/0 z-10"></div>
      </Swiper>
    </>
  );
}
