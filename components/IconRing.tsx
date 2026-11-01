"use client";

import { useEffect, useState } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import IconToken, { type CssVars } from "@/components/IconToken";
import {
  RING_ICONS,
  RING_ICONS_COMPACT,
  RING_ICON_NAMES,
  type RingIcon,
} from "@/lib/tech-icons";

/* ═══ POINTS D'ÉDIT ═══════════════════════════════════════════════
   Tout se règle ici. La couleur d'accent vit dans globals.css
   (--accent) : l'anneau n'utilise que les tokens qui en dérivent.

   L'anneau n'a plus de rayon fixe : il est calibré sur la largeur de
   l'écran, comme la référence. Sa taille découle de RING_WIDTH_SHARE.
   ═══════════════════════════════════════════════════════════════════ */

/** Largeur projetée de l'anneau, en fraction de la largeur d'écran. */
const RING_WIDTH_SHARE = 0.98;
const COMPACT_WIDTH_SHARE = 1.08;
/**
 * Bascule de la piste, en degrés. L'anneau est rendu avec rotateX(-tilt) :
 * l'arc le plus proche descend donc vers le bas de l'écran et l'arc éloigné
 * remonte vers le haut. 0 = vu de dessus (anneau réduit à une ligne),
 * 90 = à plat face caméra.
 */
const RING_TILT_DEG = 9;
/** Sur un écran étroit, l'anneau s'ouvre davantage : il reste lisible. */
const COMPACT_TILT_DEG = 16;
/**
 * Bandeau où vit l'anneau : de BAND_TOP_SHARE à bord bas. Le centre de
 * l'ellipse tombe à mi-bande, soit ~81% de la hauteur — comme la référence,
 * dont l'arc éloigné affleure la signature.
 * C'est ce bandeau qui porte le masque de profondeur, donc la fonte suit
 * toujours la zone réellement visible, quelle que soit la projection.
 */
const BAND_TOP_SHARE = 0.64;
/** Sur mobile, l'anneau est petit : centré, il ne toucherait pas le bord.
 *  On le cale donc au bas du bandeau pour que l'arc proche soit tranché. */
const COMPACT_BAND_TOP_SHARE = 0.7;
/** Focale = rayon × ce facteur. Plus bas = profondeur plus accusée. */
const RING_PERSPECTIVE_FACTOR = 2.5;
/** Diamètre d'une pastille. */
const TOKEN_SIZE = 62;
const COMPACT_TOKEN_SIZE = 42;
/** Durée d'un tour complet. */
const RING_SPIN_SECONDS = 70;
/** Les jetons apparaissent, puis l'anneau seulement commence à tourner. */
const RING_START_DELAY_SECONDS = 1.1;
/** Décalage entre l'apparition de deux jetons voisins. */
const TOKEN_CASCADE_SECONDS = 0.035;
/** true = jetons lisibles, face caméra. false = profil, comme la référence. */
const KEEP_TOKENS_UPRIGHT = true;
/** Amplitude max du suivi de curseur, en degrés. */
const PARALLAX_DEG = 4;
/** Libellé affiché par le curseur personnalisé au survol d'un jeton. */
const TOKEN_CURSOR_TEXT = "Voir";

/**
 * Nappe de sections fines intercalées entre les jetons : ce sont elles qui
 * donnent à l'anneau sa matière de tore, les jetons restant la couche
 * lisible. À 0, l'anneau redevient un collier de pastilles.
 */
const SPOKE_COUNT = 64;
const COMPACT_SPOKE_COUNT = 34;
/** Diamètre d'une section, en fraction d'un jeton. */
const SPOKE_SIZE_RATIO = 0.8;

/** Amplitude et temps de la montée de l'anneau depuis le bas de l'écran. */
const RING_ENTRANCE_Y = 80;
const RING_ENTRANCE_SECONDS = 0.9;
const RING_ENTRANCE_DELAY = 0.45;

/** Positions du fondu, mesurées depuis le haut du bandeau (l'arc éloigné). */
const MASK_FAR = "12%";
const MASK_MID = "34%";
const MASK_SOLID = "60%";

/** Sous ce seuil : moins de jetons, ni flou ni parallaxe. */
const COMPACT_BREAKPOINT = "(max-width: 767px)";

/** Largeur retenue avant la première mesure, pour un rendu serveur cohérent. */
const FALLBACK_VIEWPORT_WIDTH = 1280;

const EDITORIAL_EASE = [0.22, 1, 0.36, 1] as const;
const SPRING = { stiffness: 60, damping: 18, mass: 0.6 };
/* ═════════════════════════════════════════════════════════════════ */

export default function IconRing({
  reveal,
  reducedMotion,
  scrollY,
}: {
  reveal: boolean;
  reducedMotion: boolean;
  /** Descente de l'anneau au scroll, en pourcentage de sa propre hauteur. */
  scrollY?: MotionValue<string>;
}) {
  const [viewportWidth, setViewportWidth] = useState(FALLBACK_VIEWPORT_WIDTH);
  const [isCompact, setIsCompact] = useState(false);

  useEffect(() => {
    const query = window.matchMedia(COMPACT_BREAKPOINT);
    const sync = () => {
      setIsCompact(query.matches);
      setViewportWidth(window.innerWidth);
    };
    sync();
    query.addEventListener("change", sync);
    window.addEventListener("resize", sync);
    return () => {
      query.removeEventListener("change", sync);
      window.removeEventListener("resize", sync);
    };
  }, []);

  const icons: RingIcon[] = isCompact ? RING_ICONS_COMPACT : RING_ICONS;
  const tiltDeg = isCompact ? COMPACT_TILT_DEG : RING_TILT_DEG;
  const tiltRad = (tiltDeg * Math.PI) / 180;
  const tokenSize = isCompact ? COMPACT_TOKEN_SIZE : TOKEN_SIZE;
  /* Le rayon découle de la largeur visée, moins le gabarit d'un jeton. */
  const radius =
    ((isCompact ? COMPACT_WIDTH_SHARE : RING_WIDTH_SHARE) * viewportWidth) / 2 -
    tokenSize;
  const perspective = radius * RING_PERSPECTIVE_FACTOR;

  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const stageRotateY = useSpring(
    useTransform(pointerX, [-0.5, 0.5], [-PARALLAX_DEG, PARALLAX_DEG]),
    SPRING,
  );
  const stageRotateX = useSpring(
    useTransform(pointerY, [-0.5, 0.5], [PARALLAX_DEG, -PARALLAX_DEG]),
    SPRING,
  );

  const canParallax = !isCompact && !reducedMotion;

  useEffect(() => {
    if (!canParallax) return;
    const onPointerMove = (event: MouseEvent) => {
      pointerX.set(event.clientX / window.innerWidth - 0.5);
      pointerY.set(event.clientY / window.innerHeight - 0.5);
    };
    window.addEventListener("mousemove", onPointerMove);
    return () => window.removeEventListener("mousemove", onPointerMove);
  }, [canParallax, pointerX, pointerY]);

  /* Emprise projetée : pleine largeur, hauteur aplatie par la bascule.
     L'arc proche et l'arc éloigné s'écartent de radius × sin(tilt). */
  const ringStyle: CssVars = {
    width: 2 * (radius + tokenSize),
    height: 2 * (radius * Math.sin(tiltRad) + tokenSize),
    "--ring-radius": `${radius.toFixed(2)}px`,
    "--ring-tilt": `-${tiltDeg}deg`,
    "--ring-perspective": `${perspective.toFixed(2)}px`,
    "--ring-spin": `${RING_SPIN_SECONDS}s`,
    "--ring-spin-delay": `${reducedMotion ? 0 : RING_START_DELAY_SECONDS}s`,
    "--token-size": `${tokenSize.toFixed(2)}px`,
    "--spoke-size": `${(tokenSize * SPOKE_SIZE_RATIO).toFixed(2)}px`,
  };
  const spokeCount = isCompact ? COMPACT_SPOKE_COUNT : SPOKE_COUNT;
  /* Les variables du masque vivent sur le bandeau qui le consomme : elles ne
     descendraient pas de l'anneau vers son parent. */
  const bandStyle: CssVars = {
    top: `${((isCompact ? COMPACT_BAND_TOP_SHARE : BAND_TOP_SHARE) * 100).toFixed(2)}%`,
    "--ring-mask-far": MASK_FAR,
    "--ring-mask-mid": MASK_MID,
    "--ring-mask-solid": MASK_SOLID,
  };

  return (
    /* Bandeau masqué : le centre de l'ellipse tombe à mi-bande, et le fondu
       de profondeur couvre exactement la part visible de l'anneau. */
    <motion.div
      style={{ ...(scrollY ? { y: scrollY } : null), ...bandStyle }}
      className={`icon-ring-band pointer-events-none absolute inset-x-0 bottom-0 z-[1] flex justify-center ${
        isCompact ? "items-end" : "items-center"
      }`}
    >
      <motion.div
        className="icon-ring"
        data-ring-face={KEEP_TOKENS_UPRIGHT ? "upright" : "flat"}
        data-ring-run={reveal ? "running" : "waiting"}
        style={ringStyle}
        initial={reducedMotion ? false : { opacity: 0, y: RING_ENTRANCE_Y }}
        animate={reveal ? { opacity: 1, y: 0 } : { opacity: 0, y: RING_ENTRANCE_Y }}
        transition={
          reducedMotion
            ? { duration: 0.3 }
            : {
                duration: RING_ENTRANCE_SECONDS,
                delay: RING_ENTRANCE_DELAY,
                ease: EDITORIAL_EASE,
              }
        }
      >
        <motion.div
          className="icon-ring__stage"
          style={{ rotateX: stageRotateX, rotateY: stageRotateY }}
        >
          <div className="icon-ring__track">
            {/* Les sections suivent l'assiette de l'anneau : vues de profil
                devant, à plat sur les côtés — la matière du tore. */}
            <div className="icon-ring__spinner" aria-hidden="true">
              {Array.from({ length: spokeCount }, (_, index) => (
                <span
                  key={index}
                  className="icon-ring__spoke"
                  style={{
                    "--token-angle": `${((index / spokeCount) * 360).toFixed(2)}deg`,
                  } as CssVars}
                />
              ))}
            </div>
            <div className="icon-ring__spinner">
              {icons.map((icon, index) => (
                <IconToken
                  key={icon.name}
                  name={icon.name}
                  role={icon.role}
                  glyph={icon.glyph}
                  index={index}
                  total={icons.length}
                  reveal={reveal}
                  reducedMotion={reducedMotion}
                  cursorText={TOKEN_CURSOR_TEXT}
                  cascadeSeconds={TOKEN_CASCADE_SECONDS}
                  bobScale={radius / 600}
                />
              ))}
            </div>
          </div>
        </motion.div>

        {/* Les jetons sont décoratifs : la liste réelle est donnée à lire. */}
        <p className="sr-only">{`Technologies : ${RING_ICON_NAMES.join(", ")}.`}</p>
      </motion.div>
    </motion.div>
  );
}
