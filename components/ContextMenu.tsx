"use client";

import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import {
  motion,
  AnimatePresence,
  PanInfo,
  useMotionValue,
  useTransform,
} from "framer-motion";

type MenuItem =
  | {
      label: string;
      shortcut?: string;
      icon?: React.ReactNode;
      action?: () => void;
      highlight?: boolean;
      type?: undefined;
    }
  | { type: "separator" };

export function ContextMenu() {
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [browser, setBrowser] = useState<"Default" | "Chrome" | "Firefox" | "Edge">("Default");
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Dynamic handle bending state
  const dragY = useMotionValue(0);

  // Calculate sharp arrow bend offset (Y offset between -8px and +8px)
  const bendY = useTransform(dragY, [-250, 0, 100], [-5, 0, 5], { clamp: true });

  // Map bend offset to sharp pointed line path (M left L center L right)
  const handlePath = useTransform(bendY, (y) => `M 4 12 L 24 ${12 + y} L 44 12`);

  const visibleRef = useRef(visible);
  useEffect(() => {
    visibleRef.current = visible;
  }, [visible]);

  const isMobileRef = useRef(isMobile);
  useEffect(() => {
    isMobileRef.current = isMobile;
  }, [isMobile]);

  useEffect(() => {
    const ua = navigator.userAgent;
    if (ua.includes("Edg/")) setBrowser("Edge");
    else if (ua.includes("Firefox/")) setBrowser("Firefox");
    else if (ua.includes("Chrome/") && !ua.includes("Edg/")) setBrowser("Chrome");
    else setBrowser("Default");

    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);

    const checkSpeechState = () => {
      if ("speechSynthesis" in window) {
        setIsSpeaking(window.speechSynthesis.speaking);
      }
    };

    const interval = setInterval(checkSpeechState, 500);
    return () => {
      clearInterval(interval);
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      if (e.button !== 2 && e.button !== 0 && e.which !== 3) {
        return;
      }

      if (isMobileRef.current && visibleRef.current) {
        e.preventDefault();
        return;
      }

      e.preventDefault();

      const menuWidth = isMobileRef.current ? 0 : 220;
      const menuHeight = isMobileRef.current ? 0 : 280;
      const x = e.clientX + menuWidth > window.innerWidth ? e.clientX - menuWidth : e.clientX;
      const y = e.clientY + menuHeight > window.innerHeight ? e.clientY - menuHeight : e.clientY;

      setPosition({ x, y });
      setVisible(true);
    };

    const handleHide = (e?: Event) => {
      if (e && e.type === "pointerdown") {
        const mouseEvent = e as MouseEvent;
        const isRightClick = mouseEvent.button === 2 || mouseEvent.which === 3;

        if (isMobileRef.current && isRightClick && visibleRef.current) {
          return;
        }

        if (menuRef.current?.contains(e.target as Node)) {
          return;
        }
      }
      setVisible(false);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) setVisible(false);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setVisible(false);
    };

    window.addEventListener("contextmenu", handleContextMenu);
    window.addEventListener("pointerdown", handleHide, { capture: true });
    window.addEventListener("blur", handleHide);
    window.addEventListener("scroll", handleHide, { capture: true });
    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("contextmenu", handleContextMenu);
      window.removeEventListener("pointerdown", handleHide, { capture: true });
      window.removeEventListener("blur", handleHide);
      window.removeEventListener("scroll", handleHide, { capture: true });
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReadAloud = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const selection = window.getSelection()?.toString();
      const textToRead =
        selection && selection.trim().length > 0
          ? selection
          : document.title + ". " + (document.querySelector("main")?.innerText || document.body.innerText).slice(0, 300);

      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  const handleStopSpeech = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const getMenuItems = (): MenuItem[] => {
    const baseNav: MenuItem[] = [
      { label: "Back", shortcut: "Alt+←", action: () => window.history.back() },
      { label: "Forward", shortcut: "Alt+→", action: () => window.history.forward() },
      { label: "Reload", shortcut: "Ctrl+R", action: () => window.location.reload() },
      { type: "separator" },
      {
        label: "Go to Homepage",
        icon: (
          <Image
            src="/favicon-l.ico"
            alt="Home"
            width={16}
            height={16}
            className="w-4 h-4 object-contain shrink-0"
          />
        ),
        action: () => (window.location.href = "/"),
      },
      { type: "separator" },
      {
        label: copied ? "Link Copied!" : "Copy Page Link",
        icon: (
          <svg className="w-4 h-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        ),
        action: handleCopyLink,
      },
      {
        label: "View Resume",
        icon: (
          <svg className="w-4 h-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        ),
        action: () => window.open("/resume.pdf", "_blank"),
      },
    ];

    if (browser === "Firefox") {
      baseNav.push({
        label: "Select All",
        shortcut: "Ctrl+A",
        action: () => document.execCommand("selectAll"),
      });
    }

    if (browser === "Edge") {
      if (isSpeaking) {
        baseNav.push({
          label: "Stop Read Aloud",
          highlight: true,
          icon: (
            <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
            </svg>
          ),
          action: handleStopSpeech,
        });
      } else {
        baseNav.push({
          label: "Read Aloud",
          shortcut: "Ctrl+Shift+U",
          action: handleReadAloud,
        });
      }
    }

    baseNav.push({
      label: "Print Page",
      shortcut: "Ctrl+P",
      action: () => window.print(),
    });

    return baseNav;
  };

  const handleDragEnd = (_: any, info: PanInfo) => {
    dragY.set(0); // Instantly reset the handle line back to flat state
    if (info.offset.y > 80 || info.velocity.y > 200) {
      setVisible(false);
    }
  };

  const items = getMenuItems();

  return (
    <AnimatePresence>
      {visible && (
        <>
          {isMobile ? (
            /* Mobile Sheet UI */
            <div className="fixed inset-0 z-50 flex items-end justify-center pointer-events-auto overflow-hidden">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setVisible(false)}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              />
              <motion.div
                ref={menuRef}
                drag="y"
                dragConstraints={{ top: 0, bottom: 0 }}
                dragElastic={{ top: 0.08, bottom: 0.6 }}
                onDrag={(_, info) => dragY.set(info.offset.y)}
                onDragEnd={handleDragEnd}
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 28, stiffness: 350 }}
                className="relative z-10 w-full max-w-md bg-[#18131d] border-t border-white/10 rounded-t-2xl p-4 pb-32 -mb-28 text-[#e0dce6] shadow-2xl select-none font-sans touch-none"
              >
                {/* Dynamic Sharp Arrow Pull Handle */}
                <div className="flex justify-center mb-2 cursor-grab active:cursor-grabbing">
                  <svg width="48" height="24" viewBox="0 0 48 24" className="overflow-visible">
                    <motion.path
                      d={handlePath}
                      fill="none"
                      stroke="rgba(255, 255, 255, 0.4)"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>

                <div className="space-y-1">
                  {items.map((item, index) => {
                    if (item.type === "separator") {
                      return <div key={index} className="h-px bg-white/10 my-2" />;
                    }

                    return (
                      <div
                        key={index}
                        onClick={() => {
                          if (item.action) item.action();
                          setVisible(false);
                        }}
                        className={`flex items-center justify-between px-4 py-3 rounded-xl hover:bg-white/10 active:bg-white/15 !cursor-pointer transition-colors ${
                          item.highlight ? "text-red-300 font-medium bg-red-500/10" : ""
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {item.icon ? <span className="shrink-0">{item.icon}</span> : <div className="w-4 shrink-0" />}
                          <span className="text-sm font-medium">{item.label}</span>
                        </div>
                        {item.shortcut && <span className="text-neutral-500 text-xs">{item.shortcut}</span>}
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            </div>
          ) : (
            /* Desktop Context Menu UI */
            <motion.div
              ref={menuRef}
              style={{ top: `${position.y}px`, left: `${position.x}px` }}
              initial={{ opacity: 0, scale: 0.92, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -2 }}
              transition={{ duration: 0.12, ease: "easeOut" }}
              className="fixed z-50 w-56 bg-[#18131d]/95 backdrop-blur-md text-[#e0dce6] rounded-xl shadow-2xl text-[12px] py-1.5 border border-white/10 select-none font-sans !cursor-pointer origin-top-left"
            >
              {items.map((item, index) => {
                if (item.type === "separator") {
                  return <div key={index} className="h-px bg-white/10 my-1.5" />;
                }

                return (
                  <div
                    key={index}
                    onClick={() => {
                      if (item.action) item.action();
                      setVisible(false);
                    }}
                    className={`flex items-center justify-between px-3 py-1.5 hover:bg-white/10 !cursor-pointer transition-colors ${
                      item.highlight ? "text-red-300 font-medium bg-red-500/10 hover:bg-red-500/20" : ""
                    }`}
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden !cursor-pointer">
                      {item.icon ? <span className="shrink-0">{item.icon}</span> : <div className="w-3.5 shrink-0" />}
                      <span className="truncate !cursor-pointer">{item.label}</span>
                    </div>
                    {item.shortcut && <span className="text-neutral-500 text-[10px] ml-2 shrink-0 !cursor-pointer">{item.shortcut}</span>}
                  </div>
                );
              })}
            </motion.div>
          )}
        </>
      )}
    </AnimatePresence>
  );
}

export default ContextMenu;