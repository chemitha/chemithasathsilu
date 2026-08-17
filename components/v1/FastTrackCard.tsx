"use client";

import { Check, Mail, Calendar } from 'lucide-react';
import { Tooltip } from './Tooltip';

export function FastTrackCard() {
  return (
    <section className="py-12 sm:py-24 flex justify-center items-center px-4 bg-transparent">
      <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-md p-6 sm:p-10 shadow-2xl transition-all duration-500 hover:border-white/20 hover:bg-white/[0.03]">
        
        {/* Top Badge & Turnaround Indicator */}
        <div className="flex flex-row sm:flex-col justify-between gap-3 pb-5 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-mono text-[10px] xs:text-xs tracking-widest text-zinc-300 uppercase font-semibold whitespace-nowrap">
              Fast-Track Build
            </span>
          </div>
          <span className="self-start xs:self-auto font-mono text-[10px] xs:text-xs px-2 py-0.5 xs:px-2.5 xs:py-1 rounded-full border border-white/10 bg-white/5 text-zinc-400 whitespace-nowrap">
            1–3 Day Turnaround
          </span>
        </div>

        {/* Header & Value Proposition */}
        <div className="mt-6 space-y-3">
          <h3 className="text-xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
            Production-Ready Software Built in Days
          </h3>
          <p className="text-xs sm:text-sm leading-relaxed text-zinc-400">
            Custom web applications, AI integration, and automated internal tools engineered to solve your exact operational bottleneck—deployed at speed.
          </p>
        </div>

        {/* Deliverables Checklist */}
        <div className="mt-8 pt-6 border-t border-white/10 space-y-4">
          <span className="font-mono text-xs tracking-wider text-zinc-500 uppercase font-semibold block">
            What's Included
          </span>
          <ul className="space-y-3 text-xs sm:text-sm text-zinc-300 font-sans">
            {[
              "Full-stack MVP built and deployed in days",
              "Plug-and-play integration with your team's existing stack",
              "Production-grade backend, database & cloud setup",
              "7-day trial period & 30-day post-launch support",
              "Direct access to the builder — zero agency bloat",
            ].map((item, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <div className="mt-0.5 rounded-full p-0.5 bg-white/10 text-white shrink-0">
                  <Check className="h-3 w-3" />
                </div>
                <span className="text-zinc-300 leading-snug">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Call to Action Buttons */}
        <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-1 gap-3">
          
          {/* Schedule Intro Button */}
          <Tooltip content="Schedule a 15 minute Call" side="up" delay={150} className="w-full">
            <a
              href="https://cal.com/chemithasathsilu/15min" 
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-xs font-semibold text-black transition hover:bg-zinc-200 active:scale-[0.98]"
            >
              <Calendar className="h-4 w-4" />
              Schedule Intro
            </a>
          </Tooltip>

          {/* Direct Email Button */}
          <Tooltip content="Send me an Email" side="up" delay={150} className="w-full">
            <a
              href="mailto:me@chemitha.com"
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs font-semibold text-zinc-300 transition hover:bg-white/10 hover:text-white active:scale-[0.98]"
            >
              <Mail className="h-4 w-4" />
              Direct Email
            </a>
          </Tooltip>

        </div>

        {/* Footer Note */}
        <div className="mt-4 text-center">
          <span className="font-mono text-[10px] sm:text-[11px] text-zinc-500">
            Custom scope built per project · Direct response &lt; 12 hrs
          </span>
        </div>

      </div>
    </section>
  );
}