"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronUp, ChevronDown } from "lucide-react";

export const VerticalScrollPagination: React.FC = () => {
  const [sections, setSections] = useState<string[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLocked, setIsLocked] = useState(false);

  // Detect when modals or scroll lock are active
  useEffect(() => {
    const checkIsScrollLocked = () => {
      const mainContainer = document.querySelector<HTMLElement>(".overflow-y-scroll");
      const bodyStyle = typeof window !== "undefined" ? window.getComputedStyle(document.body) : null;

      const locked =
        document.body.style.overflow === "hidden" ||
        bodyStyle?.overflow === "hidden" ||
        bodyStyle?.overflowY === "hidden" ||
        mainContainer?.style.overflowY === "hidden" ||
        (mainContainer && window.getComputedStyle(mainContainer).overflowY === "hidden") ||
        document.querySelector('[role="dialog"]') !== null ||
        document.querySelector('[role="alertdialog"]') !== null ||
        document.querySelector('[aria-modal="true"]') !== null ||
        document.querySelector('[data-prevent-arrow-nav="true"]') !== null ||
        document.querySelector('[data-no-arrow-nav="true"]') !== null;

      setIsLocked(Boolean(locked));
    };

    const mutationObserver = new MutationObserver(checkIsScrollLocked);
    mutationObserver.observe(document.body, { attributes: true, childList: true, subtree: true });
    checkIsScrollLocked();

    return () => mutationObserver.disconnect();
  }, []);

  useEffect(() => {
    let intersectionObserver: IntersectionObserver | null = null;

    const scanAndObserveSections = () => {
      const mainContainer = document.querySelector<HTMLElement>(".overflow-y-scroll");

      const sectionElements = mainContainer
        ? Array.from(mainContainer.querySelectorAll<HTMLElement>(":scope > section"))
        : Array.from(document.querySelectorAll<HTMLElement>("main > section, body > section"));

      if (sectionElements.length === 0) {
        setSections([]);
        return;
      }

      const ids: string[] = sectionElements.map((el, idx) => {
        if (!el.id) {
          el.id = `section-${idx + 1}`;
        }
        return el.id;
      });

      setSections((prev) => {
        if (prev.length === ids.length && prev.every((id, i) => id === ids[i])) {
          return prev;
        }
        return ids;
      });

      if (intersectionObserver) {
        intersectionObserver.disconnect();
      }

      const observerOptions: IntersectionObserverInit = {
        root: mainContainer || null,
        rootMargin: "-45% 0px -45% 0px",
        threshold: 0,
      };

      intersectionObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = ids.indexOf(entry.target.id);
            if (index !== -1) {
              setActiveIndex(index);
            }
          }
        });
      }, observerOptions);

      sectionElements.forEach((el) => intersectionObserver?.observe(el));
    };

    scanAndObserveSections();

    const targetNode = document.querySelector(".overflow-y-scroll") || document.body;
    const mutationObserver = new MutationObserver((mutations) => {
      const hasDirectChildChanges = mutations.some((m) => m.type === "childList");
      if (hasDirectChildChanges) {
        scanAndObserveSections();
      }
    });

    mutationObserver.observe(targetNode, {
      childList: true,
      subtree: false,
    });

    return () => {
      if (intersectionObserver) intersectionObserver.disconnect();
      mutationObserver.disconnect();
    };
  }, []);

  const scrollToSection = (index: number) => {
    if (isLocked) return; // Prevent navigation while modal/dialog is open
    const targetId = sections[index];
    const el = document.getElementById(targetId);

    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handlePrev = () => {
    if (isLocked) return;
    const next = activeIndex > 0 ? activeIndex - 1 : sections.length - 1;
    scrollToSection(next);
  };

  const handleNext = () => {
    if (isLocked) return;
    const next = activeIndex < sections.length - 1 ? activeIndex + 1 : 0;
    scrollToSection(next);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "ArrowUp" && e.key !== "ArrowDown") return;

      const activeEl = document.activeElement as HTMLElement | null;

      const isTyping =
        activeEl &&
        (activeEl.tagName === "INPUT" ||
          activeEl.tagName === "TEXTAREA" ||
          activeEl.tagName === "SELECT" ||
          activeEl.isContentEditable ||
          activeEl.closest("input, textarea, select, [contenteditable='true']") !== null);

      if (isTyping) return;

      if (isLocked) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }

      e.preventDefault();

      if (e.key === "ArrowUp") {
        handlePrev();
      } else if (e.key === "ArrowDown") {
        handleNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown, { capture: true });
    return () => window.removeEventListener("keydown", handleKeyDown, { capture: true });
  }, [activeIndex, sections, isLocked]);

  return (
    <aside
      aria-label="Page navigation"
      className={`fixed right-6 top-1/2 z-30 -translate-y-1/2 hidden md:flex flex-col items-center gap-3 transition-opacity duration-300 ${
        isLocked ? "pointer-events-none opacity-20" : "opacity-100"
      }`}
    >
      <button
        onClick={handlePrev}
        disabled={isLocked}
        aria-label="Previous section"
        className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1e1e20]/80 backdrop-blur-md border border-white/10 text-gray-400 transition-colors hover:bg-[#2a2a2d] hover:text-white active:scale-95 shadow-lg disabled:cursor-not-allowed"
      >
        <ChevronUp className="h-5 w-5" />
      </button>

      <div className="flex flex-col items-center gap-1.5 rounded-full bg-[#18181a]/80 backdrop-blur-md border border-white/10 px-2 py-3 shadow-lg">
        {sections.map((id, index) => {
          const isActive = index === activeIndex;
          return (
            <button
              key={id}
              onClick={() => scrollToSection(index)}
              disabled={isLocked}
              aria-label={`Scroll to section ${id}`}
              className="relative flex w-2.5 items-center justify-center py-0.5 focus:outline-none disabled:cursor-not-allowed"
            >
              <motion.div
                initial={false}
                animate={{
                  height: isActive ? 24 : 10,
                  backgroundColor: isActive ? "#ffffff" : "#4a4a50",
                }}
                transition={{ type: "spring", stiffness: 350, damping: 25 }}
                className="w-2.5 rounded-full"
              />
            </button>
          );
        })}
      </div>

      <button
        onClick={handleNext}
        disabled={isLocked}
        aria-label="Next section"
        className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1e1e20]/80 backdrop-blur-md border border-white/10 text-gray-400 transition-colors hover:bg-[#2a2a2d] hover:text-white active:scale-95 shadow-lg disabled:cursor-not-allowed"
      >
        <ChevronDown className="h-5 w-5" />
      </button>
    </aside>
  );
};

export const DisableArrowNav: React.FC = () => {
  useEffect(() => {
    document.body.setAttribute("data-prevent-arrow-nav", "true");
    return () => {
      document.body.removeAttribute("data-prevent-arrow-nav");
    };
  }, []);
  return null;
};