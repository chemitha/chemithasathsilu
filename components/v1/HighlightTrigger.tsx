"use client";

import React from "react";

export const triggerHighlight = (targetId: string = "contact") => {
  if (typeof window === "undefined") return;
  const el = document.getElementById(targetId);
  if (!el) return;

  const scrollContainer =
    document.querySelector<HTMLElement>(".overflow-y-scroll") || window;

  const flash = () => {
    el.classList.remove("is-highlighted");
    void el.offsetWidth;
    el.classList.add("is-highlighted");
    window.setTimeout(() => el.classList.remove("is-highlighted"), 900);
  };

  const currentScroll =
    scrollContainer instanceof HTMLElement
      ? scrollContainer.scrollTop
      : window.scrollY;

  const rect = el.getBoundingClientRect();
  const inView =
    rect.top < window.innerHeight * 0.85 && rect.bottom > window.innerHeight * 0.15;

  if (currentScroll < 100 || inView) {
    flash();
    return;
  }

  if ("onscrollend" in (window as any)) {
    const onScrollEnd = () => {
      scrollContainer.removeEventListener("scrollend", onScrollEnd);
      flash();
    };
    scrollContainer.addEventListener("scrollend", onScrollEnd, { once: true });
  } else {
    let lastY = currentScroll;
    const check = () => {
      const updatedY =
        scrollContainer instanceof HTMLElement
          ? scrollContainer.scrollTop
          : window.scrollY;

      if (updatedY === lastY) {
        flash();
      } else {
        lastY = updatedY;
        window.setTimeout(check, 100);
      }
    };
    window.setTimeout(check, 400);
  }

  scrollContainer.scrollTo({ top: 0, behavior: "smooth" });
};

interface HighlightTriggerProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  targetId?: string;
  onBeforeTrigger?: () => void;
  children: React.ReactNode;
}

export function HighlightTrigger({
  targetId = "contact",
  onBeforeTrigger,
  children,
  onClick,
  href = `#${targetId}`,
  className = "",
  ...props
}: HighlightTriggerProps) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (onBeforeTrigger) onBeforeTrigger();
    triggerHighlight(targetId);
    if (onClick) onClick(e);
  };

  return (
    <a
      href={href}
      onClick={handleClick}
      className={`outline-none focus:outline-none focus-visible:outline-none select-none ${className}`}
      {...props}
    >
      {children}
    </a>
  );
}