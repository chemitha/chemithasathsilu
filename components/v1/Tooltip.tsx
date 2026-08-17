"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export type TooltipSide = "up" | "down" | "left" | "right";

interface TooltipProps {
  content: React.ReactNode;
  side?: TooltipSide;
  children: React.ReactNode;
  delay?: number;
  className?: string; // Styles the wrapper container (e.g. w-full, flex-1)
  contentClassName?: string; // Styles the tooltip popover box
}

export function Tooltip({
  content,
  side = "up",
  children,
  delay = 150,
  className = "",
  contentClassName = "",
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    timeoutRef.current = setTimeout(() => setIsVisible(true), delay);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsVisible(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // Position-specific positioning and arrow alignments
  const sideStyles: Record<
    TooltipSide,
    { container: string; arrow: string; motionOffset: { x?: number; y?: number } }
  > = {
    up: {
      container: "bottom-full left-1/2 -translate-x-1/2 mb-2",
      arrow:
        "top-full left-1/2 -translate-x-1/2 border-t-zinc-800 border-x-transparent border-b-transparent border-t-4 border-x-4 border-b-0",
      motionOffset: { y: 4 },
    },
    down: {
      container: "top-full left-1/2 -translate-x-1/2 mt-2",
      arrow:
        "bottom-full left-1/2 -translate-x-1/2 border-b-zinc-800 border-x-transparent border-t-transparent border-b-4 border-x-4 border-t-0",
      motionOffset: { y: -4 },
    },
    left: {
      container: "right-full top-1/2 -translate-y-1/2 mr-2",
      arrow:
        "left-full top-1/2 -translate-y-1/2 border-l-zinc-800 border-y-transparent border-r-transparent border-l-4 border-y-4 border-r-0",
      motionOffset: { x: 4 },
    },
    right: {
      container: "left-full top-1/2 -translate-y-1/2 ml-2",
      arrow:
        "right-full top-1/2 -translate-y-1/2 border-r-zinc-800 border-y-transparent border-l-transparent border-r-4 border-y-4 border-l-0",
      motionOffset: { x: -4 },
    },
  };

  const currentSide = sideStyles[side];

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleMouseEnter}
      onBlur={handleMouseLeave}
    >
      {children}

      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, ...currentSide.motionOffset }}
            animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, ...currentSide.motionOffset }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className={`absolute z-50 whitespace-nowrap rounded-lg border border-white/10 bg-zinc-900/90 px-2.5 py-1.5 text-xs font-mono text-zinc-200 shadow-xl backdrop-blur-md pointer-events-none ${currentSide.container} ${contentClassName}`}
          >
            {content}
            {/* Arrow indicator */}
            <span
              className={`absolute h-0 w-0 border-solid ${currentSide.arrow}`}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}