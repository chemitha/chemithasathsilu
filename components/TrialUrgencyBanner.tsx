"use client";

import { useEffect, useState } from "react";

interface TrialUrgencyBannerProps {
  expiresAt?: string;
  isExtended?: boolean;
  isLocked?: boolean;
  onResolveClick?: () => void;
}

export function TrialUrgencyBanner({
  expiresAt,
  isExtended = false,
  isLocked = false,
  onResolveClick,
}: TrialUrgencyBannerProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false,
  });

  useEffect(() => {
    if (!expiresAt) return;

    const calculateTime = () => {
      const now = Date.now();
      const target = new Date(expiresAt).getTime();
      const diff = Math.max(0, target - now);

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true });
        return;
      }

      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / 1000 / 60) % 60),
        seconds: Math.floor((diff / 1000) % 60),
        isExpired: false,
      });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  if (!expiresAt) return null;

  const expired = isLocked || timeLeft.isExpired;

  return (
    <div
      onClick={() => {
        if (expired && onResolveClick) onResolveClick();
      }}
      className="fixed bottom-5 left-5 z-40 flex items-center gap-3 rounded-full border border-zinc-800 bg-zinc-950/90 py-2 px-4 text-xs text-zinc-300 shadow-2xl backdrop-blur-md select-none hover:border-zinc-700 pointer-events-auto cursor-pointer"
    >
      <span className="relative flex h-2 w-2">
        <span
          className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${
            expired ? "bg-red-400" : "bg-emerald-400"
          }`}
        />
        <span
          className={`relative inline-flex h-2 w-2 rounded-full ${
            expired ? "bg-red-500" : "bg-emerald-500"
          }`}
        />
      </span>
      <span className="font-medium">
        {expired
          ? "Implementation Window Expired"
          : isExtended
          ? "Grace Extension Active:"
          : "Handshake Sprint Active:"}{" "}
        {!expired && (
          <strong className="text-white font-mono">
            {timeLeft.days > 0 && `${timeLeft.days}d `}
            {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
          </strong>
        )}
      </span>
      {expired && (
        <button
          type="button"
          className="ml-1 cursor-pointer rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-black transition hover:bg-zinc-200 active:scale-95"
        >
          Resolve
        </button>
      )}
    </div>
  );
}