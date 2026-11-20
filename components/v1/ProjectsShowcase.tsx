"use client";

// Previously called Skiper80.tsx
import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence, LayoutGroup, type Transition } from "framer-motion";
import { ExternalLink, BookOpen, X } from "lucide-react";
import { Tooltip } from "./Tooltip";

interface Project {
  id: string;
  title: string;
  category?: string; // Customizable line subtitle (e.g., "Billion Dollar SaaS")
  image: string;
  blurDataURL: string;
  description: string;
  liveUrl?: string;
  sourceUrl?: string;
}

const PROJECTS: Project[] = [
  {
    id: "autonin",
    title: "AutoNin",
    category: "Voice & Form Automation",
    image:
      "https://www.chemitha.com/assets/images/thum/468409598-6ed4bda9-bd70-4deb-85f2-5f78278c54fd.webp",
    blurDataURL:
      "data:image/webp;base64,UklGRlAAAABXRUJQVlA4IEQAAABQAwCdASoYAA4APu1iqU2ppaQiMAgBMB2JZQCdMoAE73pfAAD+7rZdxDjWM64qJ+ItU49YY46wlxZdw2glqlXobGAAAA==",
    description:
      "An AI-powered form automation tool that allows users to fill out digital web forms simply by speaking casually. Utilizes Faster-Whisper for high-accuracy voice-to-text speech processing.",
    liveUrl: "https://autonin.onrender.com",
    sourceUrl: "https://github.com/chemitha/autonin",
  },
  {
    id: "waitbee",
    title: "Waitbee",
    category: "Developer Tooling",
    image:
      "https://github.com/user-attachments/assets/29a10a9e-b219-4453-a729-84db7b042808",
    blurDataURL:
      "data:image/webp;base64,UklGRn4AAABXRUJQVlA4IHIAAAAQBACdASoYAA4APu1iqU2ppaOiMAgBMB2JYwDMHCHgRLJDRPFRhEVAAAD+8gRL9w0IxBc3sLTBP//IFxHhyJYoAdD+zYaOGbKg7HbWYZIHXsp4UqbfHNVdxQwYIJdpPKwvm3zptDOibSW4BVMnNouAAAA=",
    description:
      "The fastest way to launch high-converting viral waitlists, collect subscriber emails, track growth analytics, and generate pre-launch hype for startup releases.",
    liveUrl: "https://waitbee.vercel.app",
    sourceUrl: "https://github.com/chemitha/waitbee",
  },
  {
    id: "vortasky",
    title: "Vortasky",
    category: "AI Revenue Intelligence",
    image:
      "https://vortasky.com/images/image.jpg",
    blurDataURL:
      "data:image/webp;base64,UklGRlYAAABXRUJQVlA4IEoAAABwAwCdASoYAA4APu1kqk4ppaQiMAgBMB2JZwAASnlb1tg2MaQA/vMIHsq5oUmPHxXws/m0k8aFNckWmrgryribXWROmE9hSvBwAA==",
    description:
      "A revenue intelligence platform that detects revenue leaks, identifies overdue invoices, and automatically recovers failed payments using real-time insights.",
    liveUrl: "https://vortasky.com",
  },
  {
    id: "atticnote",
    title: "AtticNote",
    category: "Cloud Workspace",
    image:
      "https://chemitha.com/assets/images/thum/atticnote.webp",
    blurDataURL:
      "data:image/webp;base64,UklGRlAAAABXRUJQVlA4IEQAAABwAwCdASoYAA0APu1iqU2ppaOiMAgBMB2JZwAAW++WqozbQAAA/u8gsNC1Ifk4zozwEXwLsi+PAX0kd18q8bnodUNAAA==",
    description:
      "A lightweight web workspace designed for capturing notes, ideas, and files from anywhere. Optimized for instant access across shared computers and everyday devices.",
    liveUrl: "https://atticnote.vercel.app",
    sourceUrl: "https://github.com/chemitha/AtticNote",
  },
  {
    id: "telecap_bot",
    title: "Telecap Bot",
    category: "Telegram Spyer",
    image:
      "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=1000&auto=format&fit=crop",
    blurDataURL:
      "data:image/webp;base64,UklGRlwAAABXRUJQVlA4IFAAAADQAwCdASoYABAAPu1iqU2ppaOiMAgBMB2JZQCo9CHfKMrzB4AYGAAA/u6juuDxrnh50CphPZuFYhekBsMlbVwwZrMWrin9GNyFaa2lckAAAA==",
    description:
      "A Telegram bot that captures desktop screenshots remotely. Run it on your PC and send /capture via Telegram to receive an instant image of your current desktop.",
    sourceUrl: "https://github.com/chemitha/telecap-bot",
  },
];

const MORPH: Transition = {
  type: "spring",
  stiffness: 180,
  damping: 24,
  mass: 0.8,
};

export const ProjectsShowcase: React.FC = () => {
  const [hoveredProject, setHoveredProject] = useState<Project>(PROJECTS[0]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});
  const overlayRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const mousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const rafIdRef = useRef<number | null>(null);

  useEffect(() => {
    const preloaded: HTMLImageElement[] = [];
    let cancelled = false;

    PROJECTS.forEach((project) => {
      const img = new window.Image();
      preloaded.push(img);

      const markLoaded = () => {
        if (cancelled) return;
        setLoadedImages((prev) =>
          prev[project.id] ? prev : { ...prev, [project.id]: true }
        );
      };

      img.onload = markLoaded;
      img.src = project.image;

      if (img.complete && img.naturalWidth > 0) {
        markLoaded();
      }
    });

    return () => {
      cancelled = true;
      preloaded.forEach((img) => {
        img.onload = null;
      });
    };
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mousePosRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

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

  useEffect(() => {
    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, []);

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

  useEffect(() => {
    if (!selectedProject) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleCloseModal();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedProject]);

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
  const isImageLoaded = Boolean(loadedImages[activeProject.id]);

  useEffect(() => {
    if (imgRef.current?.complete && imgRef.current.naturalWidth > 0) {
      setLoadedImages((prev) =>
        prev[activeProject.id] ? prev : { ...prev, [activeProject.id]: true }
      );
    }
  }, [activeProject.id]);

  return (
    <LayoutGroup>
    <div className="relative h-screen w-full overflow-hidden font-sans text-white selection:bg-white selection:text-black [@media(max-height:460px)]:min-h-screen [@media(max-height:460px)]:h-auto [@media(max-height:460px)]:flex [@media(max-height:460px)]:flex-col [@media(max-height:460px)]:justify-center [@media(max-height:460px)]:gap-6 [@media(max-height:460px)]:py-20 [@media(max-height:460px)]:px-5">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#1f1f1f_1px,transparent_1px)] opacity-40 [background-size:20px_20px]" />

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
            className="fixed inset-0 z-20 [@media(max-height:460px)]:z-[55] cursor-pointer bg-[#0a0a0a]/80 backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {!selectedProject ? (
        <motion.div
          layoutId="shared-project-image"
          transition={MORPH}
          role="button"
          tabIndex={0}
          aria-label={`Open ${activeProject.title} details`}
          onClick={() => setSelectedProject(activeProject)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setSelectedProject(activeProject);
            }
          }}
          className="absolute z-10 -left-12 top-[12%] h-48 w-72 sm:left-[15%] sm:top-[20%] sm:h-52 sm:w-88 sm:-translate-x-1/2 [@media(max-height:460px)]:relative [@media(max-height:460px)]:left-auto [@media(max-height:460px)]:top-auto [@media(max-height:460px)]:mx-auto [@media(max-height:460px)]:w-full [@media(max-height:460px)]:max-w-[280px] [@media(max-height:460px)]:h-auto [@media(max-height:460px)]:aspect-[16/10] cursor-pointer overflow-hidden rounded-[25px] border border-white/10 bg-zinc-900/50 shadow-2xl transform-gpu [contain:layout_paint]"
        >
          <img
            ref={imgRef}
            key={activeProject.id}
            onLoad={() =>
              setLoadedImages((prev) =>
                prev[activeProject.id] ? prev : { ...prev, [activeProject.id]: true }
              )
            }
            src={activeProject.image}
            alt={activeProject.title}
            className={`relative z-10 h-full w-full object-cover transform-gpu [backface-visibility:hidden] transition-opacity duration-300 ease-out ${
              isImageLoaded ? "opacity-100" : "opacity-0"
            }`}
          />
          <AnimatePresence>
            {!isImageLoaded && (
              <motion.div
                key={`blur-${activeProject.id}`}
                initial={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
                exit={{ opacity: 0, filter: "blur(16px)", scale: 1.06 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="pointer-events-none absolute inset-0 z-20"
              >
                <img
                  src={activeProject.blurDataURL}
                  alt=""
                  aria-hidden="true"
                  className="h-full w-full scale-110 object-cover blur-xl"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/15">
                  <span className="h-5 w-5 rounded-full border-2 border-white/20 border-t-white/75 animate-spin" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ) : (
        <div
          aria-hidden="true"
          className="absolute z-10 -left-12 top-[12%] h-48 w-72 sm:left-[15%] sm:top-[20%] sm:h-52 sm:w-88 sm:-translate-x-1/2 [@media(max-height:460px)]:relative [@media(max-height:460px)]:left-auto [@media(max-height:460px)]:top-auto [@media(max-height:460px)]:mx-auto [@media(max-height:460px)]:w-full [@media(max-height:460px)]:max-w-[280px] [@media(max-height:460px)]:h-auto [@media(max-height:460px)]:aspect-[16/10] opacity-0 pointer-events-none"
        />
      )}

      <div className="relative z-10 h-full w-full px-6 sm:px-12 [@media(max-height:460px)]:h-auto [@media(max-height:460px)]:px-0">
        <div className="absolute bottom-[10%] right-6 z-10 flex max-w-full flex-col items-end gap-2 sm:bottom-[20%] sm:right-[10%] sm:items-start [@media(max-height:460px)]:relative [@media(max-height:460px)]:bottom-auto [@media(max-height:460px)]:right-auto [@media(max-height:460px)]:w-full [@media(max-height:460px)]:pr-5">
          <div className="flex w-full items-center gap-3 text-sm uppercase opacity-50">
            <span className="text-sm font-medium tracking-wider text-white/90 [@media(max-height:460px)]:text-xs">
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
                className="group relative flex w-fit cursor-pointer items-center text-3xl tracking-tighter outline-none transition-opacity duration-200 sm:text-4xl [@media(max-height:460px)]:text-2xl"
                style={{ opacity: isHovered || isSelected ? 1 : 0.4 }}
              >
                {!isSelected ? (
                  <motion.span
                    layoutId={`shared-title-${project.id}`}
                    layoutDependency={selectedProject?.id ?? null}
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

      <AnimatePresence mode="wait">
        {selectedProject && (
          <div
            key={selectedProject.id}
            role="dialog"
            aria-modal="true"
            data-prevent-arrow-nav="true"
            onClick={handleCloseModal}
            className="pointer-events-none fixed inset-0 z-40 [@media(max-height:460px)]:z-[60] flex items-center justify-center p-6 pt-20 [@media(max-height:460px)]:p-3"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="pointer-events-auto isolate mx-auto flex max-h-[85vh] [@media(max-height:460px)]:max-h-[92dvh] w-full max-w-lg flex-col items-center justify-start gap-5 [@media(max-height:460px)]:gap-2 overflow-hidden [@media(max-height:460px)]:overflow-y-auto"
            >
              <div className="flex w-full shrink-0 flex-col items-center gap-4 [@media(max-height:460px)]:gap-2">
                <div className="font-cal-sans relative flex w-full min-h-12 sm:min-h-16 [@media(max-height:460px)]:min-h-8 items-center justify-center text-center text-4xl font-medium leading-tight sm:text-5xl [@media(max-height:460px)]:text-xl transform-gpu">
                  <motion.h1
                    layoutId={`shared-title-${selectedProject.id}`}
                    transition={MORPH}
                    onClick={handleCloseModal}
                    className="cursor-pointer whitespace-nowrap leading-tight text-white"
                  >
                    {selectedProject.title}
                  </motion.h1>
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    aria-label="Close project details"
                    className="absolute right-0 hidden [@media(max-height:460px)]:flex h-7 w-7 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
                  >
                    <X className="size-4" />
                  </button>
                </div>

                <motion.div
                  layoutId="shared-project-image"
                  transition={MORPH}
                  className="relative h-56 sm:h-64 [@media(max-height:460px)]:h-24 w-full shrink-0 overflow-hidden rounded-[25px] [@media(max-height:460px)]:rounded-2xl border border-white/10 bg-zinc-900/50 shadow-2xl transform-gpu [contain:layout_paint] [backface-visibility:hidden]"
                >
                  <img
                    key={selectedProject.id}
                    onLoad={() =>
                      setLoadedImages((prev) =>
                        prev[selectedProject.id] ? prev : { ...prev, [selectedProject.id]: true }
                      )
                    }
                    src={selectedProject.image}
                    alt={selectedProject.title}
                    className={`relative z-10 h-full w-full object-cover transform-gpu [backface-visibility:hidden] will-change-transform transition-opacity duration-300 ease-out ${
                      loadedImages[selectedProject.id] ? "opacity-100" : "opacity-0"
                    }`}
                  />
                  <AnimatePresence>
                    {!loadedImages[selectedProject.id] && (
                      <motion.div
                        key={`modal-blur-${selectedProject.id}`}
                        initial={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
                        exit={{ opacity: 0, filter: "blur(16px)", scale: 1.06 }}
                        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                        className="pointer-events-none absolute inset-0 z-20"
                      >
                        <img
                          src={selectedProject.blurDataURL}
                          alt=""
                          aria-hidden="true"
                          className="h-full w-full scale-110 object-cover blur-xl"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/15">
                          <span className="h-5 w-5 rounded-full border-2 border-white/20 border-t-white/75 animate-spin" />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 16 }}
                transition={{ duration: 0.2 }}
                className="flex min-h-0 w-full flex-col gap-2.5 sm:gap-3 [@media(max-height:460px)]:gap-2 transform-gpu [backface-visibility:hidden]"
              >
                {/* DYNAMIC CATEGORY SUB-HEADER & DYNAMIC ADJACENT LINE */}
                <section className="w-full shrink-0 [@media(max-height:460px)]:hidden">
                  <div className="flex items-center gap-3">
                    <h2 className="text-foreground text-base sm:text-xl font-semibold tracking-tight text-white whitespace-normal sm:whitespace-nowrap">
                      {selectedProject.category || "Billion Dollar Saas"}
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

                {/* DYNAMIC DESCRIPTION */}
                <div className="text-foreground/50 scrollbar-thin scrollbar-thumb-zinc-700 flex max-h-[120px] [@media(max-height:460px)]:max-h-[60px] flex-col gap-2 overflow-y-auto pr-2 text-xs [@media(max-height:460px)]:text-[11px] text-zinc-400 sm:text-sm">
                  <p className="whitespace-pre-line leading-relaxed [@media(max-height:460px)]:leading-snug">
                    {selectedProject.description}
                  </p>
                </div>

                <div className="mt-1 sm:mt-2 [@media(max-height:460px)]:mt-0.5 flex flex-wrap shrink-0 items-center gap-2 sm:gap-2.5">
                {/* Live Preview Button */}
                {selectedProject.liveUrl ? (
                  <Tooltip content={selectedProject.liveUrl} side="up" delay={150}>
                  <a
                    href={selectedProject.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-9 [@media(max-height:460px)]:h-8 items-center gap-1.5 sm:gap-2 whitespace-nowrap rounded-xl bg-white px-2.5 sm:px-3 text-xs sm:text-sm font-medium text-black transition-opacity hover:opacity-90"
                  >
                    Live Preview
                    <ExternalLink className="size-3.5 shrink-0" />
                  </a>
                  </Tooltip>
                ) : (
                  <Tooltip content="Unavailable" side="up" delay={150}>
                  <button
                    disabled
                    className="flex h-9 [@media(max-height:460px)]:h-8 cursor-not-allowed items-center gap-1.5 sm:gap-2 whitespace-nowrap rounded-xl border-2 border-dashed border-white/20 bg-white/5 px-2.5 sm:px-3 text-xs sm:text-sm font-medium text-white/40"
                  >
                    Live Preview
                    <ExternalLink className="size-3.5 shrink-0 opacity-40" />
                  </button>
                  </Tooltip>
                )}

                {/* Source Code Button */}
                {selectedProject.sourceUrl ? (
                  <Tooltip content={selectedProject.sourceUrl} side="up" delay={150}>
                  <a
                    href={selectedProject.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-9 [@media(max-height:460px)]:h-8 items-center gap-1.5 sm:gap-2 whitespace-nowrap rounded-xl border border-white/10 bg-zinc-800 px-2.5 sm:px-3 text-xs sm:text-sm font-medium text-white transition-colors hover:bg-zinc-700"
                  >
                    See Source Code
                    <BookOpen className="size-3.5 shrink-0" />
                  </a>
                  </Tooltip>
                ) : (
                  <Tooltip content="Unavailable" side="up" delay={150}>
                  <button
                    disabled
                    className="flex h-9 [@media(max-height:460px)]:h-8 cursor-not-allowed items-center gap-1.5 sm:gap-2 whitespace-nowrap rounded-xl border-2 border-dashed border-white/20 bg-white/5 px-2.5 sm:px-3 text-xs sm:text-sm font-medium text-white/40"
                  >
                    See Source Code
                    <BookOpen className="size-3.5 shrink-0 opacity-40" />
                  </button>
                  </Tooltip>
                )}
              </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
    </LayoutGroup>
  );
};

export default ProjectsShowcase;