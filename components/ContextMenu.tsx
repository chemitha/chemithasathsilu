"use client";

import React, { useEffect, useState, useRef } from "react";

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
      // Strictly trigger on right click (button 2 or contextmenu event)
      if (e.button !== 2 && e.button !== 0 && e.which !== 3) {
        return;
      }

      e.preventDefault();

      const menuWidth = isMobile ? 0 : 220;
      const menuHeight = isMobile ? 0 : 280;
      const x = e.clientX + menuWidth > window.innerWidth ? e.clientX - menuWidth : e.clientX;
      const y = e.clientY + menuHeight > window.innerHeight ? e.clientY - menuHeight : e.clientY;

      setPosition({ x, y });
      setVisible(true);
    };

    const handleHide = (e?: Event) => {
      if (e && e.type === "pointerdown" && menuRef.current?.contains(e.target as Node)) {
        return;
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
  }, [isMobile]);

  if (!visible) return null;

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
          <svg className="w-4 h-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
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

  const items = getMenuItems();

  // Mobile Bottom Sheet UI
  if (isMobile) {
    return (
      <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm transition-opacity">
        <div
          ref={menuRef}
          className="w-full max-w-md bg-[#18131d] border-t border-white/10 rounded-t-2xl p-4 text-[#e0dce6] shadow-2xl animate-in slide-in-from-bottom duration-200 select-none font-sans"
        >
          {/* Grab Handle Header */}
          <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-4" />

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

          <button
            onClick={() => setVisible(false)}
            className="w-full mt-3 py-2.5 text-center text-xs text-neutral-400 font-medium bg-white/5 rounded-xl active:bg-white/10"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  // Desktop Context Menu UI
  return (
    <div
      ref={menuRef}
      style={{ top: `${position.y}px`, left: `${position.x}px` }}
      className="fixed z-50 w-56 bg-[#18131d]/95 backdrop-blur-md text-[#e0dce6] rounded-xl shadow-2xl text-[12px] py-1.5 border border-white/10 select-none font-sans !cursor-pointer"
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
    </div>
  );
}

export default ContextMenu;