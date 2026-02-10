import { useEffect, useRef, useState } from "react";

export function useHeroVideo({ isActive, delay = 5000 }) {
  const videoRef = useRef(null);
  const timerRef = useRef(null);

  const [showVideo, setShowVideo] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!isActive) return;

    timerRef.current = setTimeout(() => {
      setShowVideo(true);
      setIsPlaying(true);
    }, delay);

    return () => clearTimeout(timerRef.current);
  }, [isActive, delay]);

  useEffect(() => {
    if (!isActive) return;
    if (!showVideo) return;
    if (!videoRef.current) return;

    videoRef.current.currentTime = 0;
    videoRef.current.play();
    setIsPlaying(true);
  }, [isActive, showVideo]);

  useEffect(() => {
    if (isActive) return;

    clearTimeout(timerRef.current);

    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
    setShowVideo(false);
    setIsPlaying(false);
  }, [isActive]);

  const togglePlay = () => {
    if (!isActive || !videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;

    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  return {
    videoRef,
    showVideo,
    isMuted,
    isPlaying,
    toggleMute,
    togglePlay,
  };
}
