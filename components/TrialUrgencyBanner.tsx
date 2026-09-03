"use client";

import { useEffect, useState } from "react";

interface TrialUrgencyBannerProps {
  createdAt: string;
  handshakeAt?: string;
  dealSigned?: boolean;
  activityCount?: number;
  onUpgradeClick?: () => void;
}

export function TrialUrgencyBanner({
  createdAt,
  handshakeAt,
  dealSigned = false,
  activityCount = 0,
  onUpgradeClick,
}: TrialUrgencyBannerProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    isExpired: boolean;
  }>({ days: 14, hours: 0, minutes: 0, isExpired: false });

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
          <h2 className="text-2xl font-bold tracking-tight text-white">
            {dealSigned ? "Production Migration Grace Period Ended" : "Sandbox Evaluation Expired"}
          </h2>
          <p className="mt-3 text-sm text-zinc-400">
            {dealSigned
              ? "The 7-day post-handshake period for this workspace has concluded. Complete final balance payment to proceed."
              : "Your evaluation environment for this workspace build has reached its limit. Connect to convert to production access."}
          </p>
          <button
            onClick={onUpgradeClick}
            className="mt-6 w-full rounded-xl bg-gradient-to-r from-red-600 to-amber-600 px-6 py-3 font-semibold text-white shadow-lg transition hover:brightness-110"
          >
            {dealSigned ? "Complete Final Payment" : "Claim Production Workspace"}
          </button>
        </div>
      </div>
    );
  }

  // HIDDEN EXPIRATION: Banner is invisible during outreach, visible only after deal is signed
  if (!dealSigned) {
    return null;
  }

  // VISIBLE HANDSHAKE BANNER
  return (
    <div className="w-full py-2.5 px-4 text-center text-xs font-medium bg-amber-500/10 text-amber-400 border-b border-amber-500/20">
      <span>
        🤝 <strong>PRODUCTION HANDSHAKE ACTIVE:</strong> Grace period for full deployment balance expires in{" "}
        <span className="font-bold text-white">
          {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m
        </span>.
      </span>
      <button
        onClick={onUpgradeClick}
        className="ml-3 underline decoration-amber-500/50 underline-offset-2 hover:text-white"
      >
        Complete Migration →
      </button>
    </div>
  );
}