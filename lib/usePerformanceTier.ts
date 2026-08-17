"use client";

import { useState, useEffect } from "react";

function isWeakGPU(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    if (!gl || !(gl instanceof WebGLRenderingContext)) return false;

    const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
    if (!debugInfo) return false;

    const renderer = gl
      .getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
      .toLowerCase();

    // Only match explicitly weak virtualized software renderers
    return (
      renderer.includes("swiftshader") ||
      renderer.includes("llvmpipe") ||
      renderer.includes("basic render")
    );
  } catch {
    return false;
  }
}

export function usePerformanceTier() {
  const [isLowSpec, setIsLowSpec] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // 1. Check strict hardware limitations (1 core or <= 1GB RAM)
    const cores = navigator.hardwareConcurrency || 4;
    const nav = navigator as unknown as Record<string, unknown>;
    const memory = nav.deviceMemory || 4;
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (cores <= 1 || Number(memory) <= 1 || prefersReducedMotion || isWeakGPU()) {
      setIsLowSpec(true);
      return;
    }

    // 2. Continuous FPS monitor: require 3 consecutive bad seconds before degrading
    let frameCount = 0;
    let startTime = performance.now();
    let badSecondCount = 0;
    let rafId: number;

    const measureFPS = () => {
      frameCount++;
      const now = performance.now();
      const elapsed = now - startTime;

      if (elapsed >= 1000) {
        const fps = (frameCount * 1000) / elapsed;
        
        // Only count as low performance if FPS drops below 20 FPS
        if (fps < 20) {
          badSecondCount++;
        } else {
          badSecondCount = 0; // reset on recovery
        }

        if (badSecondCount >= 3) {
          setIsLowSpec(true);
          return;
        }

        frameCount = 0;
        startTime = performance.now();
      }
      rafId = requestAnimationFrame(measureFPS);
    };

    // Delay start of FPS tracking by 2.5s to ignore initial load/hydration lag spikes
    const startTimeout = setTimeout(() => {
      rafId = requestAnimationFrame(measureFPS);
    }, 2500);

    return () => {
      clearTimeout(startTimeout);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return isLowSpec;
}