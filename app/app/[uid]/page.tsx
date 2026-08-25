'use client';

import React, { useState, useEffect } from 'react';
import Script from 'next/script';
import Image from 'next/image';

export default function ShowcasePage({
  params,
}: {
  params: Promise<{ uid: string }>;
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [showReload, setShowReload] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [targetUrl, setTargetUrl] = useState<string | null>(null);

  const resolvedParams = React.use(params);

  // 1. Force dynamic document title update
  useEffect(() => {
    if (!resolvedParams?.uid) return;

    const slug = resolvedParams.uid;
    const formattedTitle = `${slug.toUpperCase()} | Chemitha Sathsilu`;
    
    // Direct DOM write
    document.title = formattedTitle;

    // Secondary fallback to overcome layout title overrides
    const timeout = setTimeout(() => {
      document.title = formattedTitle;
    }, 100);

    return () => clearTimeout(timeout);
  }, [resolvedParams?.uid]);

  // 2. Fetch live deployed URL from Engine API
  useEffect(() => {
    if (!resolvedParams?.uid) return;

    async function fetchDeployment() {
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
        // Fallback if API route fails
      }
      setTargetUrl(`https://demo-${resolvedParams.uid}.vercel.app`);
    }

    fetchDeployment();
  }, [resolvedParams?.uid]);

  // Timeout logic: Shows reload button if iframe takes longer than 10 seconds
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

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black select-none">
      {/* 1. Loading Screen */}
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
          className="w-full h-full border-0 relative z-10"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-modals allow-downloads allow-storage-access-by-user-activation allow-top-navigation allow-top-navigation-by-user-activation"
          allow="geolocation; microphone; camera; clipboard-write; clipboard-read; autoplay"
          title={`Showcase - ${resolvedParams.uid}`}
          onLoad={handleIframeLoad}
        />
      )}

      {/* 2. Glassmorphic Bottom-Right Pill */}
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