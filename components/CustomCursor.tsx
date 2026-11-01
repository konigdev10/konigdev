"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  animate,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";

/* ══════════════════════════════════════════════════════════════════
   RÉGLAGES — tout se modifie ici.
   ══════════════════════════════════════════════════════════════════ */

/** Diamètres du disque, en px. Les échelles en dérivent (scale = diamètre / BASE). */
const BASE_DIAMETER = 16;
const HOVER_DIAMETER = 56;
const TEXT_DIAMETER = 88;
const DOT_DIAMETER = 4;

/** Échelle appliquée au disque pendant le clic. */
const CLICK_SCALE = 0.85;

/** Libellé : police = --font-mono (JetBrains Mono, déclarée dans app/layout.tsx). */
const LABEL_FONT_SIZE = 12;
const LABEL_TRACKING = "0.08em";
const LABEL_SCALE_FROM = 0.85;

/** Retard du disque derrière la souris. */
const SPRING = { stiffness: 300, damping: 28, mass: 0.5 };

/** Durées, en secondes (Motion les attend en s, pas en ms). */
const GROW_DURATION = 0.3;
const LABEL_DURATION = 0.2;
const FADE_DURATION = 0.18;
const CLICK_DURATION = 0.12;

/** Courbe éditoriale du site. */
const GROW_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/** Anneau magnétique (mode `data-cursor="magnetic"`) : suit l'accent du thème. */
const MAGNET_COLOR = "var(--accent)";
const MAGNET_BORDER_WIDTH = 1;

const Z_INDEX = 2147483647;

/* Sélecteurs de délégation. */
const TEXT_ATTRIBUTE = "data-cursor-text";
const TARGET_SELECTOR = `[${TEXT_ATTRIBUTE}], [data-cursor], a, button`;
const MAGNET_SELECTOR = '[data-cursor="magnetic"]';
const NATIVE_SELECTOR =
  'input, textarea, select, [contenteditable="true"], :disabled, [aria-disabled="true"]';

/* ══════════════════════════════════════════════════════════════════ */

type CursorState = "idle" | "hover" | "text" | "magnetic";
type Ease = [number, number, number, number] | "easeOut";

type CursorUi = {
  state: CursorState;
  label: string;
  /** Curseur sur un champ de saisie : le visuel disparaît, le curseur natif reprend. */
  suppressed: boolean;
  /** Le pointeur est dans la fenêtre. */
  inWindow: boolean;
  /** Dimensions de l'élément aimanté, relevées à l'entrée du survol. */
  magnet: { width: number; height: number } | null;
};

const INITIAL_UI: CursorUi = {
  state: "idle",
  label: "",
  suppressed: false,
  inWindow: false,
  magnet: null,
};

function sameMagnet(a: CursorUi["magnet"], b: CursorUi["magnet"]) {
  if (a === null || b === null) return a === b;
  return Math.abs(a.width - b.width) < 1 && Math.abs(a.height - b.height) < 1;
}

export default function CustomCursor() {
  const [mounted, setMounted] = useState(false);
  const [finePointer, setFinePointer] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [ui, setUi] = useState<CursorUi>(INITIAL_UI);

  const reducedRef = useRef(false);
  const magnetElementRef = useRef<HTMLElement | null>(null);
  const labelShownRef = useRef(false);

  // Position réelle du pointeur : le point de visée, et la source du ressort.
  const pointerX = useMotionValue(-100);
  const pointerY = useMotionValue(-100);
  const followX = useSpring(pointerX, SPRING);
  const followY = useSpring(pointerY, SPRING);
  const magnetX = useMotionValue(-100);
  const magnetY = useMotionValue(-100);

  // Grandeur et pression composent l'échelle finale du disque.
  const sizeScale = useMotionValue(1);
  const pressScale = useMotionValue(1);
  const diskScale = useTransform(
    [sizeScale, pressScale],
    ([size, press]: number[]) => size * press
  );
  // Contre-échelle : le libellé garde LABEL_FONT_SIZE quelle que soit la taille du disque.
  const labelEntrance = useMotionValue(LABEL_SCALE_FROM);
  const labelScale = useTransform(
    [sizeScale, labelEntrance],
    ([size, entrance]: number[]) => entrance / size
  );

  const diskOpacity = useMotionValue(0);
  const dotOpacity = useMotionValue(0);
  const magnetOpacity = useMotionValue(0);
  const labelOpacity = useMotionValue(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const pointerQuery = window.matchMedia("(pointer: fine)");
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const sync = () => {
      setFinePointer(pointerQuery.matches);
      setReducedMotion(motionQuery.matches);
      reducedRef.current = motionQuery.matches;
    };

    sync();
    pointerQuery.addEventListener("change", sync);
    motionQuery.addEventListener("change", sync);

    return () => {
      pointerQuery.removeEventListener("change", sync);
      motionQuery.removeEventListener("change", sync);
    };
  }, []);

  useEffect(() => {
    const commit = (patch: Partial<CursorUi>) => {
      setUi((previous) => {
        const next = { ...previous, ...patch };
        const unchanged =
          next.state === previous.state &&
          next.label === previous.label &&
          next.suppressed === previous.suppressed &&
          next.inWindow === previous.inWindow &&
          sameMagnet(next.magnet, previous.magnet);
        return unchanged ? previous : next;
      });
    };

    const applyFrom = (element: Element | null) => {
      if (element?.closest(NATIVE_SELECTOR)) {
        magnetElementRef.current = null;
        commit({ state: "idle", label: "", suppressed: true });
        return;
      }

      const target = element?.closest(TARGET_SELECTOR) as HTMLElement | null;
      if (!target) {
        magnetElementRef.current = null;
        commit({ state: "idle", label: "", suppressed: false });
        return;
      }

      // 1. Un libellé demandé par l'auteur passe avant tout.
      const textElement = element?.closest(`[${TEXT_ATTRIBUTE}]`);
      const text = textElement?.getAttribute(TEXT_ATTRIBUTE)?.trim();
      if (text) {
        magnetElementRef.current = null;
        commit({ state: "text", label: text, suppressed: false });
        return;
      }

      // 2. Élément aimanté : anneau distinct.
      const magnetElement = element?.closest<HTMLElement>(MAGNET_SELECTOR) ?? null;
      if (magnetElement) {
        magnetElementRef.current = magnetElement;
        const bounds = magnetElement.getBoundingClientRect();
        magnetX.set(bounds.left + bounds.width / 2);
        magnetY.set(bounds.top + bounds.height / 2);
        commit({
          state: "magnetic",
          label: "",
          suppressed: false,
          magnet: { width: bounds.width, height: bounds.height },
        });
        return;
      }

      // 3. Lien ou bouton : disque agrandi, sans texte.
      magnetElementRef.current = null;
      commit({ state: "hover", label: "", suppressed: false });
    };

    const handlePointerOver = (event: MouseEvent) => {
      const from = event.target instanceof Element ? event.target : null;
      const to = event.relatedTarget instanceof Element ? event.relatedTarget : null;
      if (event.type === "mouseout" && from && to && from.contains(to)) return;
      applyFrom(event.type === "mouseout" ? to : from);
    };

    const handleMouseMove = (event: MouseEvent) => {
      const { clientX, clientY } = event;
      pointerX.set(clientX);
      pointerY.set(clientY);

      const magnetElement = magnetElementRef.current;
      if (magnetElement) {
        const bounds = magnetElement.getBoundingClientRect();
        magnetX.set(bounds.left + bounds.width / 2);
        magnetY.set(bounds.top + bounds.height / 2);
      }

      setUi((previous) => (previous.inWindow ? previous : { ...previous, inWindow: true }));
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Tab") {
        setUi((previous) => ({ ...previous, inWindow: false }));
      }
    };

    const handleWindowExit = () => {
      setUi((previous) => ({ ...previous, inWindow: false }));
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("mouseover", handlePointerOver);
    document.addEventListener("mouseout", handlePointerOver);
    document.addEventListener("mouseleave", handleWindowExit);
    window.addEventListener("blur", handleWindowExit);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseover", handlePointerOver);
      document.removeEventListener("mouseout", handlePointerOver);
      document.removeEventListener("mouseleave", handleWindowExit);
      window.removeEventListener("blur", handleWindowExit);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [pointerX, pointerY, followX, followY, magnetX, magnetY]);

  useEffect(() => {
    const tween = (duration: number, ease: Ease = GROW_EASE) => ({
      type: "tween" as const,
      duration: reducedRef.current ? 0 : duration,
      ease,
    });

    const handleMouseDown = () => {
      animate(pressScale, CLICK_SCALE, tween(CLICK_DURATION, "easeOut"));
    };
    const handleMouseUp = () => {
      animate(pressScale, 1, tween(CLICK_DURATION, "easeOut"));
    };

    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("blur", handleMouseUp);

    return () => {
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("blur", handleMouseUp);
      animate(pressScale, 1, { type: "tween", duration: 0, ease: "linear" });
    };
  }, [pressScale]);

  // Les visuels sont pilotés par les motion values ; `ui` ne change qu'aux transitions d'état.
  useEffect(() => {
    const tween = (duration: number, ease: Ease = GROW_EASE) => ({
      type: "tween" as const,
      duration: reducedMotion ? 0 : duration,
      ease,
    });

    const present = ui.inWindow && !ui.suppressed;
    const showDisk = present && !reducedMotion && ui.state !== "magnetic";
    const showLabel = showDisk && ui.state === "text";
    const showMagnet = present && !reducedMotion && ui.state === "magnetic";
    // Le point de visée se cache dès que le disque affiche un libellé.
    const showDot = present && !showLabel;

    const diameter =
      ui.state === "text"
        ? TEXT_DIAMETER
        : ui.state === "hover"
          ? HOVER_DIAMETER
          : BASE_DIAMETER;

    animate(sizeScale, diameter / BASE_DIAMETER, tween(GROW_DURATION));
    animate(diskOpacity, showDisk ? 1 : 0, tween(FADE_DURATION, "easeOut"));
    animate(dotOpacity, showDot ? 1 : 0, tween(FADE_DURATION, "easeOut"));
    animate(magnetOpacity, showMagnet ? 1 : 0, tween(FADE_DURATION, "easeOut"));

    if (showLabel && !labelShownRef.current) {
      labelEntrance.set(LABEL_SCALE_FROM);
      animate(labelEntrance, 1, tween(LABEL_DURATION));
      animate(labelOpacity, 1, tween(LABEL_DURATION, "easeOut"));
    }
    if (!showLabel) {
      animate(labelOpacity, 0, tween(FADE_DURATION, "easeOut"));
    }
    labelShownRef.current = showLabel;
  }, [
    diskOpacity,
    dotOpacity,
    labelEntrance,
    labelOpacity,
    magnetOpacity,
    reducedMotion,
    sizeScale,
    ui,
  ]);

  useEffect(() => {
    const root = document.documentElement;
    if (finePointer && ui.inWindow) root.dataset.customCursor = "active";
    else delete root.dataset.customCursor;

    return () => {
      delete root.dataset.customCursor;
    };
  }, [finePointer, ui.inWindow]);

  // Souris absente (tactile) ou avant hydratation : rien n'est rendu.
  if (!mounted || !finePointer) return null;

  return createPortal(
    <>
      {!reducedMotion && (
        <motion.div
          aria-hidden="true"
          className="pointer-events-none fixed select-none rounded-full bg-white mix-blend-difference"
          style={{
            left: followX,
            top: followY,
            width: BASE_DIAMETER,
            height: BASE_DIAMETER,
            x: "-50%",
            y: "-50%",
            scale: diskScale,
            opacity: diskOpacity,
            zIndex: Z_INDEX,
          }}
        >
          <motion.span
            className="whitespace-nowrap font-mono uppercase leading-none text-black"
            style={{
              fontSize: LABEL_FONT_SIZE,
              letterSpacing: LABEL_TRACKING,
              scale: labelScale,
              opacity: labelOpacity,
            }}
          >
            {ui.label}
          </motion.span>
        </motion.div>
      )}

      <motion.div
        aria-hidden="true"
        className="pointer-events-none fixed rounded-full bg-white mix-blend-difference"
        style={{
          left: pointerX,
          top: pointerY,
          width: DOT_DIAMETER,
          height: DOT_DIAMETER,
          x: "-50%",
          y: "-50%",
          opacity: dotOpacity,
          zIndex: Z_INDEX,
        }}
      />

      {!reducedMotion && ui.magnet && (
        <motion.div
          aria-hidden="true"
          className="pointer-events-none fixed rounded-full"
          style={{
            left: magnetX,
            top: magnetY,
            width: ui.magnet.width,
            height: ui.magnet.height,
            borderWidth: MAGNET_BORDER_WIDTH,
            borderStyle: "solid",
            borderColor: MAGNET_COLOR,
            x: "-50%",
            y: "-50%",
            opacity: magnetOpacity,
            zIndex: Z_INDEX,
          }}
        />
      )}
    </>,
    document.body
  );
}
