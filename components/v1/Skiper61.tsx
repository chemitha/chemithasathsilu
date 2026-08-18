"use client";

// TODO create a how to collection and place it in them

import { motion, useMotionValue, useSpring } from "framer-motion";
import React, { useEffect } from "react";
import { usePathname } from "next/navigation";

const SPRING = {
  mass: 0.1, // avoid Controls inertia. Lower mass = snappier motion
  damping: 10, // bounce weight control
  stiffness: 151, // rubber band tension speed
};

const SimpleMouseFollow = () => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const opacity = useMotionValue(0);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const bounds = e.currentTarget.getBoundingClientRect();
    x.set(e.clientX - bounds.left);
    y.set(e.clientY - bounds.top);
  };

  return (
    <div
      onPointerMove={(e) => {
        handlePointerMove(e);
      }}
      onPointerEnter={() => {
        opacity.set(1);
      }}
      onPointerLeave={() => {
        opacity.set(0);
      }}
      className="rounded-4xl bg-background mt-20 size-[500px] cursor-none overflow-hidden"
    >
      <motion.div
        style={{
          x,
          y,
          opacity,
        } as any}
        className="rounded-4xl size-5 bg-[#ccc]"
      ></motion.div>
    </div>
  );
};

const SpringMouseFollow = () => {
  const xSpring = useSpring(0, SPRING);
  const ySpring = useSpring(0, SPRING);
  const opacitySpring = useSpring(0, SPRING);
  const scaleSpring = useSpring(0, SPRING);

  return (
    <div
      onPointerMove={(e) => {
        const bounds = e.currentTarget.getBoundingClientRect();
        xSpring.set(e.clientX - bounds.left);
        ySpring.set(e.clientY - bounds.top);
      }}
      onPointerEnter={() => {
        opacitySpring.set(1);
        scaleSpring.set(1);
      }}
      onPointerLeave={() => {
        opacitySpring.set(0);
        scaleSpring.set(0);
      }}
      className="rounded-4xl bg-background mt-20 size-[500px] overflow-hidden"
    >
      <motion.div
        style={{
          x: xSpring,
          y: ySpring,
          opacity: opacitySpring,
          scale: scaleSpring,
        } as any}
        className="rounded-4xl size-5 bg-white hidden md:block"
      ></motion.div>
    </div>
  );
};

export const SimpleGlobalCursor = () => {
  const pathname = usePathname();
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const opacity = useMotionValue(0);

  const isShowcaseRoute = pathname?.startsWith('/app') || pathname?.startsWith('/showcase');

  useEffect(() => {
    if (isShowcaseRoute) return;

    const handlePointerMove = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);

      if (opacity.get() === 0) {
        opacity.set(1);
      }
    };

    const handleMouseLeave = () => {
      opacity.set(0);
    };

    const handleMouseEnter = () => {
      opacity.set(1);
    };

    window.addEventListener("pointermove", handlePointerMove);
    document.documentElement.addEventListener("mouseleave", handleMouseLeave);
    document.documentElement.addEventListener("mouseenter", handleMouseEnter);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      document.documentElement.removeEventListener("mouseleave", handleMouseLeave);
      document.documentElement.removeEventListener("mouseenter", handleMouseEnter);
    };
  }, [x, y, opacity, isShowcaseRoute]);

  if (isShowcaseRoute) return null;

  return (
    <motion.div
      style={{
        x,
        y,
        opacity,
      } as any}
      className="!z-99 pointer-events-none fixed top-0 left-0 z-50 hidden size-5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white mix-blend-difference md:block"
    />
  );
};

export const SpringGlobalCursor = () => {
  const pathname = usePathname();
  const xSpring = useSpring(-100, SPRING);
  const ySpring = useSpring(-100, SPRING);
  const opacitySpring = useSpring(0, SPRING);
  const scaleSpring = useSpring(0, SPRING);

  const isShowcaseRoute = pathname?.startsWith('/app') || pathname?.startsWith('/showcase');

  useEffect(() => {
    if (isShowcaseRoute) return;

    const handlePointerMove = (e: PointerEvent) => {
      xSpring.set(e.clientX);
      ySpring.set(e.clientY);

      if (opacitySpring.get() === 0) {
        opacitySpring.set(1);
        scaleSpring.set(1);
      }

      const target = e.target as HTMLElement | null;
      const isHoveredPointer = target?.closest(
        'a, button, [role="button"], input, select, textarea, [data-cursor="pointer"]'
      );

      if (isHoveredPointer) {
        scaleSpring.set(2.5);
      } else {
        scaleSpring.set(1);
      }
    };

    const handleMouseLeave = () => {
      opacitySpring.set(0);
      scaleSpring.set(0);
    };

    const handleMouseEnter = () => {
      opacitySpring.set(1);
      scaleSpring.set(1);
    };

    window.addEventListener("pointermove", handlePointerMove);
    document.documentElement.addEventListener("mouseleave", handleMouseLeave);
    document.documentElement.addEventListener("mouseenter", handleMouseEnter);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      document.documentElement.removeEventListener("mouseleave", handleMouseLeave);
      document.documentElement.removeEventListener("mouseenter", handleMouseEnter);
    };
  }, [xSpring, ySpring, opacitySpring, scaleSpring, isShowcaseRoute]);

  if (isShowcaseRoute) return null;

  return (
    <motion.div
      style={{
        x: xSpring,
        y: ySpring,
        opacity: opacitySpring,
        scale: scaleSpring,
      } as any}
      className="pointer-events-none fixed top-0 left-0 z-[9999] hidden size-5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white mix-blend-difference md:block"
    />
  );
};

const Skiper61 = () => {
  return (
    <section className="h-screen w-full snap-y snap-mandatory overflow-y-scroll">
      <div className="flex h-screen w-full snap-start flex-col items-center justify-center px-5">
        <div className="grid content-start justify-items-center gap-6 text-center">
          <span className="after:to-foreground relative max-w-[12ch] text-xs uppercase leading-tight opacity-40 after:absolute after:left-1/2 after:top-full after:h-16 after:w-px after:bg-gradient-to-b after:from-transparent after:content-['']">
            Mouse follow simple
          </span>
        </div>
        <SimpleMouseFollow />
      </div>
      <div className="flex h-screen w-full snap-start flex-col items-center justify-center px-5">
        <div className="grid content-start justify-items-center gap-6 text-center">
          <span className="after:to-foreground relative max-w-[12ch] text-xs uppercase leading-tight opacity-40 after:absolute after:left-1/2 after:top-full after:h-16 after:w-px after:bg-gradient-to-b after:from-transparent after:content-['']">
            Mouse follow with Spring
          </span>
        </div>
        <SpringMouseFollow />
      </div>
    </section>
  );
};

export { SimpleMouseFollow, Skiper61, SpringMouseFollow };