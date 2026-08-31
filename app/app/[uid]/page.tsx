'use client';

import React, { useState, useEffect } from 'react';
import Script from 'next/script';
import Image from 'next/image';

interface TelemetryData {
  state: string;
  locked: boolean;
  expiresAt?: string;
  remainingMs?: number;
}

export default function ShowcasePage({
  params,
}: {
  params: Promise<{ uid: string }>;
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [showReload, setShowReload] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [targetUrl, setTargetUrl] = useState<string | null>(null);

  // Telemetry & Paywall States
  const [telemetry, setTelemetry] = useState<TelemetryData | null>(null);
  const [extensionRequested, setExtensionRequested] = useState(false);
  const [requestReason, setRequestReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resolvedParams = React.use(params);

  // 1. Force dynamic document title update
  useEffect(() => {
    if (!resolvedParams?.uid) return;

    const slug = resolvedParams.uid;
    const formattedTitle = `${slug.toUpperCase()} | Chemitha Sathsilu`;
    
    document.title = formattedTitle;

    const timeout = setTimeout(() => {
      document.title = formattedTitle;
    }, 100);

    return () => clearTimeout(timeout);
  }, [resolvedParams?.uid]);

  // 2. Fetch live deployment & ping telemetry tracking
  useEffect(() => {
    if (!resolvedParams?.uid) return;

    async function initShowcase() {
      // Ping telemetry endpoint on the engine backend
      try {
        const trackRes = await fetch(`https://b2b-micro-saas-engine.onrender.com/api/track-view`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug: resolvedParams.uid }),
        });
        if (trackRes.ok) {
          const trackData = await trackRes.json();
          setTelemetry(trackData);
        }
      } catch (err) {
        console.error('Telemetry tracking failed:', err);
      }

      // Fetch showcase URL route
      try {
        const res = await fetch(`/api/showcase/${resolvedParams.uid}`, {
          cache: 'no-store',
        });
        if (res.ok) {
          const data = await res.json();
          if (data.deployedUrl) {
            setTargetUrl(data.deployedUrl);
            return;
          }
        }
      } catch {
        // Fallback
      }
      setTargetUrl(`https://demo-${resolvedParams.uid}.vercel.app`);
    }

    initShowcase();
  }, [resolvedParams?.uid]);

  // Timeout logic for iframe loading
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isLoading) {
      setShowReload(false);
      timer = setTimeout(() => {
        setShowReload(true);
      }, 10000);
    }
    return () => clearTimeout(timer);
  }, [isLoading, reloadKey]);

  const handleReload = () => {
    setIsLoading(true);
    setShowReload(false);
    setReloadKey((prev) => prev + 1);
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  const handleRequestExtension = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestReason.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`https://b2b-micro-saas-engine.onrender.com/api/request-extension`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: resolvedParams.uid,
          reason: requestReason,
        }),
      });

      if (res.ok) {
        setExtensionRequested(true);
      }
    } catch (err) {
      console.error('Failed to request extension:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLocked = telemetry?.locked || telemetry?.state === 'EXPIRED';
  const showTrialBanner =
    telemetry &&
    (telemetry.state === 'ACTIVE_TRIAL' || telemetry.state === 'EXTENDED') &&
    !isLocked;

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black select-none">
      {/* Dynamic Trial Countdown Banner */}
      {showTrialBanner && (
        <div className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-2 bg-neutral-900/90 backdrop-blur-md border-b border-white/10 text-xs text-neutral-300">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Active Client Trial</span>
          </div>
          <div className="font-mono text-neutral-400">
            {telemetry?.expiresAt
              ? `Expires: ${new Date(telemetry.expiresAt).toLocaleDateString()}`
              : 'Trial Period Active'}
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black transition-opacity duration-300 !cursor-default">
          <div className="flex flex-col items-center">
            <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin mb-3 pointer-events-none" />
            <span className="text-xs text-neutral-400 font-mono tracking-wider pointer-events-none">
              LOADING APP...
            </span>
          </div>

          {showReload && (
            <div className="absolute bottom-12 flex flex-col items-center animate-fade-in !cursor-auto">
              <p className="text-xs text-neutral-400 font-mono tracking-wider !cursor-auto pointer-events-auto">
                Taking long?
              </p>
              <button
                onClick={handleReload}
                className="mt-2 text-white border-none text-sm font-medium underline !cursor-pointer transition-all duration-150 ease-in-out hover:decoration-dotted active:scale-95"
              >
                Click to Reload
              </button>
            </div>
          )}
        </div>
      )}

      {/* Embedded App Frame */}
      {targetUrl && (
        <iframe
          key={reloadKey}
          src={targetUrl}
          className={`w-full h-full border-0 relative z-10 ${
            showTrialBanner ? 'pt-8' : ''
          } ${isLocked ? 'blur-md pointer-events-none' : ''}`}
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-modals allow-downloads allow-storage-access-by-user-activation allow-top-navigation allow-top-navigation-by-user-activation"
          allow="geolocation; microphone; camera; clipboard-write; clipboard-read; autoplay"
          title={`Showcase - ${resolvedParams.uid}`}
          onLoad={handleIframeLoad}
        />
      )}

      {/* Locked Paywall Overlay */}
      {isLocked && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-lg px-4">
          <div className="max-w-md w-full bg-neutral-900/90 border border-neutral-800 rounded-2xl p-6 text-center shadow-2xl">
            <div className="w-12 h-12 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-red-400 text-xl font-bold">!</span>
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">
              Trial Period Expired
            </h2>
            <p className="text-sm text-neutral-400 mb-6">
              The preview window for this showcase has ended. Request an extension or unlock permanent access.
            </p>

            {extensionRequested ? (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs font-mono">
                Extension request submitted! Our team has been notified via Telegram.
              </div>
            ) : (
              <form onSubmit={handleRequestExtension} className="space-y-3">
                <input
                  type="text"
                  placeholder="Reason for extension (e.g. Need 24h to test API integration)"
                  value={requestReason}
                  onChange={(e) => setRequestReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-600 transition-colors"
                  required
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 bg-white text-black text-xs font-medium rounded-xl hover:bg-neutral-200 active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting...' : 'Request +24h Extension'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Glassmorphic Bottom-Right Pill */}
      <div className="fixed bottom-4 right-4 z-40 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-200/50 backdrop-blur-md border border-white/10 text-xs text-white/80 shadow-md opacity-100 hover:opacity-30 transition-opacity duration-200 !cursor-auto pointer-events-auto">
        <Image
          src="/favicon.ico"
          alt="Logo"
          width={18}
          height={18}
          className="brightness-200 opacity-90 object-contain pointer-events-none"
        />
        <span className="text-black font-light pointer-events-none">App by</span>
        <Image
          src="/signature-cropped.svg"
          alt="Logo"
          width={40}
          height={14}
          className="brightness-200 opacity-90 object-contain pointer-events-none"
        />
      </div>

      {/* Anti-DevTools Protection */}
      <Script src="/anti-devtools.js" strategy="afterInteractive" />
    </div>
  );
}