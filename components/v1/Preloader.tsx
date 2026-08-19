"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

export const Preloader: React.FC = () => {
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // --- TIMING CONFIGURATION (ms) ---
    const SIMULATED_SPEED = 25;
    const HOLD_DELAY = 300;
    const FINAL_STEP_SPEED = 15;
    const EXIT_DELAY = 200;
    const SAFETY_TIMEOUT = 5000;

    let isLoaded = document.readyState === "complete";
    let isHolding = false;
    let timer: NodeJS.Timeout;
    let currentProgress = 0;

    const handleLoad = () => {
      isLoaded = true;
    };

    if (!isLoaded) {
      window.addEventListener("load", handleLoad, { once: true });
    }

    const fallbackTimer = setTimeout(() => {
      isLoaded = true;
    }, SAFETY_TIMEOUT);

    const tick = () => {
      if (currentProgress >= 100) {
        setTimeout(() => setIsLoading(false), EXIT_DELAY);
        return;
      }

      if (!isLoaded) {
        if (currentProgress < 90) {
          currentProgress += 1;
          setProgress(currentProgress);
          timer = setTimeout(tick, SIMULATED_SPEED);
        } else {
          timer = setTimeout(tick, 50);
        }
        return;
      }

      if (!isHolding) {
        isHolding = true;
        timer = setTimeout(tick, HOLD_DELAY);
        return;
      }

      currentProgress += 1;
      setProgress(currentProgress);
      timer = setTimeout(tick, FINAL_STEP_SPEED);
    };

    tick();

    return () => {
      clearTimeout(timer);
      clearTimeout(fallbackTimer);
      window.removeEventListener("load", handleLoad);
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
          className="fixed inset-0 z-[9999] flex flex-col justify-between p-8 md:p-12 bg-[#090a0f] text-white selection:bg-none overflow-hidden"
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
              <span>INITIALIZING SYSTEM...</span>
            </div>
          </div>

          {/* Center Stage: Hero Counter & Bar */}
          <div className="relative z-10 my-auto flex flex-col items-center justify-center gap-8">
            {/* Big Counter */}
            <div className="flex items-baseline font-mono text-7xl sm:text-9xl font-extralight tracking-tighter text-white">
              <motion.span
                key={progress}
                initial={{ opacity: 0.8, y: 2 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.1 }}
              >
                {progress.toString().padStart(2, "0")}
              </motion.span>
              <span className="text-2xl sm:text-4xl font-light text-white/30 ml-1">%</span>
            </div>

            {/* Premium Glass Bar */}
            <div className="relative w-64 sm:w-80 h-1.5 overflow-hidden rounded-full bg-white/10 p-[1px] backdrop-blur-sm border border-white/10">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-white/70 via-white to-white/90 shadow-[0_0_15px_rgba(255,255,255,0.8)]"
                initial={{ width: "0%" }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.05, ease: "linear" }}
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