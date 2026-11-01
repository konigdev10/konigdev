import { animate, type MotionProps } from "framer-motion";

const EDITORIAL_EASE = [0.22, 1, 0.36, 1] as const;

interface ScrollRevealOptions {
  delay?: number;
  y?: number;
  margin?: string;
}

export function getScrollRevealProps(
  { delay = 0, y = 20, margin = "-80px" }: ScrollRevealOptions = {}
): MotionProps & { "data-scroll-reveal": string } {
  const transition = {
    duration: 0.7,
    delay,
    ease: EDITORIAL_EASE,
  };

  return {
    "data-scroll-reveal": "",
    initial: { opacity: 1, y: 0 },
    viewport: { once: true, margin },
    onViewportEnter: (entry) => {
      if (!entry) return;

      const element = entry.target;

      if (
        window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
        !(element instanceof HTMLElement) ||
        element.hasAttribute("data-scroll-reveal-complete")
      ) {
        return;
      }

      element.setAttribute("data-scroll-reveal-complete", "");
      animate(element, { opacity: [0, 1], y: [y, 0] }, transition);
    },
  };
}
