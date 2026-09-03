"use client";

interface TrialUrgencyBannerProps {
  createdAt?: string;
}

export function TrialUrgencyBanner({ createdAt }: TrialUrgencyBannerProps) {
  if (!createdAt) return null;

  const trialDays = 7;
  const graceDays = 2;
  const totalAllowedMs = (trialDays + graceDays) * 24 * 60 * 60 * 1000;

  const elapsedMs = Date.now() - new Date(createdAt).getTime();
  const remainingMs = totalAllowedMs - elapsedMs;
  const remainingHours = Math.max(0, Math.floor(remainingMs / (1000 * 60 * 60)));

  // Show banner only when 48 hours or fewer remain
  if (remainingHours <= 48) {
    return (
      <div className="w-full bg-red-500/10 border-b border-red-500/20 py-2.5 px-4 text-center text-xs text-red-400 font-mono tracking-wide">
        🚨 CRITICAL: Trial sandbox state scheduled for permanent deletion in {remainingHours} hours.
      </div>
    );
  }

  return null;
}