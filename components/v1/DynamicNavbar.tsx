"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "@/app/globals.css";
import { HighlightTrigger } from "@/components/v1/HighlightTrigger";

interface DynamicNavbarProps {
  triggerSelector?: string;
  triggerId?: string;
  scrollOffset?: number;
}

const NAV_LINKS = [
  { name: "About", href: "#about" },
  { name: "Projects", href: "#projects" },
  { name: "Labs", href: "https://labs.chemitha.com" },
  { name: "Contact", href: "#contact" },
];

export const DynamicNavbar: React.FC<DynamicNavbarProps> = ({
  triggerSelector,
  triggerId,
  scrollOffset = 100,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const headerRef = useRef<HTMLElement>(null);

  // Close menu when clicking outside the header container
  useEffect(() => {
    if (!isMobileMenuOpen) return;

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (headerRef.current && !headerRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mediaQuery = window.matchMedia("(min-width: 768px)");
    setIsDesktop(mediaQuery.matches);
    const handleMediaChange = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mediaQuery.addEventListener("change", handleMediaChange);
    return () => mediaQuery.removeEventListener("change", handleMediaChange);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const targetQuery = triggerId ? `#${triggerId}` : triggerSelector;

    if (targetQuery) {
      let observer: IntersectionObserver | null = null;

      const initObserver = () => {
        const targetEl = document.querySelector(targetQuery);
        if (!targetEl) return false;

        observer = new IntersectionObserver(
          ([entry]) => {
            setIsScrolled(!entry.isIntersecting && entry.boundingClientRect.top < 0);
          },
          { threshold: 0 }
        );

        observer.observe(targetEl);
        return true;
      };

      if (!initObserver()) {
        const rafId = requestAnimationFrame(() => initObserver());
        return () => {
          cancelAnimationFrame(rafId);
          if (observer) observer.disconnect();
        };
      }

      return () => {
        if (observer) observer.disconnect();
      };
    }

    const handleScroll = (e: Event) => {
      const target = e.target as HTMLElement;
      const scrollTop =
        target && typeof target.scrollTop === "number" && target.scrollTop > 0
          ? target.scrollTop
          : window.scrollY;
      setIsScrolled(scrollTop > scrollOffset);
    };

    window.addEventListener("scroll", handleScroll, { capture: true, passive: true });
    return () => window.removeEventListener("scroll", handleScroll, { capture: true });
  }, [triggerSelector, triggerId, scrollOffset]);

  const shouldShrink = isScrolled && isDesktop;

  const navBackgroundColor = !isDesktop
    ? "rgba(40, 40, 71, 0.5)"
    : isScrolled
    ? "rgba(40, 40, 71, 0.2)"
    : "rgba(68, 68, 112, 0.2)";

  return (
    <>
      {/* Dimmed backdrop to catch clicks outside on mobile */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-xs md:hidden"
          />
        )}
      </AnimatePresence>

      <header ref={headerRef} className="fixed top-0 left-0 right-0 z-50 flex flex-col items-center p-4">
        <motion.nav
          initial={false}
          animate={{
            width: shouldShrink ? "871px" : "100%",
            maxWidth: shouldShrink ? "871px" : "1200px",
            backgroundColor: navBackgroundColor,
            boxShadow: isScrolled
              ? "6px 8px 28px rgba(15, 15, 49, 0.07)"
              : "0px 0px 0px rgba(0, 0, 0, 0)",
          }}
          transition={{ type: "spring", stiffness: 260, damping: 28 }}
          style={{
            padding: "12px 18px",
            backdropFilter: "blur(40px)",
            WebkitBackdropFilter: "blur(40px)",
            borderRadius: "100px",
            borderColor: "rgba(234, 237, 240, 0.08)",
          } as React.CSSProperties}
          className="relative flex h-[72px] w-full items-center justify-between border border-solid box-border"
        >
          <a href="#" className="flex items-center shrink-0">
            <div className="flex h-13 w-13 items-center justify-center rounded-full bg-[#f1f0f5] p-2">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 325 325" 
                fill="currentColor"
                className="h-full w-full text-white mix-blend-difference"
              >
                <path d="M155.8 53.9c-9.5 7.5-32.4 19.7-47.9 25.4-18.8 7.1-46.1 12.6-70.1 14.3-4.9.3-8.8.9-8.8 1.2 0 .4 1.5 6.1 3.4 12.7l3.4 12 8.3-.3c11.8-.4 29.5-2.8 42.4-5.7 6-1.4 11.3-2.5 11.8-2.5s.7 14.3.5 31.7c-.4 31.1-.5 32-3.1 40.6-8.2 26.8-26.3 46.5-54.2 59.2l-7.6 3.5 4 5.9c4.8 7.1 8 9.7 13.3 11.2 7 1.8 13.4-.7 28-11.1 22.5-16 38.5-39.2 44.4-64.5 1.5-6.1 2.8-11.6 3-12.3.3-1.1 3.7-1.3 16.7-1 15.5.3 16.5.4 20 2.8 6.7 4.5 7.7 8.2 7.7 27.8V222h28v-16.9c0-9.2-.4-19.1-1-21.9-2.1-11.2-10-22.9-19.4-28.9-7.8-5-11-5.6-31.1-6.2l-19-.6-.3-23.6-.2-23.7 5.6-2.2c11.3-4.6 43.4-24.5 43.4-26.8 0-.4-4.2-4.9-9.3-10l-9.3-9.3z"/>
                <path d="M256.9 101c-4.2 1.2-7.7 4-10.1 7.9-2.1 3.3-2.3 5.1-2.8 21.1l-.5 17.5h-44l-.3-18.8-.2-18.7h-5.3c-7.8 0-15.3 4-19.2 10.4-2.3 3.8-3 6.3-3.3 11.5l-.4 6.7 7.8 3.9c10.4 5 20.7 15.2 25.2 24.7l3.2 6.8 18.3.2 18.2.3-.3 10c-1.1 30.5-12.9 52.4-36.9 68.2-9.7 6.4-15.9 9.2-31.1 14.3-6.2 2.1-11.3 4.1-11.3 4.4-.1 1.9 6.4 11.6 9.5 14.4 5.6 4.9 10.3 5.9 17.9 3.8 15.6-4.3 36.7-16.8 49.4-29.4 19.8-19.3 28.9-41.2 31-74.2l.8-11.5 13.5-.5c11.8-.4 14-.8 17.2-2.8 5.5-3.4 8-8.2 8.6-16.3l.5-6.9-19.9-.2-19.9-.3-.3-23.8-.2-23.7-6.3.1c-3.4 0-7.4.4-8.8.9M23.2 150.1c-6.7 3.3-10.2 9.9-10.2 19v4.9h73.8l.6-2.8c.3-1.5.8-7.3 1.2-13l.7-10.2H58.4c-29.4 0-31.1.1-35.2 2.1"/>
              </svg>
            </div>
          </a>

          <div className="hidden md:flex items-center gap-8 ml-auto pr-6">
            {NAV_LINKS.map((link) =>
              link.name === "Contact" ? (
                <HighlightTrigger
                  key={link.name}
                  className="text-[18px] font-semibold text-white/90 hover:text-white transition-colors tracking-wide cursor-pointer"
                >
                  {link.name}
                </HighlightTrigger>
              ) : (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-[18px] font-semibold text-white/90 hover:text-white transition-colors tracking-wide"
                >
                  {link.name}
                </a>
              )
            )}
          </div>

          <div className="hidden md:flex items-center gap-2">
            <a
              href="#services"
              className="rounded-full bg-foreground hover:bg-[#ccc] px-[32.5px] py-[12px] text-[16px] font-bold text-background shadow-lg transition-all hover:scale-[1.02] active:scale-95 leading-none flex items-center justify-center"
            >
              Services
            </a>
          </div>

          <MenuIcon
            toggle={isMobileMenuOpen}
            setToggle={setIsMobileMenuOpen}
            className="flex md:hidden text-white p-2 ml-auto"
          />
        </motion.nav>

        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              style={{
                backgroundColor: "rgba(40, 40, 71, 0.5)",
                backdropFilter: "blur(24px)",
                WebkitBackdropFilter: "blur(24px)",
                borderColor: "rgba(234, 237, 240, 0.08)",
              } as React.CSSProperties}
              className="w-full max-w-[1200px] mt-2 rounded-2xl p-5 border shadow-2xl flex flex-col gap-4 md:hidden z-50"
            >
              {NAV_LINKS.map((link) =>
                link.name === "Contact" ? (
                  <HighlightTrigger
                    key={link.name}
                    onBeforeTrigger={() => setIsMobileMenuOpen(false)}
                    className="text-lg font-bold text-white/90 hover:text-white py-1 cursor-pointer"
                  >
                    {link.name}
                  </HighlightTrigger>
                ) : (
                  <a
                    key={link.name}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-lg font-bold text-white/90 hover:text-white py-1"
                  >
                    {link.name}
                  </a>
                )
              )}
              <div className="pt-2 border-t border-white/10 flex flex-col gap-2">
                <a
                  href="#services"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full text-center rounded-full bg-foreground hover:bg-[#ccc] py-3 text-base font-bold text-background shadow-md"
                >
                  Services
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
};

interface MenuIconProps {
  className?: string;
  toggle: boolean;
  setToggle: React.Dispatch<React.SetStateAction<boolean>>;
}

const MenuIcon: React.FC<MenuIconProps> = ({ className, toggle, setToggle }) => {
  return (
    <div
      onClick={() => setToggle((x) => !x)}
      className={`group flex size-10 cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-white/5 ${className || ""}`}
    >
      <div className="relative grid size-4 cursor-pointer items-center justify-center">
        <motion.div
          animate={{ y: toggle ? 0 : "-5px", rotate: toggle ? 45 : 0 }}
          className="absolute h-0.5 w-full rounded-full bg-current"
        ></motion.div>
        <motion.div
          animate={{ opacity: toggle ? 0 : 1 }}
          transition={{ duration: 0.1 }}
          className="absolute h-0.5 w-full rounded-full bg-current"
        ></motion.div>
        <motion.div
          animate={{ y: toggle ? 0 : "5px", rotate: toggle ? -45 : 0 }}
          className="absolute h-0.5 w-full rounded-full bg-current"
        ></motion.div>
      </div>
    </div>
  );
};