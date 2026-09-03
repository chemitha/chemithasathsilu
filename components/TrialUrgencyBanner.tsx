"use client";

import { useEffect, useState } from "react";

interface TrialUrgencyBannerProps {
  createdAt: string;
  onUpgradeClick?: () => void;
}

export function TrialUrgencyBanner({ createdAt, onUpgradeClick }: TrialUrgencyBannerProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    isExpired: boolean;
    isUrgent: boolean;
  }>({ days: 7, hours: 0, minutes: 0, isExpired: false, isUrgent: false });

  useEffect(() => {
    const calculateTime = () => {
      const created = new Date(createdAt).getTime();
      const trialDurationMs = 7 * 24 * 60 * 60 * 1000; // 7 days
      const expiresAt = created + trialDurationMs;
      const now = Date.now();
      const diff = expiresAt - now;

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, isExpired: true, isUrgent: true });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      setTimeLeft({
        days,
        hours,
        minutes,
        isExpired: false,
        isUrgent: days <= 2,
      });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 60000);
    return () => clearInterval(interval);
  }, [createdAt]);

  // HARD PAYWALL LOCKOUT OVERLAY (Expired)
  if (timeLeft.isExpired) {
    return (
      <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/90 backdrop-blur-md p-6 text-white text-center">
        <div className="max-w-md rounded-2xl border border-red-500/30 bg-zinc-900 p-8 shadow-2xl">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 text-red-500">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H10m12-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Sandbox Evaluation Expired</h2>
          <p className="mt-3 text-sm text-zinc-400">
            Your evaluation environment for this custom workspace build has reached its period limit. Convert to production workspace to restore full access.
          </p>
          <button
            onClick={onUpgradeClick}
            className="mt-6 w-full rounded-xl bg-gradient-to-r from-red-600 to-amber-600 px-6 py-3 font-semibold text-white shadow-lg transition hover:brightness-110"
          >
            Claim Production Workspace
          </button>
        </div>
      </div>
    );
  }

  // URGENCY WARNING BANNER (Active Trial)
  return (
    <div className={`w-full py-2.5 px-4 text-center text-xs font-medium transition-colors ${
      timeLeft.isUrgent ? "bg-amber-500/10 text-amber-400 border-b border-amber-500/20" : "bg-zinc-900/80 text-zinc-300 border-b border-zinc-800"
    }`}>
      <span>
        ⚠️ <strong>EVALUATION PERIOD:</strong> Custom preview sandbox expires in{" "}
        <span className="font-bold text-white">
          {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m
        </span>.
      </span>
      <button
        onClick={onUpgradeClick}
        className="ml-3 underline decoration-amber-500/50 underline-offset-2 hover:text-white"
      >
        Migrate to Production →
      </button>
    </div>
  );
}