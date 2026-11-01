import { motion } from "framer-motion";
import type { CSSProperties, ReactNode } from "react";

/** Le trait des glyphes, en pixels pour un SVG dessiné dans une boîte 24 × 24. */
const GLYPH_STROKE_WIDTH = 1.6;

const EDITORIAL_EASE = [0.22, 1, 0.36, 1] as const;

/** Variables CSS acceptées par style={{}} sans cast en TypeScript strict. */
export type CssVars = CSSProperties & Record<`--${string}`, string | number>;

export type IconTokenProps = {
  name: string;
  /** Ce que la techno apporte ; sert d'infobulle. */
  role: string;
  glyph: ReactNode;
  index: number;
  total: number;
  reveal: boolean;
  reducedMotion: boolean;
  cursorText: string;
  cascadeSeconds: number;
  /** Même échelle que l'anneau : le flottement reste proportionnel aux jetons. */
  bobScale: number;
};

/**
 * Un jeton de l'anneau.
 *
 * Le DOM suit exactement la géométrie CSS (globals.css, bloc « ANNEAU D'ICÔNES
 * 3D ») : placement sur le cercle → contre-rotation → remise à plat →
 * flottement → pastille. Chaque niveau n'a qu'une responsabilité, ce qui
 * permet de laisser tourner l'anneau en keyframes sans jamais toucher au
 * transform de placement — et Motion n'écrit le sien que sur le dernier.
 */
export default function IconToken({
  name,
  role,
  glyph,
  index,
  total,
  reveal,
  reducedMotion,
  cursorText,
  cascadeSeconds,
  bobScale,
}: IconTokenProps) {
  const angle = (index / total) * 360;
  const bobDuration = 4 + (index % 4) * 0.7;
  const bobDelay = (index * 0.45) % 2.2;
  const bobAmount = (6 + (index % 3) * 2) * bobScale;

  const tokenStyle: CssVars = { "--token-angle": `${angle.toFixed(2)}deg` };
  const bobStyle: CssVars = {
    "--bob-duration": `${bobDuration.toFixed(2)}s`,
    "--bob-delay": `${bobDelay.toFixed(2)}s`,
    "--bob-amount": `${bobAmount}px`,
  };

  return (
    <div
      className="icon-ring__token group"
      style={tokenStyle}
      data-cursor-text={cursorText}
      aria-hidden="true"
    >
      <div className="icon-ring__counter">
        <div className="icon-ring__face">
          <div className="icon-ring__bob" style={bobStyle}>
            <motion.div
              className="h-full w-full"
              initial={reducedMotion ? false : { opacity: 0, scale: 0.5 }}
              animate={
                reveal ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }
              }
              transition={
                reducedMotion
                  ? { duration: 0.25 }
                  : {
                      duration: 0.55,
                      delay: index * cascadeSeconds,
                      ease: EDITORIAL_EASE,
                    }
              }
            >
              {/* Disque au trait seul : sans fond, l'empilement des jetons
                  reste lisible comme une surface, pas comme une rangée de
                  boutons. L'anneau complet ne s'allume qu'au survol. */}
              <div
                title={role}
                className="relative flex h-full w-full items-center justify-center rounded-full border border-accent-hair text-accent transition-[transform,color,border-color,box-shadow] duration-300 ease-editorial group-hover:scale-[1.15] group-hover:border-primary group-hover:bg-accent-faint group-hover:text-primary-hover group-hover:shadow-glow"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={GLYPH_STROKE_WIDTH}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-[46%] w-[46%]"
                >
                  {glyph}
                </svg>
                <span className="icon-ring__name font-mono text-[9px] uppercase tracking-[0.12em]">
                  {name}
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
