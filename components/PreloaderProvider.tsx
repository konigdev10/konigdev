"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { AnimatePresence } from "framer-motion";
import Preloader from "@/components/Preloader";
import {
  PRELOADER_DURATION_MS,
  PRELOADER_REDUCED_DELAY_MS,
  PRELOADER_STORAGE_KEY,
} from "@/components/preloaderConfig";

type PreloaderPhase = "checking" | "loading" | "opening" | "done";

type PreloaderContextValue = {
  phase: PreloaderPhase;
  progress: number;
  reducedMotion: boolean;
  scrollLocked: boolean;
};

const PreloaderContext = createContext<PreloaderContextValue>({
  phase: "checking",
  progress: 0,
  reducedMotion: false,
  scrollLocked: false,
});

export function usePreloader() {
  return useContext(PreloaderContext);
}

function restoreStyle(
  style: CSSStyleDeclaration,
  property: string,
  value: string,
  priority: string
) {
  if (value) style.setProperty(property, value, priority);
  else style.removeProperty(property);
}

export default function PreloaderProvider({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [phase, setPhase] = useState<PreloaderPhase>("checking");
  const [progress, setProgress] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const phaseRef = useRef<PreloaderPhase>("checking");

  const openCurtain = useCallback(() => {
    if (phaseRef.current !== "loading") return;
    phaseRef.current = "opening";
    setPhase("opening");
  }, []);

  const finishExit = useCallback(() => {
    if (phaseRef.current !== "opening") return;
    phaseRef.current = "done";
    setPhase("done");
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mediaQuery.matches);

    const handleMotionChange = (event: MediaQueryListEvent) => {
      setReducedMotion(event.matches);
      if (event.matches) {
        setProgress(100);
        openCurtain();
      }
    };

    mediaQuery.addEventListener("change", handleMotionChange);

    if (phaseRef.current === "checking") {
      let alreadySeen = false;
      try {
        alreadySeen = window.sessionStorage.getItem(PRELOADER_STORAGE_KEY) === "true";
      } catch {
        // Storage can be disabled; the intro remains usable for this visit.
      }

      if (alreadySeen) {
        phaseRef.current = "done";
        setProgress(100);
        setPhase("done");
      } else {
        try {
          window.sessionStorage.setItem(PRELOADER_STORAGE_KEY, "true");
        } catch {
          // A storage failure must not prevent the intro from completing.
        }
        phaseRef.current = "loading";
        setProgress(0);
        setPhase("loading");
      }
    }

    return () => mediaQuery.removeEventListener("change", handleMotionChange);
  }, [openCurtain]);

  useEffect(() => {
    if (phase !== "loading") return;

    if (reducedMotion) {
      setProgress(100);
      const timeoutId = window.setTimeout(
        openCurtain,
        PRELOADER_REDUCED_DELAY_MS
      );
      return () => window.clearTimeout(timeoutId);
    }

    let frameId = 0;
    const startedAt = performance.now();
    const updateProgress = (now: number) => {
      const nextProgress = Math.min(
        100,
        ((now - startedAt) / PRELOADER_DURATION_MS) * 100
      );
      setProgress(nextProgress);
      if (nextProgress >= 100) {
        openCurtain();
        return;
      }
      frameId = window.requestAnimationFrame(updateProgress);
    };

    frameId = window.requestAnimationFrame(updateProgress);
    const fallbackTimeout = window.setTimeout(() => {
      setProgress(100);
      openCurtain();
    }, PRELOADER_DURATION_MS + 100);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.clearTimeout(fallbackTimeout);
    };
  }, [openCurtain, phase, reducedMotion]);

  const scrollLocked = phase === "loading";

  useEffect(() => {
    if (!scrollLocked) return;

    const html = document.documentElement;
    const body = document.body;
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;
    const htmlOverflow = html.style.getPropertyValue("overflow");
    const htmlOverflowPriority = html.style.getPropertyPriority("overflow");
    const htmlScrollBehavior = html.style.getPropertyValue("scroll-behavior");
    const htmlScrollBehaviorPriority =
      html.style.getPropertyPriority("scroll-behavior");
    const bodyProperties = ["position", "top", "left", "right", "width", "overflow"];
    const originalBodyStyles = bodyProperties.map((property) => ({
      property,
      value: body.style.getPropertyValue(property),
      priority: body.style.getPropertyPriority(property),
    }));

    html.style.setProperty("overflow", "hidden");
    html.style.setProperty("scroll-behavior", "auto", "important");
    body.style.setProperty("position", "fixed");
    body.style.setProperty("top", `-${scrollY}px`);
    body.style.setProperty("left", `-${scrollX}px`);
    body.style.setProperty("right", "0");
    body.style.setProperty("width", "100%");
    body.style.setProperty("overflow", "hidden");

    return () => {
      restoreStyle(html.style, "overflow", htmlOverflow, htmlOverflowPriority);
      bodyProperties.forEach((property, index) => {
        const original = originalBodyStyles[index];
        restoreStyle(body.style, property, original.value, original.priority);
      });
      window.scrollTo(scrollX, scrollY);
      restoreStyle(
        html.style,
        "scroll-behavior",
        htmlScrollBehavior,
        htmlScrollBehaviorPriority
      );
    };
  }, [scrollLocked]);

  const contextValue = {
    phase,
    progress,
    reducedMotion,
    scrollLocked,
  };

  return (
    <PreloaderContext.Provider value={contextValue}>
      {children}
      <AnimatePresence initial={false} onExitComplete={finishExit}>
        {phase === "loading" && (
          <Preloader
            key="konigdev-preloader"
            progress={progress}
            reducedMotion={reducedMotion}
            onSkip={openCurtain}
          />
        )}
      </AnimatePresence>
    </PreloaderContext.Provider>
  );
}
