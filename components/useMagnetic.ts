"use client";

import { useEffect, useRef, type RefObject } from "react";
import {
  useMotionValue,
  useSpring,
  type MotionStyle,
} from "framer-motion";

const SPRING = { stiffness: 300, damping: 28, mass: 0.5 };

type MagneticTarget = {
  element: HTMLElement;
  x: ReturnType<typeof useSpring>;
  y: ReturnType<typeof useSpring>;
};

const targets = new Set<MagneticTarget>();
let activeTarget: MagneticTarget | null = null;
let detachGlobalHandlers: (() => void) | null = null;

function resetTarget(target: MagneticTarget) {
  target.x.set(0);
  target.y.set(0);
}

function attachGlobalHandlers() {
  const handleMouseMove = (event: MouseEvent) => {
    const pointerQuery = window.matchMedia("(pointer: fine)");
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const element =
      event.target instanceof Element
        ? event.target.closest<HTMLElement>('[data-cursor="magnetic"]')
        : null;
    const target = element
      ? Array.from(targets).find((candidate) => candidate.element === element) ?? null
      : null;

    if (target !== activeTarget) {
      if (activeTarget) resetTarget(activeTarget);
      activeTarget = target;
    }
    if (!target || !pointerQuery.matches || motionQuery.matches) {
      if (target) resetTarget(target);
      return;
    }

    const bounds = target.element.getBoundingClientRect();
    const centerX = bounds.left + bounds.width / 2 - target.x.get();
    const centerY = bounds.top + bounds.height / 2 - target.y.get();
    const offsetX = (event.clientX - centerX) * 0.3;
    const offsetY = (event.clientY - centerY) * 0.3;
    const distance = Math.hypot(offsetX, offsetY);
    const ratio = distance > 12 ? 12 / distance : 1;

    target.x.set(offsetX * ratio);
    target.y.set(offsetY * ratio);
  };
  const handleMouseOut = (event: MouseEvent) => {
    if (
      activeTarget &&
      !(event.relatedTarget instanceof Node &&
        activeTarget.element.contains(event.relatedTarget))
    ) {
      resetTarget(activeTarget);
      activeTarget = null;
    }
  };

  document.addEventListener("mousemove", handleMouseMove, { passive: true });
  document.addEventListener("mouseout", handleMouseOut);
  detachGlobalHandlers = () => {
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseout", handleMouseOut);
    detachGlobalHandlers = null;
    activeTarget = null;
  };
}

export function useMagnetic<T extends HTMLElement = HTMLElement>(): {
  ref: RefObject<T>;
  style: MotionStyle;
} {
  const ref = useRef<T>(null);
  const x = useSpring(useMotionValue(0), SPRING);
  const y = useSpring(useMotionValue(0), SPRING);
  const targetRef = useRef<MagneticTarget | null>(null);

  if (!targetRef.current) {
    targetRef.current = {
      element: null as unknown as HTMLElement,
      x,
      y,
    };
  }

  useEffect(() => {
    const target = targetRef.current;
    if (!target || !ref.current) return;
    target.element = ref.current;
    targets.add(target);
    if (!detachGlobalHandlers) attachGlobalHandlers();

    return () => {
      targets.delete(target);
      if (activeTarget === target) activeTarget = null;
      resetTarget(target);
      if (targets.size === 0) detachGlobalHandlers?.();
    };
  }, []);

  return { ref, style: { x, y } };
}
