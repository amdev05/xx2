import { useNavigate } from "react-router-dom";

import muteIcon from "../../assets/icons/muteIcon.svg";
import unmuteIcon from "../../assets/icons/unmuteIcon.svg";
import playIcon from "../../assets/icons/playIcon.svg";
import pauseIcon from "../../assets/icons/pauseIcon.svg";

import Button from "../ui/Button";
import { useHeroVideo } from "../../hooks/useHeroVideo";

export default function HeroSlide({ data, isActive, detail }) {
  const { videoRef, showVideo, isMuted, isPlaying, toggleMute, togglePlay } = useHeroVideo({ isActive });
  const navigate = useNavigate();

  return (
    <div className="relative w-full h-full">
      {!showVideo && <img src={data.thumbnail} alt="poster" className="w-full h-full object-cover object-center" />}

      {showVideo && <video src={data.trailer} ref={videoRef} autoPlay muted playsInline preload="none" className="w-full h-full object-cover" />}

      <div className="absolute top-0 left-0 right-0 bottom-0 bg-linear-to-t from-black via-black/80 via-20% to-black/0 md:from-black/80 md:via-black/70"></div>

      {showVideo && (
        <div className="absolute top-6 right-5 md:right-10 flex gap-3">
          {isPlaying ? (
            <img src={pauseIcon} alt="pause" onClick={togglePlay} className="rounded-full cursor-pointer shadow" />
          ) : (
            <img src={playIcon} alt="play" onClick={togglePlay} className="rounded-full cursor-pointer shadow" />
          )}
          {!isMuted ? (
            <img src={unmuteIcon} alt="pause" onClick={toggleMute} className="rounded-full cursor-pointer shadow" />
          ) : (
            <img src={muteIcon} alt="play" onClick={toggleMute} className="rounded-full cursor-pointer shadow" />
          )}
        </div>
      )}

      <div className="absolute bottom-20 left-0 w-full flex flex-col items-center md:items-start md:left-10 mask-x-to-yellow-100 md:w-fit">
        {data.logo ? <img src={data.logo} alt="" className="max-w-50 max-h-20" /> : <p className="text-2xl font-bold">{data.title}</p>}

        <div className="text-sm mt-4 font-medium inline-flex gap-1">
          {(Array.isArray(data.genre) ? data.genre : data.genre?.split(",").map((g) => g.trim())).map((g, index) => (
            <p key={index} className="space-x-1">
              <span>{g}</span>
              <span>{index < data.genre.length - 1 ? "·" : ""}</span>
            </p>
          ))}
        </div>

        <p className="text-center md:text-left line-clamp-2 text-sm mt-2 text-tx-light/75 max-w-75 font-light">{data.synopsis}</p>
        {/* <p className="text-center md:text-left line-clamp-1 text-sm mt-2 text-tx-light/75 max-w-75 font-light">{data.synopsis}</p> */}

        <Button classname={"mt-5 w-65 md:w-fit"} onClick={() => navigate(`/movie/${data.id}`)}>
          Beli Tiket Sekarang
        </Button>
        {detail && (
          <Button variant="dark" classname={"mt-3 w-65 md:w-fit"} onClick={() => navigate(`/movie/${data.id}`)}>
            Tonton Trailer
          </Button>
        )}
      </div>
    </div>
  );
}
