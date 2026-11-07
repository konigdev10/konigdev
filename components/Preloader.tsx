"use client";

import Image from "next/image";
import { motion, type Variants } from "framer-motion";
import {
  PRELOADER_EXIT_DURATION_SECONDS,
  PRELOADER_LINES,
  PRELOADER_REDUCED_EXIT_SECONDS,
  PRELOADER_STAGES,
} from "@/components/preloaderConfig";

type PreloaderProps = {
  progress: number;
  reducedMotion: boolean;
  onSkip: () => void;
};

const curtainVariants: Variants = {
  visible: { x: "0%" },
  exit: (reducedMotion: boolean) => ({
    x: reducedMotion ? "0%" : "-100%",
    transition: {
      duration: reducedMotion ? 0 : PRELOADER_EXIT_DURATION_SECONDS,
      ease: [0.76, 0, 0.24, 1] as const,
    },
  }),
};

const rightCurtainVariants: Variants = {
  ...curtainVariants,
  exit: (reducedMotion: boolean) => ({
    x: reducedMotion ? "0%" : "100%",
    transition: {
      duration: reducedMotion ? 0 : PRELOADER_EXIT_DURATION_SECONDS,
      ease: [0.76, 0, 0.24, 1] as const,
    },
  }),
};

const overlayVariants: Variants = {
  visible: { opacity: 1 },
  exit: (reducedMotion: boolean) => ({
    opacity: reducedMotion ? 0 : 1,
    transition: {
      duration: reducedMotion ? PRELOADER_REDUCED_EXIT_SECONDS : PRELOADER_EXIT_DURATION_SECONDS,
      ease: "easeOut" as const,
    },
  }),
};

const contentVariants: Variants = {
  visible: { opacity: 1, y: 0 },
  exit: {
    opacity: 0,
    y: 0,
    transition: { duration: 0.16, ease: "easeOut" as const },
  },
};

function getStageIndex(progress: number) {
  if (progress < 18) return 0;
  if (progress < 38) return 1;
  if (progress < 60) return 2;
  if (progress < 82) return 3;
  return 4;
}

export default function Preloader({
  progress,
  reducedMotion,
  onSkip,
}: PreloaderProps) {
  const totalCharacters = PRELOADER_LINES.reduce(
    (total, line) => total + line.length,
    0
  );
  const visibleCharacters = Math.floor((progress / 100) * totalCharacters);
  let remainingCharacters = visibleCharacters;
  const terminalLines = PRELOADER_LINES.map((line) => {
    const visibleLine = line.slice(0, Math.max(0, Math.min(line.length, remainingCharacters)));
    remainingCharacters -= line.length;
    return visibleLine;
  });
  const stage = PRELOADER_STAGES[getStageIndex(progress)];

  return (
    <motion.div
      className="fixed inset-0 z-[10000] overflow-hidden text-on-surface"
      custom={reducedMotion}
      variants={overlayVariants}
      initial="visible"
      animate="visible"
      exit="exit"
      aria-label="Introduction KoniGDeV"
    >
      <motion.div
        className="pointer-events-none absolute inset-y-0 left-0 w-1/2 bg-[#0a0a0a]"
        custom={reducedMotion}
        variants={curtainVariants}
      />
      <motion.div
        className="pointer-events-none absolute inset-y-0 right-0 w-1/2 bg-[#0a0a0a]"
        custom={reducedMotion}
        variants={rightCurtainVariants}
      />

      <motion.div
        className="absolute inset-0 flex items-center justify-center px-5"
        variants={contentVariants}
      >
        <div className="w-full max-w-xl rounded-lg border border-white/10 bg-[#0a0a0a]/95 p-4 shadow-2xl sm:p-6">
          <div className="mb-5 flex items-center gap-2.5 border-b border-white/10 pb-3 font-mono text-[10px] text-white/55 sm:text-xs">
            <div className="relative w-4 h-4 shrink-0 opacity-80">
              <Image
                src="/logo-white.png"
                alt="Logo KoniG.dev"
                fill
                sizes="16px"
                className="object-contain"
              />
            </div>
            <span>konigdev — portfolio</span>
            <span className="ml-auto">session: active</span>
          </div>

          <div
            className="min-h-[7.5rem] space-y-2 break-words font-mono text-[10px] leading-relaxed sm:min-h-[8.5rem] sm:text-xs"
            aria-hidden="true"
          >
            {terminalLines.map((line, index) => (
              <p key={PRELOADER_LINES[index]} className="min-h-[1.25rem]">
                <span className="text-accent">{line}</span>
                {line.length > 0 && index === terminalLines.findIndex((entry, lineIndex) => entry.length < PRELOADER_LINES[lineIndex].length) && (
                  <span className="ml-0.5 inline-block h-3 w-1.5 animate-pulse bg-accent align-middle" />
                )}
              </p>
            ))}
          </div>

          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-white/60 sm:text-xs">
              <span>Chargement</span>
              <span>{Math.floor(progress)}%</span>
            </div>
            <div className="h-1 overflow-hidden rounded-full bg-white/10">
              <motion.div
                className="h-full origin-left rounded-full bg-accent"
                style={{ scaleX: progress / 100 }}
              />
            </div>
          </div>

          <p className="mt-3 min-h-4 font-mono text-[10px] text-accent sm:text-xs">
            {progress >= 100 ? "Initialisation terminée — bienvenue." : ""}
          </p>

          <div className="mt-5 flex items-center justify-between gap-4">
            <p
              role="status"
              aria-live="polite"
              aria-atomic="true"
              className="font-mono text-[9px] text-white/50 sm:text-[10px]"
            >
              {stage}
            </p>
            <button
              type="button"
              onClick={onSkip}
              className="shrink-0 rounded border border-white/20 px-3 py-1.5 font-mono text-[10px] text-white transition-colors hover:border-accent hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:text-xs"
            >
              Passer
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
