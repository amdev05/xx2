import { useNavigate } from "react-router-dom";

import muteIcon from "../../assets/icons/muteIcon.svg";
import unmuteIcon from "../../assets/icons/unmuteIcon.svg";
import playIcon from "../../assets/icons/playIcon.svg";
import pauseIcon from "../../assets/icons/pauseIcon.svg";

import Button from "../ui/Button";
import { useHeroVideo } from "../../hooks/useHeroVideo";

import { formatDuration } from "../../utils/formatDuration";

export default function HeroMovie({ data, isActive }) {
  const { videoRef, showVideo, isMuted, isPlaying, toggleMute, togglePlay } = useHeroVideo({ isActive });
  const navigate = useNavigate();

  return (
    <div className="relative w-full h-full rounded-b-myrad overflow-hidden">
      {!showVideo && <img src={data.thumbnail} alt="poster" className="w-full h-full object-cover object-center" />}

      {showVideo && <video src={data.trailer} ref={videoRef} autoPlay muted playsInline preload="none" className="w-full h-full object-cover" />}

      <div className="absolute top-0 left-0 right-0 bottom-0 bg-linear-to-t from-black via-black/80 via-20% to-black/0 md:from-black/80 md:via-black/70"></div>

      {showVideo && (
        <div className="absolute top-6 right-5 md:right-10 flex gap-3">
          <img src={isPlaying ? pauseIcon : playIcon} alt="pause" onClick={togglePlay} className="rounded-full cursor-pointer shadow" />

          <img src={isMuted ? muteIcon : unmuteIcon} alt="pause" onClick={toggleMute} className="rounded-full cursor-pointer shadow" />
        </div>
      )}

      <div className="absolute bottom-15 left-0 w-full flex flex-col items-center md:items-start md:left-10 mask-x-to-yellow-100 md:w-fit">
        {data.logo ? <img src={data.logo} alt={data.title} className="max-w-50 max-h-20" /> : <h1 className="text-2xl font-bold text-white">{data.title}</h1>}

        <div className="text-sm mt-4 font-medium inline-flex gap-1">
          {(Array.isArray(data.genre) ? data.genre : data.genre?.split(",").map((g) => g.trim())).map((g, index) => (
            <p key={index} className="space-x-1">
              <span>{g}</span>
              <span>{index < 2 ? "·" : ""}</span>
            </p>
          ))}
        </div>

        <div className="text-xs font-medium space-x-3 text-tx-light/75 mt-2 flex">
          <span>{formatDuration(data.duration)}</span>
          <span>{data.age}</span>
          <p>Regular · Premiere · Max</p>
        </div>

        <div className="mt-5 flex flex-col md:flex-row gap-3">
          <Button classname={" w-65 md:w-fit"} onClick={() => navigate(`/cinema/${data.id}`)}>
            Beli Tiket Sekarang
          </Button>

          <Button variant="dark" classname={"w-65 md:w-fit"} onClick={() => navigate(`/cinema/${data.id}`)}>
            Tonton Trailer
          </Button>
        </div>
      </div>
    </div>
  );
}
