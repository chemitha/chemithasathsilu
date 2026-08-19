"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

const SPINNER_FRAMES = ["⠏", "⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇"];

export const Preloader: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [spinnerIndex, setSpinnerIndex] = useState(0);
  const [statusText, setStatusText] = useState("INITIALIZING SYSTEM...");

  const isLoadedRef = useRef(false);
  const minTimeReachedRef = useRef(false);

  // Cycle Braille Spinner Frames
  useEffect(() => {
    const spinnerInterval = setInterval(() => {
      setSpinnerIndex((prev) => (prev + 1) % SPINNER_FRAMES.length);
    }, 70);

    return () => clearInterval(spinnerInterval);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Check if initial document is already loaded
    if (document.readyState === "complete") {
      isLoadedRef.current = true;
    }

    const handleLoad = () => {
      isLoadedRef.current = true;
      // If the 6-second minimum animation time has already passed, close immediately
      if (minTimeReachedRef.current) {
        setIsLoading(false);
      }
    };

    window.addEventListener("load", handleLoad, { once: true });

    // 1. MINIMUM ANIMATION HOLD (6 seconds)
    // Gives the design animation room to play out properly
    const minAnimationTimer = setTimeout(() => {
      minTimeReachedRef.current = true;
      if (isLoadedRef.current) {
        setIsLoading(false);
      }
    }, 4000);

    // 2. SLOW NETWORK WARNING (10 seconds)
    // Updates status text so the user knows why it's taking longer
    const slowNetworkTimer = setTimeout(() => {
      if (!isLoadedRef.current) {
        setStatusText("SLOW CONNECTION DETECTED...");
      }
    }, 10000);

    // 3. HARD TIMEOUT CLOSURE (18 seconds)
    // Force-dismisses preloader so user is never stuck forever
    const hardTimeoutTimer = setTimeout(() => {
      setIsLoading(false);
    }, 18000);

    return () => {
      window.removeEventListener("load", handleLoad);
      clearTimeout(minAnimationTimer);
      clearTimeout(slowNetworkTimer);
      clearTimeout(hardTimeoutTimer);
    };
  }, []);

  return (
    <AnimatePresence mode="wait">
      {isLoading && (
        <motion.div
          key="preloader"
          initial={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)", opacity: 1 }}
          exit={{ 
            clipPath: "polygon(0 0, 100% 0, 100% 0%, 0 0%)",
            opacity: 0.9,
            transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] } 
          }}
          className="fixed inset-0 z-[9999] flex flex-col justify-between p-8 md:p-12 bg-[#090a0f] text-white selection:bg-none overflow-hidden pointer-events-auto"
        >
          {/* Ambient Lighting FX */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[450px] w-[450px] rounded-full bg-blue-500/10 blur-[120px] pointer-events-none animate-pulse" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[250px] w-[250px] rounded-full bg-white/10 blur-[80px] pointer-events-none" />

          {/* Top Bar: Brand & Status */}
          <div className="relative z-10 flex items-center justify-between text-xs font-mono uppercase tracking-widest text-white/40">
            <div className="flex items-center gap-2">
              <div className="relative flex h-8 w-8 items-center justify-center">
                <Image 
                  src="/favicon.ico" 
                  alt="Logo" 
                  width={20} 
                  height={20} 
                  className="invert opacity-90" 
                />
              </div>
              <span className="hidden sm:inline-block text-white/70 font-sans font-semibold">CHEMITHA SATHSILU</span>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full text-white animate-pulse">▂</span>
              <span>{statusText}</span>
            </div>
          </div>

          {/* Center Stage: Massive Spinner & Indeterminate Bar */}
          <div className="relative z-10 my-auto flex flex-col items-center justify-center gap-8">
            {/* Big Braille Spinner */}
            <div className="font-mono text-8xl sm:text-9xl font-extralight text-white select-none drop-shadow-[0_0_25px_rgba(255,255,255,0.3)] min-w-[1ch] text-center">
              {SPINNER_FRAMES[spinnerIndex]}
            </div>

            {/* Indeterminate Glass Bar */}
            <div className="relative w-64 sm:w-80 h-1.5 overflow-hidden rounded-full bg-white/10 p-[1px] backdrop-blur-sm border border-white/10">
              <motion.div
                className="h-full w-1/3 rounded-full bg-gradient-to-r from-transparent via-white to-transparent shadow-[0_0_15px_rgba(255,255,255,0.8)]"
                initial={{ x: "-100%" }}
                animate={{ x: "300%" }}
                transition={{
                  repeat: Infinity,
                  duration: 1.4,
                  ease: "easeInOut",
                }}
              />
            </div>
          </div>

          {/* Bottom Bar: Metadata */}
          <div className="relative z-10 flex items-center justify-between text-[11px] font-mono text-white/30">
            <span>COLOMBO, LK</span>
            <span>PORTFOLIO © {new Date().getFullYear()}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Preloader;