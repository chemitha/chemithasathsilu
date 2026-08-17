"use client";

import { useEffect, useState } from "react";
import Signature from "./Signature";
import { Tooltip } from "./Tooltip";
import { HighlightTrigger } from "./HighlightTrigger";

const NAV_LINKS = [
  { label: "About", href: "#about" },
  { label: "Services", href: "#services" },
  { label: "Projects", href: "#projects" },
  { label: "Labs", href: "/labs" },
  { label: "Contact", href: "#contact" },
];

const SOCIAL_LINKS = [
  { label: "Email", href: "mailto:me@chemitha.com", tooltip: "Direct Email" },
  { label: "GitHub", href: "https://github.com/chemitha", tooltip: "GitHub Profile" },
  { label: "X (Twitter)", href: "https://x.com/intent/follow?screen_name=chemitha_s", tooltip: "Follow on X" },
  { label: "Schedule Call", href: "https://cal.com/chemithasathsilu", tooltip: "Book a 15-min call" },
];

function LiveClock() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!now) {
    return (
      <span className="font-mono text-[11px] text-zinc-500 sm:text-xs">
        Colombo, LK
      </span>
    );
  }

  const formatted = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Colombo",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(now);

  return (
    <span className="flex items-center gap-1.5 font-mono text-[11px] text-zinc-500 sm:text-xs">
      <span className="relative flex h-1.5 w-1.5 shrink-0">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/40" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white/60" />
      </span>
      <span className="truncate">{formatted} SLST (GMT+5:30), Colombo, LK</span>
    </span>
  );
}

export function Footer() {
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);

  return (
    <footer className="relative w-full px-3 pb-6 pt-16 sm:px-6 sm:pt-24">
      <div className="mx-auto w-full max-w-5xl rounded-[24px] border border-white/10 bg-white/[0.02] px-5 py-8 backdrop-blur-md sm:rounded-[32px] sm:px-10 sm:py-14">
        {/* Eyebrow row */}
        <div className="flex w-full flex-wrap items-center justify-between gap-2.5 sm:gap-3">
          <span className="font-mono text-[10px] uppercase tracking-widest text-white/40 sm:text-xs">
            ~ / initialize-project
          </span>
          <span className="hidden h-[1px] flex-1 bg-white/10 sm:block" />
          <LiveClock />
        </div>

        {/* Big closing statement */}
        <HighlightTrigger
          targetId="contact"
          className="group mt-6 block w-full break-words text-3xl font-extrabold uppercase leading-[0.95] tracking-tighter text-white transition-colors sm:mt-8 sm:w-fit sm:text-6xl md:text-7xl"
        >
          Let&apos;s build
          <br />
          something
          <span className="inline-block transition-transform duration-300 ease-out group-hover:translate-x-3">
            .
          </span>
        </HighlightTrigger>

        {/* Link columns */}
        <div className="mt-8 grid grid-cols-1 gap-8 border-t border-white/10 pt-8 sm:mt-12 sm:grid-cols-4">
          <div className="sm:col-span-2">
            <p className="max-w-xs text-xs leading-relaxed text-zinc-400 sm:text-sm">
              Building web and AI projects from idea to deployment: full-stack
              apps, integrations, and internal tools engineered to move fast.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:col-span-2 sm:grid-cols-2">
            <div>
              <span className="mb-3 block font-mono text-[10px] uppercase tracking-widest text-zinc-500 sm:mb-4 sm:text-xs">
                Navigate
              </span>
              <ul className="space-y-1.5 sm:space-y-2.5">
                {NAV_LINKS.map((link) => {
                  const isContact = link.label === "Contact";
                  const commonProps = {
                    onMouseEnter: () => setHoveredLink(link.href),
                    onMouseLeave: () => setHoveredLink(null),
                    className:
                      "inline-block py-1 text-sm text-zinc-300 transition-colors hover:text-white sm:py-0",
                    style: {
                      opacity:
                        hoveredLink && hoveredLink !== link.href ? 0.5 : 1,
                    },
                  };

                  return (
                    <li key={link.href}>
                      {isContact ? (
                        <HighlightTrigger
                          targetId="contact"
                          {...commonProps}
                        >
                          {link.label}
                        </HighlightTrigger>
                      ) : (
                        <a href={link.href} {...commonProps}>
                          {link.label}
                        </a>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>

            <div>
              <span className="mb-3 block font-mono text-[10px] uppercase tracking-widest text-zinc-500 sm:mb-4 sm:text-xs">
                Connect
              </span>
              <ul className="space-y-1.5 sm:space-y-2.5">
                {SOCIAL_LINKS.map((link) => (
                  <li key={link.href}>
                    <Tooltip content={link.tooltip} side="right" delay={100}>
                      <a
                        href={link.href}
                        target={
                          link.href.startsWith("http") ? "_blank" : undefined
                        }
                        rel="noreferrer noopener"
                        className="inline-block py-1 text-sm text-zinc-300 transition-colors hover:text-white sm:py-0"
                      >
                        {link.label}
                      </a>
                    </Tooltip>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 border-t border-white/10 pt-6 font-mono text-[11px] text-neutral-400 sm:mt-12 sm:text-xs">
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Left: Signature + Copyright */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              <div className="h-[36px] w-28 shrink-0 sm:h-[42px] sm:w-32">
                <Signature className="h-full w-full -rotate-6" />
              </div>
              <span className="text-neutral-400">
                © 2026 Chemitha Sathsilu. All rights reserved.
              </span>
            </div>

            {/* Right: Tech Stack */}
            <div className="text-neutral-500">
              Built with Next.js &amp; Tailwind CSS
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}