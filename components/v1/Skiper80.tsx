"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence, type Transition } from "framer-motion";
import { ExternalLink, BookOpen } from "lucide-react";

interface Project {
  id: string;
  title: string;
  image: string;
  description: string;
}

const PROJECTS: Project[] = [
  {
    id: "skiper-oss-001",
    title: "Skiper OSS 001",
    image:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop",
    description:
      "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quae obcaecati id natus dignissimos totam at incidunt ipsum dolo consequatur ducimus! Placeat assumenda, Saepe repellendus delectus minima ullam facilis laboriosam facere bonum eius laudantium voluptate corrupti secundis ipsa, odio repudiandae ab accusantium dicta rerum rem? Want to create something cool together? Let's do it!",
  },
  {
    id: "neonsync-pro",
    title: "NeonSync Pro",
    image:
      "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1000&auto=format&fit=crop",
    description:
      "The ultimate project management platform designed for modern tech teams. Streamline workflows, synchronize tasks in real-time, and boost overall developer productivity effortlessly across all projects.",
  },
  {
    id: "pixelforge-studio",
    title: "PixelForge Studio",
    image:
      "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=1000&auto=format&fit=crop",
    description:
      "A next-generation creative suite powered by web technologies. Craft pixel-perfect design systems, generate automated brand assets, and collaborate with your team live in the browser.",
  },
  {
    id: "taskflow-sonet",
    title: "TaskFlow Sonet",
    image:
      "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?q=80&w=1000&auto=format&fit=crop",
    description:
      "Minimalist state-management engine and UI component library build for speed and modern web applications. Powered by lightweight animations and responsive layout mechanics.",
  },
  {
    id: "cloudvibe-bruh",
    title: "CloudVibe Bruh",
    image:
      "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=1000&auto=format&fit=crop",
    description:
      "Cloud infrastructure dashboard with real-time monitoring, telemetry graphics, and serverless deployment integrations built for high-performance developer workflows.",
  },
];

const MORPH: Transition = {
  type: "spring",
  stiffness: 180,
  damping: 24,
  mass: 0.8,
};

export const Skiper80: React.FC = () => {
  const [hoveredProject, setHoveredProject] = useState<Project>(PROJECTS[0]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const mousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const rafIdRef = useRef<number | null>(null);

  // TRACK GLOBAL MOUSE POSITION
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mousePosRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // COMPLETE SCROLL LOCK (BODY + CUSTOM SCROLL CONTAINERS)
  useEffect(() => {
    const scrollContainers = document.querySelectorAll<HTMLElement>(".overflow-y-scroll");
    
    if (selectedProject) {
      document.body.style.overflow = "hidden";
      scrollContainers.forEach((container) => {
        container.style.overflowY = "hidden";
      });
    } else {
      document.body.style.overflow = "";
      scrollContainers.forEach((container) => {
        container.style.overflowY = "scroll";
      });
    }

    return () => {
      document.body.style.overflow = "";
      scrollContainers.forEach((container) => {
        container.style.overflowY = "scroll";
      });
    };
  }, [selectedProject]);

  // UNMOUNT CLEANUP FOR PENDING ANIMATION FRAMES
  useEffect(() => {
    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, []);

  // FAST & CLEAN MODAL CLOSE
  const handleCloseModal = () => {
    setSelectedProject(null);

    requestAnimationFrame(() => {
      const { x, y } = mousePosRef.current;
      const targetElement = document.elementFromPoint(x, y);
      if (targetElement) {
        const projectBtn = targetElement.closest("[data-project-id]");
        if (projectBtn) {
          const projectId = projectBtn.getAttribute("data-project-id");
          const matched = PROJECTS.find((p) => p.id === projectId);
          if (matched) {
            setHoveredProject(matched);
          }
        }
      }
    });
  };

  // ESC KEY LISTENER
  useEffect(() => {
    if (!selectedProject) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleCloseModal();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedProject]);

  // HOVER THROUGH OVERLAY (THROTTLED WITH RAF TO PREVENT DOM LAYOUT THRASHING)
  const handleOverlayMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!overlayRef.current || !selectedProject) return;

    const clientX = e.clientX;
    const clientY = e.clientY;

    if (rafIdRef.current !== null) return;

    rafIdRef.current = requestAnimationFrame(() => {
      if (overlayRef.current) {
        overlayRef.current.style.pointerEvents = "none";
        const targetElement = document.elementFromPoint(clientX, clientY);
        overlayRef.current.style.pointerEvents = "auto";

        if (targetElement) {
          const projectBtn = targetElement.closest("[data-project-id]");
          if (projectBtn) {
            const projectId = projectBtn.getAttribute("data-project-id");
            const matched = PROJECTS.find((p) => p.id === projectId);
            if (matched && matched.id !== hoveredProject?.id) {
              setHoveredProject(matched);
            }
          }
        }
      }
      rafIdRef.current = null;
    });
  };

  const activeProject = selectedProject || hoveredProject || PROJECTS[0];

  return (
    <div className="relative h-screen w-full overflow-hidden font-sans text-white selection:bg-white selection:text-black">
      {/* BACKGROUND DECORATIVE GRID */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#1f1f1f_1px,transparent_1px)] opacity-40 [background-size:20px_20px]" />

      {/* OVERLAY BACKDROP */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div
            ref={overlayRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onMouseMove={handleOverlayMouseMove}
            onClick={handleCloseModal}
            className="fixed inset-0 z-20 cursor-pointer bg-[#0a0a0a]/80 backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* SINGLE UNIFIED IMAGE CONTAINER */}
      <motion.div
        layout
        transition={MORPH}
        className={`overflow-hidden rounded-[25px] border border-white/10 shadow-2xl ${
          selectedProject
            ? "fixed z-30 left-1/2 top-[28%] sm:top-[30.5%] h-56 w-[calc(100%-3rem)] max-w-lg -translate-x-1/2 sm:h-64"
            : "absolute z-10 -left-12 top-[12%] h-48 w-72 sm:left-[15%] sm:top-[20%] sm:h-52 sm:w-88 sm:-translate-x-1/2"
        }`}
      >
        <motion.img
          key={activeProject.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            duration: 0.25,
            delay: !selectedProject && hoveredProject?.id !== activeProject.id ? 0.12 : 0,
          }}
          src={activeProject.image}
          alt={activeProject.title}
          className="h-full w-full object-cover"
        />
      </motion.div>

      {/* BACKGROUND PROJECT LIST */}
      <div className="relative z-10 h-full w-full px-6 sm:px-12">
        <div className="absolute bottom-[10%] right-6 z-10 flex max-w-full flex-col items-end gap-2 sm:bottom-[20%] sm:right-[10%] sm:items-start">
          <div className="flex w-full items-center gap-3 text-sm uppercase opacity-50">
            <span className="text-sm font-medium tracking-wider text-white/90">
              MY PROJECTS
            </span>
            <span className="h-[1px] flex-1 bg-white" />
          </div>

          {PROJECTS.map((project) => {
            const isHovered = hoveredProject?.id === project.id;
            const isSelected = selectedProject?.id === project.id;

            return (
              <button
                key={project.id}
                data-project-id={project.id}
                onMouseEnter={() => setHoveredProject(project)}
                onClick={() => {
                  setHoveredProject(project);
                  setSelectedProject(project);
                }}
                className="group relative flex w-fit cursor-pointer items-center text-3xl tracking-tighter outline-none transition-opacity duration-200 sm:text-4xl"
                style={{ opacity: isHovered || isSelected ? 1 : 0.4 }}
              >
                {!isSelected ? (
                  <motion.span
                    layoutId={`shared-title-${project.id}`}
                    transition={MORPH}
                    className="relative flex items-center"
                  >
                    <span>{project.title}</span>
                    <div
                      className={`absolute left-full top-1/2 -translate-y-1/2 bg-white transition-all duration-300 ease-out ${
                        isHovered && !selectedProject
                          ? "translate-x-3.5 opacity-100 w-1.5 h-1.5 rounded-full"
                          : "translate-x-2 opacity-0 w-5 h-[2px] rounded-sm"
                      }`}
                    />
                  </motion.span>
                ) : (
                  <span className="opacity-0">{project.title}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* MODAL VIEW WITH EXPLICIT ARROW-NAV BLOCK ATTR */}
      <AnimatePresence>
        {selectedProject && (
          <div
            role="dialog"
            aria-modal="true"
            data-prevent-arrow-nav="true"
            onClick={handleCloseModal}
            className="pointer-events-none fixed inset-0 z-40 flex items-center justify-center p-6 pt-20"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="pointer-events-auto mx-auto flex max-h-[85vh] w-full max-w-lg flex-col items-center justify-start gap-5 overflow-hidden"
            >
              {/* FIXED HEADER */}
              <div className="flex w-full shrink-0 flex-col items-center gap-4">
                <div className="font-cal-sans relative flex h-16 items-center justify-center text-center text-4xl font-medium sm:text-5xl">
                  <motion.h1
                    layoutId={`shared-title-${selectedProject.id}`}
                    transition={MORPH}
                    onClick={handleCloseModal}
                    className="cursor-pointer whitespace-nowrap text-white"
                  >
                    {selectedProject.title}
                  </motion.h1>
                </div>

                {/* SPACER FOR SINGLE MORPHING IMAGE */}
                <div className="h-56 sm:h-64 w-full shrink-0 opacity-0 pointer-events-none" />
              </div>

              {/* DETAILS SECTION */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 16 }}
                transition={{ duration: 0.2 }}
                className="flex min-h-0 w-full flex-col gap-3"
              >
                {/* FIXED SUB-HEADER */}
                <section className="w-full shrink-0">
                  <div className="flex items-center gap-2">
                    <h2 className="text-foreground text-xl font-semibold tracking-tight text-white">
                      Billion Dollar Saas
                    </h2>
                    <motion.div
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      exit={{ scaleX: 0 }}
                      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                      className="h-[2px] flex-1 origin-left rounded-full bg-white"
                    />
                  </div>
                </section>

                {/* DESCRIPTION */}
                <div className="text-foreground/50 scrollbar-thin scrollbar-thumb-zinc-700 flex max-h-[120px] flex-col gap-2 overflow-y-auto pr-2 text-xs text-zinc-400 sm:text-sm">
                  <p>
                    Lorem ipsum dolor sit amet consectetur adipisicing elit.
                    Quae obcaecati id natus dignissimos totam at incidunt ipsam
                    odio consequatur ducimus!
                  </p>
                  <p>
                    placeat assumenda. Saepe repellendus delectus minima ullam
                    facilis laboriosam facere harum quas laudantium voluptate
                    corrupti reiciendis ipsa, odio repudiandae ab accusantium
                    dicta rerum rem?
                  </p>
                  <p className="font-medium leading-6 text-zinc-300">
                    Want to create something cool together? Let's do it!
                  </p>
                </div>

                {/* ACTIONS */}
                <div className="mt-2 flex shrink-0 items-center gap-2.5">
                  <a
                    href="#"
                    className="flex h-9 items-center gap-2 rounded-xl bg-white px-3 text-sm font-medium text-black transition-opacity hover:opacity-90"
                  >
                    Live Preview
                    <ExternalLink className="size-3.5" />
                  </a>
                  <a
                    href="#"
                    className="flex h-9 items-center gap-2 rounded-xl border border-white/10 bg-zinc-800 px-3 text-sm font-medium text-white transition-colors hover:bg-zinc-700"
                  >
                    See Source Code
                    <BookOpen className="size-3.5" />
                  </a>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Skiper80;