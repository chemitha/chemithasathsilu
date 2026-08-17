"use client";

import React, { useEffect, useRef, useState } from "react";
import HalftoneReveal from "@/components/v1/HalftoneReveal";
import { usePerformanceTier } from "@/lib/usePerformanceTier";

const VIDEO_SPEED = 0.4;

interface SeamlessVideoProps {
  fallbackImageSrc?: string;
}

// Base Video Background Component
export const SeamlessVideoBackground: React.FC<SeamlessVideoProps> = ({
  fallbackImageSrc = "/background-fallback.webp",
}) => {
  const video1Ref = useRef<HTMLVideoElement>(null);
  const video2Ref = useRef<HTMLVideoElement>(null);

  const [activeVideo, setActiveVideo] = useState<1 | 2>(1);

  const FADE_DURATION = 1.5;

  useEffect(() => {
    if (video1Ref.current) video1Ref.current.playbackRate = VIDEO_SPEED;
    if (video2Ref.current) video2Ref.current.playbackRate = VIDEO_SPEED;
  }, []);

  const handleTimeUpdate = (videoNum: 1 | 2) => {
    const currentVideo = videoNum === 1 ? video1Ref.current : video2Ref.current;
    const nextVideo = videoNum === 1 ? video2Ref.current : video1Ref.current;

    if (!currentVideo || !nextVideo) return;

    const timeLeft = currentVideo.duration - currentVideo.currentTime;
    if (timeLeft <= FADE_DURATION && activeVideo === videoNum) {
      nextVideo.currentTime = 0;
      nextVideo.playbackRate = VIDEO_SPEED;
      nextVideo.play();
      setActiveVideo(videoNum === 1 ? 2 : 1);
    }
  };

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-black">
      <video
        ref={video1Ref}
        autoPlay
        muted
        playsInline
        poster={fallbackImageSrc}
        onLoadedMetadata={(e) => {
          (e.currentTarget as HTMLVideoElement).playbackRate = VIDEO_SPEED;
        }}
        onTimeUpdate={() => handleTimeUpdate(1)}
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
          activeVideo === 1 ? "opacity-100" : "opacity-0"
        }`}
      >
        <source src="/night-coludysky.mp4" type="video/mp4" />
      </video>

      <video
        ref={video2Ref}
        muted
        playsInline
        poster={fallbackImageSrc}
        onLoadedMetadata={(e) => {
          (e.currentTarget as HTMLVideoElement).playbackRate = VIDEO_SPEED;
        }}
        onTimeUpdate={() => handleTimeUpdate(2)}
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
          activeVideo === 2 ? "opacity-100" : "opacity-0"
        }`}
      >
        <source src="/night-coludysky.mp4" type="video/mp4" />
      </video>

      <div className="absolute inset-0 bg-black/65 backdrop-blur-sm" />
    </div>
  );
};

// Component with HalftoneReveal Overlay included
export const SeamlessVideoWithHalftone: React.FC<SeamlessVideoProps> = ({
  fallbackImageSrc = "/background-fallback.webp",
}) => {
  const isLowSpec = usePerformanceTier();

  // PERFORMANCE OPTIMIZED FALLBACK (Image + CSS Halftone Overlay)
  if (isLowSpec) {
    return (
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none bg-[#0a0a0a]">
        {/* Background Image - Clean img tag with proper object-fit */}
        <img
          src={fallbackImageSrc}
          alt="Background Fallback"
          className="absolute inset-0 h-full w-full object-cover opacity-60"
        />

        {/* Zero-GPU Static Halftone Radial Grid Pattern */}
        <div
          className="absolute inset-0 pointer-events-none opacity-30 mix-blend-screen"
          style={{
            backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.8) 1.5px, transparent 1.5px)`,
            backgroundSize: `12px 12px`,
          }}
        />

        {/* Ambient Overlay (Removed problematic backdrop-blur) */}
        <div className="absolute inset-0 bg-black/40" />
      </div>
    );
  }

  // HIGH PERFORMANCE TIER (WebGL Shader & Video Playback)
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-auto">
      <SeamlessVideoBackground fallbackImageSrc={fallbackImageSrc} />
      <div className="absolute inset-0 opacity-40 mix-blend-screen pointer-events-auto">
        <HalftoneReveal
          src="/night-coludysky.mp4"
          inkColor="#0a0a0a"
          paperColor="#1a1a2e"
          mode="mono"
          dotDensity={90}
          dotSize={1.6}
          angle={30}
          revealRadius={0.35}
          borderRadius="0px"
          trigger="never"
        />
      </div>
    </div>
  );
};

export default SeamlessVideoWithHalftone;