"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronUp, ChevronDown } from "lucide-react";

export const VerticalScrollPagination: React.FC = () => {
  const [sections, setSections] = useState<string[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

// 1. Auto-detect & sync ONLY top-level main sections dynamically
  useEffect(() => {
    let intersectionObserver: IntersectionObserver | null = null;

    const scanAndObserveSections = () => {
      const mainContainer = document.querySelector<HTMLElement>(".overflow-y-scroll");

      // Query ONLY top-level direct child sections of the scroll container
      const sectionElements = mainContainer
        ? Array.from(mainContainer.querySelectorAll<HTMLElement>(":scope > section"))
        : Array.from(document.querySelectorAll<HTMLElement>("main > section, body > section"));

      if (sectionElements.length === 0) {
        setSections([]);
        return;
      }

      // Ensure every top-level section has a valid ID for scrolling
      const ids: string[] = sectionElements.map((el, idx) => {
        if (!el.id) {
          el.id = `section-${idx + 1}`;
        }
        return el.id;
      });

      // Only update state when section list actually changes
      setSections((prev) => {
        if (prev.length === ids.length && prev.every((id, i) => id === ids[i])) {
          return prev;
        }
        return ids;
      });

      // Clean up previous IntersectionObserver
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

    // Initial detection pass
    scanAndObserveSections();

    // DOM MutationObserver watching ONLY top-level direct child additions/removals
    const targetNode = document.querySelector(".overflow-y-scroll") || document.body;
    const mutationObserver = new MutationObserver((mutations) => {
      const hasDirectChildChanges = mutations.some((m) => m.type === "childList");
      if (hasDirectChildChanges) {
        scanAndObserveSections();
      }
    });

    mutationObserver.observe(targetNode, {
      childList: true,
      subtree: false, // Ignores internal component re-renders and nested sub-sections
    });

    return () => {
      if (intersectionObserver) intersectionObserver.disconnect();
      mutationObserver.disconnect();
    };
  }, []);

  const scrollToSection = (index: number) => {
    const targetId = sections[index];
    const el = document.getElementById(targetId);

    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handlePrev = () => {
    const next = activeIndex > 0 ? activeIndex - 1 : sections.length - 1;
    scrollToSection(next);
  };

  const handleNext = () => {
    const next = activeIndex < sections.length - 1 ? activeIndex + 1 : 0;
    scrollToSection(next);
  };

  // 2. Complete Guard (Inputs + Modals + Scroll Lock)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "ArrowUp" && e.key !== "ArrowDown") return;

      const activeEl = document.activeElement as HTMLElement | null;

      // 1. ALLOW NATIVE ARROWS IN INPUT FIELDS & TEXTAREAS
      const isTyping =
        activeEl &&
        (activeEl.tagName === "INPUT" ||
          activeEl.tagName === "TEXTAREA" ||
          activeEl.tagName === "SELECT" ||
          activeEl.isContentEditable ||
          activeEl.closest("input, textarea, select, [contenteditable='true']") !== null);

      if (isTyping) {
        return; // Allow native cursor navigation in inputs
      }

      // 2. ALLOW NATIVE ARROWS INSIDE SCROLLABLE MODAL BOXES
      if (activeEl) {
        const scrollableParent = activeEl.closest(".overflow-y-auto, .overflow-auto");
        if (
          scrollableParent &&
          scrollableParent !== document.body &&
          scrollableParent !== document.documentElement
        ) {
          return; // Allow native scrolling inside inner modal content
        }
      }

      // 3. STOP ARROWS COMPLETELY WHEN WEBSITE SCROLLING IS DISABLED OR DIALOG IS OPEN
      const mainContainer = document.querySelector<HTMLElement>(".overflow-y-scroll");
      const bodyStyle = window.getComputedStyle(document.body);

      const isScrollDisabled =
        document.body.style.overflow === "hidden" ||
        bodyStyle.overflow === "hidden" ||
        bodyStyle.overflowY === "hidden" ||
        mainContainer?.style.overflowY === "hidden" ||
        (mainContainer && window.getComputedStyle(mainContainer).overflowY === "hidden") ||
        document.querySelector('[role="dialog"]') !== null ||
        document.querySelector('[role="alertdialog"]') !== null ||
        document.querySelector('[aria-modal="true"]') !== null ||
        document.querySelector('[data-prevent-arrow-nav="true"]') !== null ||
        document.querySelector('[data-no-arrow-nav="true"]') !== null;

      if (isScrollDisabled) {
        // Prevent default native scroll so CSS scroll-snap cannot jump sections!
        e.preventDefault();
        e.stopPropagation();
        return;
      }

      // 4. TRIGGER SMOOTH SECTION PAGINATION
      e.preventDefault();

      if (e.key === "ArrowUp") {
        const prevIndex = activeIndex > 0 ? activeIndex - 1 : sections.length - 1;
        scrollToSection(prevIndex);
      } else if (e.key === "ArrowDown") {
        const nextIndex = activeIndex < sections.length - 1 ? activeIndex + 1 : 0;
        scrollToSection(nextIndex);
      }
    };

    window.addEventListener("keydown", handleKeyDown, { capture: true });
    return () => window.removeEventListener("keydown", handleKeyDown, { capture: true });
  }, [activeIndex, sections]);

  return (
    <aside
      aria-label="Page navigation"
      className="fixed right-6 top-1/2 z-50 -translate-y-1/2 hidden md:flex flex-col items-center gap-3"
    >
      <button
        onClick={handlePrev}
        aria-label="Previous section"
        className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1e1e20]/80 backdrop-blur-md border border-white/10 text-gray-400 transition-colors hover:bg-[#2a2a2d] hover:text-white active:scale-95 shadow-lg"
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
              aria-label={`Scroll to section ${id}`}
              className="relative flex w-2.5 items-center justify-center py-0.5 focus:outline-none"
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
        aria-label="Next section"
        className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1e1e20]/80 backdrop-blur-md border border-white/10 text-gray-400 transition-colors hover:bg-[#2a2a2d] hover:text-white active:scale-95 shadow-lg"
      >
        <ChevronDown className="h-5 w-5" />
      </button>
    </aside>
  );
};

/**
 * Helper component: Render <DisableArrowNav /> anywhere in a component or modal to pause
 * section arrow-key navigation while that component is mounted on screen.
 */
export const DisableArrowNav: React.FC = () => {
  useEffect(() => {
    document.body.setAttribute("data-prevent-arrow-nav", "true");
    return () => {
      document.body.removeAttribute("data-prevent-arrow-nav");
    };
  }, []);
  return null;
};