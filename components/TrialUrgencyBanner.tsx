"use client";

import { useEffect, useState } from "react";

interface TrialUrgencyBannerProps {
  createdAt: string;
  handshakeAt?: string;
  dealSigned?: boolean;
  activityCount?: number;
  onUpgradeClick?: () => void;
  workspaceId?: string;
}

export function TrialUrgencyBanner({
  createdAt,
  handshakeAt,
  dealSigned = false,
  activityCount = 0,
  onUpgradeClick,
  workspaceId = "demo-workspace",
}: TrialUrgencyBannerProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isExpired: boolean;
  }>({ days: 14, hours: 0, minutes: 0, seconds: 0, isExpired: false });

  const [showModal, setShowModal] = useState(false);

  // Extension & Reason Flow States
  const [hasUsedFirstExtension, setHasUsedFirstExtension] = useState(false);
  const [firstExtensionMs, setFirstExtensionMs] = useState<number>(0);
  const [step, setStep] = useState<"DEFAULT" | "CONFIRM_24H" | "REASONS_FORM">("DEFAULT");

  // Reasons Form State
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [customReason, setCustomReason] = useState("");
  const [isSendingTelegram, setIsSendingTelegram] = useState(false);
  const [telegramSent, setTelegramSent] = useState(false);

  // Load extension state from LocalStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    const extUsed = localStorage.getItem(`ext_used_${workspaceId}`);
    const extMs = localStorage.getItem(`ext_ms_${workspaceId}`);
    if (extUsed === "true") setHasUsedFirstExtension(true);
    if (extMs) setFirstExtensionMs(Number(extMs));
  }, [workspaceId]);

  useEffect(() => {
    if (!createdAt && !handshakeAt) return;

    const calculateTime = () => {
      const now = Date.now();

      if (dealSigned) {
        const anchor = handshakeAt ? new Date(handshakeAt).getTime() : new Date(createdAt).getTime();
        const dealDurationMs = 7 * 24 * 60 * 60 * 1000;

        let expiresAt = anchor + dealDurationMs;
        if (hasUsedFirstExtension && firstExtensionMs > 0) {
          expiresAt = now < expiresAt
            ? expiresAt + 24 * 60 * 60 * 1000
            : firstExtensionMs + 24 * 60 * 60 * 1000;
        }

        const diff = Math.max(0, expiresAt - now);

        if (diff <= 0) {
          setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true });
          return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / 1000 / 60) % 60);
        const seconds = Math.floor((diff / 1000) % 60);

        setTimeLeft({ days, hours, minutes, seconds, isExpired: false });
        return;
      }

      const isHighUsage = activityCount > 10;
      const allowedDays = isHighUsage ? 7 : 14;
      const trialDurationMs = allowedDays * 24 * 60 * 60 * 1000;

      const created = new Date(createdAt).getTime();
      const expiresAt = created + trialDurationMs;
      const diff = Math.max(0, expiresAt - now);

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / 1000 / 60) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimeLeft({ days, hours, minutes, seconds, isExpired: false });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [createdAt, handshakeAt, dealSigned, activityCount, hasUsedFirstExtension, firstExtensionMs]);

  if (!createdAt && !handshakeAt) return null;
  if (!dealSigned) return null;

  const isLockedOut = timeLeft.isExpired;

  const handleRequestTimeClick = () => {
    if (!hasUsedFirstExtension) {
      setStep("CONFIRM_24H");
    } else {
      setStep("REASONS_FORM");
    }
  };

  const handleConfirm24h = () => {
    const now = Date.now();
    localStorage.setItem(`ext_used_${workspaceId}`, "true");
    localStorage.setItem(`ext_ms_${workspaceId}`, String(now));
    setHasUsedFirstExtension(true);
    setFirstExtensionMs(now);
    setShowModal(false);
    setStep("DEFAULT");
  };

  const toggleReason = (reason: string) => {
    setSelectedReasons((prev) =>
      prev.includes(reason) ? prev.filter((r) => r !== reason) : [...prev, reason]
    );
  };

  const handleSendTelegramReason = async () => {
    setIsSendingTelegram(true);

    try {
      const res = await fetch("/api/request-extension", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId,
          selectedReasons,
          customReason,
        }),
      });

      if (res.ok) {
        setTelegramSent(true);
      } else {
        console.error("Extension request failed");
      }
    } catch (error) {
      console.error("Failed to send Telegram alert:", error);
    } finally {
      setIsSendingTelegram(false);
    }
  };

  return (
    <>
      {/* FLOATING BOTTOM-LEFT PILL */}
      <div 
        onClick={() => {
          if (isLockedOut) {
            setStep("DEFAULT");
            setShowModal(true);
          }
        }}
        className="fixed bottom-5 left-5 z-[99999] flex items-center gap-3 rounded-full border border-zinc-800 bg-zinc-950/90 py-2 px-4 text-xs text-zinc-300 shadow-2xl backdrop-blur-md select-none hover:border-zinc-700"
      >
        <span className="relative flex h-2 w-2">
          <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${isLockedOut ? "bg-red-400" : "bg-emerald-400"}`}></span>
          <span className={`relative inline-flex h-2 w-2 rounded-full ${isLockedOut ? "bg-red-500" : "bg-emerald-500"}`}></span>
        </span>
        <span className="font-medium">
          {isLockedOut ? "Grace Period Expired" : "Handshake Active:"}{" "}
          {!isLockedOut && (
            <strong className="text-white">
              {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
            </strong>
          )}
        </span>
        {isLockedOut && (
          <button className="ml-1 cursor-pointer rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-black transition hover:bg-zinc-200 active:scale-95">
            Resolve
          </button>
        )}
      </div>

      {/* MODAL OVERLAY - ONLY SHOW WHEN LOCKED OUT OR MANUALLY TRIGGERED WHILE EXPIRED */}
      {(showModal || isLockedOut) && (
        <div className="fixed inset-0 z-[999999] flex cursor-default items-center justify-center bg-black/80 backdrop-blur-md p-6 text-white">
          <div className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-950 p-6 text-center shadow-2xl">

            {/* STEP 1: DEFAULT / MAIN OVERLAY */}
            {step === "DEFAULT" && (
              <>
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900 text-white">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <h2 className="text-lg font-semibold tracking-tight text-white">
                  {isLockedOut ? "Handshake Grace Period Ended" : "Production Handshake Active"}
                </h2>
                <p className="mt-2 text-xs leading-relaxed text-zinc-400">
                  {isLockedOut
                    ? "The evaluation period for this workspace has concluded. Request extended evaluation time or finalize deployment setup."
                    : `Your workspace evaluation is active. You have ${timeLeft.days}d ${timeLeft.hours}h ${timeLeft.minutes}m remaining before production setup finalization.`}
                </p>
                <div className="mt-6 flex flex-col gap-2.5">
                  {isLockedOut ? (
                    <button
                      onClick={handleRequestTimeClick}
                      className="w-full cursor-pointer rounded-xl bg-white px-4 py-2.5 text-xs font-semibold text-black transition hover:bg-zinc-200 active:scale-[0.98]"
                    >
                      Request More Time
                    </button>
                  ) : (
                    <button
                      onClick={() => setShowModal(false)}
                      className="w-full cursor-pointer rounded-xl bg-white px-4 py-2.5 text-xs font-semibold text-black transition hover:bg-zinc-200 active:scale-[0.98]"
                    >
                      I Understand
                    </button>
                  )}
                </div>
              </>
            )}

            {/* STEP 2: CONFIRM 24H EXTENSION */}
            {step === "CONFIRM_24H" && (
              <>
                <h2 className="text-lg font-semibold tracking-tight text-white">
                  Grant Additional 24 Hours?
                </h2>
                <p className="mt-2 text-xs leading-relaxed text-zinc-400">
                  We can extend your workspace evaluation for strictly <strong className="text-white">24 extra hours</strong>. Would you like to apply this standard extension?
                </p>
                <div className="mt-6 flex flex-col gap-2.5">
                  <button
                    onClick={handleConfirm24h}
                    className="w-full cursor-pointer rounded-xl bg-white px-4 py-2.5 text-xs font-semibold text-black transition hover:bg-zinc-200 active:scale-[0.98]"
                  >
                    Yes, Apply 24h Extension
                  </button>
                  <button
                    onClick={() => setStep("DEFAULT")}
                    className="w-full cursor-pointer rounded-xl border border-white/20 bg-transparent px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-white/10 active:scale-[0.98]"
                  >
                    Back
                  </button>
                </div>
              </>
            )}

            {/* STEP 3: REASONS FORM */}
            {step === "REASONS_FORM" && (
              <>
                <h2 className="text-lg font-semibold tracking-tight text-white">
                  Request Additional Extension
                </h2>
                <p className="mt-2 text-xs text-zinc-400">
                  Select your primary reason for extension so our core team can review your workspace:
                </p>

                {!telegramSent ? (
                  <>
                    <div className="mt-4 flex flex-col gap-2 text-left text-xs">
                      {[
                        "Awaiting internal executive/client sign-off",
                        "Integrating secondary API / custom domain",
                        "Finance/billing department processing delay",
                        "Need more end-to-end sandbox testing",
                      ].map((reason) => (
                        <div
                          key={reason}
                          onClick={() => toggleReason(reason)}
                          className={`flex cursor-pointer items-center gap-2.5 rounded-lg border p-2.5 transition ${
                            selectedReasons.includes(reason)
                              ? "border-white bg-white/10 text-white"
                              : "border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:border-zinc-700"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={selectedReasons.includes(reason)}
                            onChange={() => {}}
                            className="pointer-events-none rounded border-zinc-700 bg-zinc-900 text-white focus:ring-0"
                          />
                          <span>{reason}</span>
                        </div>
                      ))}
                      <textarea
                        value={customReason}
                        onChange={(e) => setCustomReason(e.target.value)}
                        placeholder="Other reason / specific context..."
                        className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-900 p-2.5 text-xs text-white placeholder-zinc-500 focus:border-white focus:outline-none"
                        rows={2}
                      />
                    </div>

                    <div className="mt-5 flex flex-col gap-2.5">
                      <button
                        onClick={handleSendTelegramReason}
                        disabled={isSendingTelegram}
                        className="w-full cursor-pointer rounded-xl bg-white px-4 py-2.5 text-xs font-semibold text-black transition hover:bg-zinc-200 active:scale-[0.98] disabled:opacity-50"
                      >
                        {isSendingTelegram ? "Sending Request..." : "Submit Extension Request"}
                      </button>
                      <button
                        onClick={() => setStep("DEFAULT")}
                        className="w-full cursor-pointer rounded-xl border border-white/20 bg-transparent px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-white/10 active:scale-[0.98]"
                      >
                        Back
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-900 p-4 text-center">
                    <p className="text-xs text-zinc-300">
                      Request submitted to admin. Your workspace details have been sent for direct review.
                    </p>
                    <button
                      onClick={() => setStep("DEFAULT")}
                      className="mt-4 w-full cursor-pointer rounded-xl bg-white px-4 py-2 text-xs font-semibold text-black hover:bg-zinc-200"
                    >
                      Back
                    </button>
                  </div>
                )}
              </>
            )}

          </div>
        </div>
      )}
    </>
  );
}