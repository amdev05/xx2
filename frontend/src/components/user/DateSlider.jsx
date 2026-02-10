import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import { useState, useEffect } from "react";

export const DateSlider = ({ selectedDate, onDateChange }) => {
  const [dates, setDates] = useState([]);

  useEffect(() => {
    // Generate next 14 days
    const today = new Date();
    const dateArray = [];

    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dateArray.push(date);
    }

    setDates(dateArray);
  }, []);

  const formatDate = (date) => {
    const day = date.getDate();
    const month = date.toLocaleDateString("id-ID", { month: "short" });
    return `${day} ${month}`;
  };

  const formatDay = (date) => {
    return date.toLocaleDateString("id-ID", { weekday: "short" });
  };

  const isSelected = (date) => {
    if (!selectedDate) return false;
    return date.toDateString() === selectedDate.toDateString();
  };

  return (
    <Swiper
      breakpoints={{
        0: { slidesPerView: 4, slidesPerGroup: 4, spaceBetween: 14 },
        768: { slidesPerView: 6, slidesPerGroup: 6, spaceBetween: 16 },
      }}
    >
      {dates.map((date, index) => (
        <SwiperSlide
          key={index}
          className={`border text-center rounded-myrad py-6 cursor-pointer overflow-hidden transition-colors ${
            isSelected(date) ? "border-primary bg-primary/20" : "border-light/25 hover:border-primary/50"
          }`}
          onClick={() => onDateChange && onDateChange(date)}
        >
          <p className="text-sm font-medium">{formatDate(date)}</p>
          <p className="text-xs text-tx-light/75">{formatDay(date)}</p>
        </SwiperSlide>
      ))}
    </Swiper>
  );
};
