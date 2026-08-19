"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";

export type TooltipSide = "up" | "down" | "left" | "right";

interface TooltipProps {
  content: React.ReactNode;
  side?: TooltipSide;
  children: React.ReactNode;
  delay?: number;
  className?: string; // Styles the wrapper container
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
  const [mounted, setMounted] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number; width: number; height: number }>({
    top: 0,
    left: 0,
    width: 0,
    height: 0,
  });

  const triggerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Ensure Portal renders only on client side (Next.js / SSR compatibility)
  useEffect(() => {
    setMounted(true);
  }, []);

  const updatePosition = useCallback(() => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setCoords({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      });
    }
  }, []);

  const handleMouseEnter = () => {
    updatePosition();
    timeoutRef.current = setTimeout(() => {
      updatePosition();
      setIsVisible(true);
    }, delay);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsVisible(false);
  };

  // Recalculate position on window resize or scroll while visible
  useEffect(() => {
    if (!isVisible) return;

    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);

    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [isVisible, updatePosition]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // Viewport-based coordinates & styles
  const sideStyles: Record<
    TooltipSide,
    {
      fixedStyle: React.CSSProperties;
      alignmentClass: string;
      arrow: string;
      initial: { opacity: number; scale: number; x?: number; y?: number };
      animate: { opacity: number; scale: number; x?: number; y?: number };
      exit: { opacity: number; scale: number; x?: number; y?: number };
    }
  > = {
    up: {
      fixedStyle: {
        top: coords.top - 8,
        left: coords.left + coords.width / 2,
      },
      alignmentClass: "-translate-x-1/2 -translate-y-full",
      arrow:
        "top-full left-1/2 -translate-x-1/2 border-t-zinc-950 border-x-transparent border-b-transparent border-t-4 border-x-4 border-b-0",
      initial: { opacity: 0, scale: 0.92, y: 6 },
      animate: { opacity: 1, scale: 1, y: 0 },
      exit: { opacity: 0, scale: 0.92, y: 4 },
    },
    down: {
      fixedStyle: {
        top: coords.top + coords.height + 8,
        left: coords.left + coords.width / 2,
      },
      alignmentClass: "-translate-x-1/2",
      arrow:
        "bottom-full left-1/2 -translate-x-1/2 border-b-zinc-950 border-x-transparent border-t-transparent border-b-4 border-x-4 border-t-0",
      initial: { opacity: 0, scale: 0.92, y: -6 },
      animate: { opacity: 1, scale: 1, y: 0 },
      exit: { opacity: 0, scale: 0.92, y: -4 },
    },
    left: {
      fixedStyle: {
        top: coords.top + coords.height / 2,
        left: coords.left - 8,
      },
      alignmentClass: "-translate-x-full -translate-y-1/2",
      arrow:
        "left-full top-1/2 -translate-y-1/2 border-l-zinc-950 border-y-transparent border-r-transparent border-l-4 border-y-4 border-r-0",
      initial: { opacity: 0, scale: 0.92, x: 6 },
      animate: { opacity: 1, scale: 1, x: 0 },
      exit: { opacity: 0, scale: 0.92, x: 4 },
    },
    right: {
      fixedStyle: {
        top: coords.top + coords.height / 2,
        left: coords.left + coords.width + 8,
      },
      alignmentClass: "-translate-y-1/2",
      arrow:
        "right-full top-1/2 -translate-y-1/2 border-r-zinc-950 border-y-transparent border-l-transparent border-r-4 border-y-4 border-l-0",
      initial: { opacity: 0, scale: 0.92, x: -6 },
      animate: { opacity: 1, scale: 1, x: 0 },
      exit: { opacity: 0, scale: 0.92, x: -4 },
    },
  };

  const currentSide = sideStyles[side];

  return (
    <div
      ref={triggerRef}
      className={`relative inline-flex items-center justify-center ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleMouseEnter}
      onBlur={handleMouseLeave}
    >
      {children}

      {/* PORTAL: Mounts to document.body outside all overflow wrappers */}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {isVisible && (
              <div
                style={currentSide.fixedStyle}
                className={`fixed z-[9999] pointer-events-none ${currentSide.alignmentClass}`}
              >
                <motion.div
                  initial={currentSide.initial}
                  animate={currentSide.animate}
                  exit={currentSide.exit}
                  transition={{ type: "spring", stiffness: 420, damping: 26 }}
                  className={`relative flex items-center justify-center whitespace-nowrap rounded-xl border border-white/10 bg-zinc-950/90 px-3 py-1.5 text-xs font-medium text-zinc-100 shadow-[0_10px_38px_-10px_rgba(0,0,0,0.8),0_0_0_1px_rgba(255,255,255,0.05)] backdrop-blur-md ${contentClassName}`}
                >
                  {/* Subtle Ambient Specular Top Highlight */}
                  <div className="pointer-events-none absolute inset-x-0 -top-px mx-auto h-[1px] w-3/4 bg-gradient-to-r from-transparent via-white/25 to-transparent" />

                  {content}

                  {/* Arrow Indicator */}
                  <span
                    className={`absolute h-0 w-0 border-solid ${currentSide.arrow}`}
                  />
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
}