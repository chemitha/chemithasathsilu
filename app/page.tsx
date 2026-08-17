"use client";

import React from "react";
import { DynamicNavbar } from "@/components/v1/DynamicNavbar";
import SplitText from "@/components/v1/SplitText";
import { SeamlessVideoWithHalftone } from "@/components/v1/SeamlessVideo";
import TiltedCard from "@/components/v1/TiltedCard";
import LogoLoop from "@/components/v1/LogoLoop";
import {
  SiReact,
  SiNextdotjs,
  SiTypescript,
  SiTailwindcss,
  SiPostgresql,
  SiPython,
  SiGithub,
  SiNeon,
  SiVercel,
  SiGooglegemini,
  SiX,
  SiGooglecalendar,
} from "react-icons/si";
import { HiOutlineMail } from "react-icons/hi";
import Skiper80 from "@/components/v1/Skiper80";
import { FastTrackCard } from "@/components/v1/FastTrackCard";
import { Footer } from "@/components/v1/Footer";
import { VerticalScrollPagination } from "@/components/v1/VerticalScrollPagination";
import { Tooltip } from "@/components/v1/Tooltip";

const techLogos = [
  { node: <SiReact />, title: "React", href: "https://react.dev" },
  { node: <SiNextdotjs />, title: "Next.js", href: "https://nextjs.org" },
  {
    node: <SiTypescript />,
    title: "TypeScript",
    href: "https://www.typescriptlang.org",
  },
  { node: <SiTailwindcss />, title: "Tailwind CSS", href: "https://tailwindcss.com" },
  { node: <SiGithub />, title: "GitHub", href: "https://github.com" },
  { node: <SiGooglegemini />, title: "AI/ML", href: "https://cloud.google.com/products/ai" },
  { node: <SiNeon />, title: "Neon", href: "https://neon.tech" },
  { node: <SiPostgresql />, title: "PostgreSQL", href: "https://www.postgresql.org" },
  { node: <SiPython />, title: "Python", href: "https://www.python.org" },
  { node: <SiVercel />, title: "Vercel", href: "https://vercel.com" },
];

export default function Home() {
  return (
    <div className="h-screen w-full overflow-y-scroll md:snap-y md:snap-mandatory scroll-smooth font-sans overflow-x-hidden">
      <SeamlessVideoWithHalftone />

      <DynamicNavbar triggerId="navbar-trigger" />

      {/* Auto-detecting Vertical Controller */}
      <VerticalScrollPagination />

      <section 
        id="hero" 
        className="relative flex h-screen w-full flex-col justify-end items-center pb-8 px-4 pointer-events-none snap-start shrink-0"
      >
        <div
          id="navbar-trigger"
          className="w-full flex justify-center items-center pointer-events-auto"
        >
          <SplitText
            tag="h1"
            text={`CHEMITHA\nSATHSILU`}
            className="text-[14.5vw] md:text-[8.5vw] font-extrabold tracking-tighter leading-none whitespace-pre-line text-center uppercase"
            delay={100}
            duration={1.5}
            ease="back.out(1.7)"
            splitType="words"
            from={{ opacity: 0, y: 50, rotateX: -90 }}
            to={{ opacity: 1, y: 0, rotateX: 0 }}
            threshold={0}
            rootMargin="0px"
            textAlign="center"
          />
        </div>

        <div
          id="contact"
          className="pointer-events-auto mt-6 flex items-center justify-center gap-4 sm:gap-6"
        >
          <Tooltip content="me@chemitha.com" side="up" delay={150}>
            <a
              href="mailto:me@chemitha.com"
              title="Email"
              className="rounded-full border border-white/10 bg-white/5 p-3 text-white/80 transition-all duration-300 hover:border-white/30 hover:bg-white/10 hover:text-white hover:scale-110 flex items-center justify-center"
            >
              <HiOutlineMail className="h-5 w-5 sm:h-6 sm:w-6" />
            </a>
          </Tooltip>

          <Tooltip content="GitHub: chemitha" side="up" delay={150}>
            <a
              href="https://github.com/chemitha"
              target="_blank"
              rel="noreferrer noopener"
              title="GitHub"
              className="rounded-full border border-white/10 bg-white/5 p-3 text-white/80 transition-all duration-300 hover:border-white/30 hover:bg-white/10 hover:text-white hover:scale-110 flex items-center justify-center"
            >
              <SiGithub className="h-5 w-5 sm:h-6 sm:w-6" />
            </a>
          </Tooltip>

          <Tooltip content="Twitter: @chemitha_s" side="up" delay={150}>
            <a
              href="https://x.com/intent/follow?screen_name=chemitha_s"
              target="_blank"
              rel="noreferrer noopener"
              title="X (Twitter)"
              className="rounded-full border border-white/10 bg-white/5 p-3 text-white/80 transition-all duration-300 hover:border-white/30 hover:bg-white/10 hover:text-white hover:scale-110 flex items-center justify-center"
            >
              <SiX className="h-5 w-5 sm:h-6 sm:w-6" />
            </a>
          </Tooltip>

          <Tooltip content="Schedule a Call" side="up" delay={150}>
            <a
              href="https://cal.com/chemithasathsilu"
              target="_blank"
              rel="noreferrer noopener"
              title="Schedule a Call"
              className="rounded-full border border-white/10 bg-white/5 p-3 text-white/80 transition-all duration-300 hover:border-white/30 hover:bg-white/10 hover:text-white hover:scale-110 flex items-center justify-center"
            >
              <SiGooglecalendar className="h-5 w-5 sm:h-6 sm:w-6" />
            </a>
          </Tooltip>
        </div>
      </section>

      <section
        id="about"
        className="relative flex min-h-screen h-auto md:h-screen w-full flex-col items-center justify-center py-20 px-4 z-10 snap-start shrink-0"
      >
        <div className="pointer-events-auto flex flex-col items-center gap-8 w-full max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 w-full">
            <div className="grayscale-0 md:grayscale-40 hover:grayscale-0 hover:invert-0 transition-all duration-700 ease-in-out">
              <TiltedCard
                imageSrc="/me.png"
                altText="Chemitha Sathsilu - Portrait"
                captionText="Chemitha Sathsilu - 7PLX"
                containerHeight="350px"
                containerWidth="350px"
                imageHeight="350px"
                imageWidth="350px"
                rotateAmplitude={12}
                scaleOnHover={1.05}
                showMobileWarning={false}
                showTooltip
                displayOverlayContent={false}
                overlayContent={
                  <p className="tilted-card-text">
                    Chemitha Sathsilu - Portrait
                  </p>
                }
              />
            </div>

            <div className="w-full max-w-xl text-center md:text-left space-y-4 px-4">
              <SplitText
                tag="h2"
                text="About & Skills"
                className="text-3xl md:text-5xl font-bold tracking-tight"
                delay={100}
                duration={1.5}
                ease="back.out(1.7)"
                splitType="words"
                from={{ opacity: 0, y: 50, rotateX: -90 }}
                to={{ opacity: 1, y: 0, rotateX: 0 }}
                threshold={0}
                rootMargin="0px"
                textAlign="center"
              />

              <p className="w-full text-gray-300 text-sm sm:text-base md:text-lg leading-relaxed break-words whitespace-normal">
                I build web and AI projects by designing, developing, and
                deploying robust solutions using modern technologies and
                creative problem solving.
              </p>
            </div>
          </div>

          <div className="w-full mt-4">
            <LogoLoop
              logos={techLogos}
              speed={50}
              direction="left"
              logoHeight={45}
              gap={60}
              hoverSpeed={0}
              scaleOnHover
              fadeOut
              fadeOutColor="transparent"
              ariaLabel="Tech Stack"
            />
          </div>
        </div>
      </section>

      <section id="projects" className="min-h-screen h-auto md:h-screen w-full snap-start shrink-0">
        <Skiper80 />
      </section>

      <section 
        id="services" 
        className="min-h-screen h-auto md:h-screen w-full snap-start shrink-0 flex items-center justify-center px-4"
      >
        <div className="w-full max-w-2xl mx-auto">
          <FastTrackCard />
        </div>
      </section>

      <section id="footer" className="min-h-screen h-auto md:h-screen w-full snap-start shrink-0 flex items-end">
        <Footer />
      </section>
    </div>
  );
}