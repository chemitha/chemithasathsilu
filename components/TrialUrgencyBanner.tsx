"use client";

import { useEffect, useState } from "react";

interface TrialUrgencyBannerProps {
  createdAt: string;
  handshakeAt?: string;
  dealSigned?: boolean;
  activityCount?: number;
  onUpgradeClick?: () => void;
  onRequestTimeClick?: () => void;
}

export function TrialUrgencyBanner({
  createdAt,
  handshakeAt,
  dealSigned = false,
  activityCount = 0,
  onUpgradeClick,
  onRequestTimeClick,
}: TrialUrgencyBannerProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    isExpired: boolean;
  }>({ days: 14, hours: 0, minutes: 0, isExpired: false });

  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!createdAt && !handshakeAt) return;

    const calculateTime = () => {
      const now = Date.now();

      // SCENARIO 1: DEAL SIGNED (Handshake Phase - 7 Days to final payment)
      if (dealSigned) {
        const anchor = handshakeAt ? new Date(handshakeAt).getTime() : new Date(createdAt).getTime();
        const dealDurationMs = 7 * 24 * 60 * 60 * 1000;
        const expiresAt = anchor + dealDurationMs;
        const diff = expiresAt - now;

        if (diff <= 0) {
          setTimeLeft({ days: 0, hours: 0, minutes: 0, isExpired: true });
          return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        setTimeLeft({ days, hours, minutes, isExpired: false });
        return;
      }

      // SCENARIO 2: OUTREACH PREVIEW (High activity reduces 14 days -> 7 days)
      const isHighUsage = activityCount > 10;
      const allowedDays = isHighUsage ? 7 : 14;
      const trialDurationMs = allowedDays * 24 * 60 * 60 * 1000;

      const created = new Date(createdAt).getTime();
      const expiresAt = created + trialDurationMs;
      const diff = expiresAt - now;

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, isExpired: true });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        setTimeLeft({ days, hours, minutes, isExpired: false });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 60000);
    return () => clearInterval(interval);
  }, [createdAt, handshakeAt, dealSigned, activityCount]);

  if (!createdAt && !handshakeAt) return null;

  // 1. Return early immediately if deal isn't signed
  if (!dealSigned) {
    return null;
  }

  // 2. HARD PAYWALL LOCKOUT OVERLAY
  if (timeLeft.isExpired) {
    return (
      <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/80 backdrop-blur-md p-6 text-white">
        <div className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-950 p-6 text-center shadow-2xl">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-900 border border-zinc-800 text-white">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold tracking-tight text-white">
            Handshake Grace Period Ended
          </h2>
          <p className="mt-2 text-xs text-zinc-400 leading-relaxed">
            The 7-day deployment grace period for this workspace has expired. Complete migration to maintain continuous access.
          </p>
          <div className="mt-6 flex flex-col gap-2">
            <button
              onClick={onRequestTimeClick || onUpgradeClick}
              className="w-full rounded-xl bg-white px-4 py-2.5 text-xs font-semibold text-black transition hover:bg-zinc-200 active:scale-[0.98]"
            >
              Request More Time
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="w-full rounded-xl bg-zinc-900 px-4 py-2.5 text-xs font-medium text-zinc-400 border border-zinc-800 transition hover:bg-zinc-800 hover:text-white active:scale-[0.98]"
            >
              Fine, Got It
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (dismissed) return null;

  // 3. FLOATING CORNER PILL
  return (
    <div className="fixed bottom-5 right-5 z-[9999] flex items-center gap-3 rounded-full border border-zinc-800 bg-zinc-950/90 py-2 px-3.5 text-xs text-zinc-300 shadow-xl backdrop-blur-md">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
      </span>
      <span className="font-medium">
        Handshake Active:{" "}
        <strong className="text-white">
          {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m
        </strong>
      </span>
      <button
        onClick={onUpgradeClick}
        className="ml-1 rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-black transition hover:bg-zinc-200 active:scale-95"
      >
        Complete
      </button>
    </div>
  );
}