"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";
import { usePreloader } from "@/components/PreloaderProvider";

export default function SmoothScroll() {
  const { scrollLocked } = usePreloader();
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // Vérifier si l'utilisateur a activé prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) return;

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 0.9,
      anchors: true,
    });
    lenisRef.current = lenis;

    let rafId: number;

    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }

    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  useEffect(() => {
    const lenis = lenisRef.current;
    if (!lenis) return;

    if (scrollLocked) lenis.stop();
    else lenis.start();
  }, [scrollLocked]);

  return null;
}
