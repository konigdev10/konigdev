"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion, useScroll } from "framer-motion";
import { usePreloader } from "@/components/PreloaderProvider";

/* ═══ POINTS D'ÉDIT ═══════════════════════════════════════════════
   Libellés et ordre reprennent l'ordre réel des sections de la page.
   ═══════════════════════════════════════════════════════════════════ */
const NAV_LINKS = [
  { label: "Services", hash: "#services" },
  { label: "Projets", hash: "#projets" },
  { label: "À propos", hash: "#a-propos" },
  { label: "Contact", hash: "#contact" },
] as const;

/** Seuil au-delà duquel la barre se compacte. */
const COMPACT_THRESHOLD = 48;
/** Seuil au-delà duquel elle peut se masquer quand on descend. */
const HIDE_THRESHOLD = 180;
/** Temps pendant lequel un clic d'ancre maintient la barre visible. */
const ANCHOR_VISIBILITY_MS = 1700;
/** Bande centrale du viewport : la section qui la traverse est active. */
const SPY_ROOT_MARGIN = "-45% 0px -45% 0px";
/* ═════════════════════════════════════════════════════════════════ */

const EDITORIAL_EASE = [0.22, 1, 0.36, 1] as const;

const NAV_LINK_CLASS =
  "nav-link whitespace-nowrap px-1 py-2 font-mono text-[9px] uppercase tracking-[0.12em] text-on-surface-variant transition-colors duration-300 ease-editorial hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:text-[10px]";

export default function Navbar() {
  const { scrollY, scrollYProgress } = useScroll();
  const { phase, reducedMotion } = usePreloader();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [activeHash, setActiveHash] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const focusWithinRef = useRef(false);
  const anchorTimeoutRef = useRef<number | null>(null);
  const anchorPinnedRef = useRef(false);
  const menuPanelRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  const keepVisibleForAnchor = useCallback(() => {
    anchorPinnedRef.current = true;
    setIsVisible(true);
    if (anchorTimeoutRef.current !== null) {
      window.clearTimeout(anchorTimeoutRef.current);
    }
    anchorTimeoutRef.current = window.setTimeout(() => {
      anchorPinnedRef.current = false;
      anchorTimeoutRef.current = null;
    }, ANCHOR_VISIBILITY_MS);
  }, []);

  useEffect(() => {
    let previousY = scrollY.get();
    setIsScrolled(previousY > COMPACT_THRESHOLD);

    return scrollY.on("change", (latestY) => {
      const direction = latestY - previousY;
      previousY = latestY;
      setIsScrolled(latestY > COMPACT_THRESHOLD);

      if (latestY <= COMPACT_THRESHOLD) {
        setIsVisible(false);
      } else if (
        reducedMotion ||
        focusWithinRef.current ||
        anchorPinnedRef.current ||
        isMenuOpen
      ) {
        setIsVisible(true);
      } else if (direction > 1 && latestY > HIDE_THRESHOLD) {
        setIsVisible(false);
      } else if (direction < -1) {
        setIsVisible(true);
      }
    });
  }, [isMenuOpen, reducedMotion, scrollY]);

  useEffect(
    () => () => {
      if (anchorTimeoutRef.current !== null) {
        window.clearTimeout(anchorTimeoutRef.current);
      }
    },
    []
  );

  useEffect(() => {
    const handleKeepVisible = () => keepVisibleForAnchor();
    window.addEventListener("konigdev:keep-navbar-visible", handleKeepVisible);
    return () =>
      window.removeEventListener(
        "konigdev:keep-navbar-visible",
        handleKeepVisible
      );
  }, [keepVisibleForAnchor]);

  /* Lien actif = la section qui occupe le centre du viewport. */
  useEffect(() => {
    const sections = NAV_LINKS.map((link) =>
      document.getElementById(link.hash.slice(1))
    ).filter((node): node is HTMLElement => node !== null);
    if (sections.length === 0) return;

    const onScreen = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) onScreen.add(entry.target.id);
          else onScreen.delete(entry.target.id);
        }
        const current = NAV_LINKS.find((link) =>
          onScreen.has(link.hash.slice(1))
        );
        setActiveHash(current ? current.hash : null);
      },
      { rootMargin: SPY_ROOT_MARGIN, threshold: 0 }
    );

    for (const section of sections) observer.observe(section);
    return () => observer.disconnect();
  }, []);

  /* Échap ferme le menu, Tab y reste piégé, la page ne défile plus dessus. */
  useEffect(() => {
    if (!isMenuOpen) return;

    const previousOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";

    const focusables = () =>
      Array.from(
        menuPanelRef.current?.querySelectorAll<HTMLElement>(
          "a[href], button:not([disabled])"
        ) ?? []
      );

    focusables()[0]?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setIsMenuOpen(false);
        menuButtonRef.current?.focus();
        return;
      }
      if (event.key !== "Tab") return;

      const items = focusables();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;

      if (
        event.shiftKey &&
        (active === first || !menuPanelRef.current?.contains(active))
      ) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.documentElement.style.overflow = previousOverflow;
    };
  }, [isMenuOpen]);

  const handleFocusCapture = () => {
    focusWithinRef.current = true;
    setIsVisible(true);
  };

  const handleBlurCapture = (event: React.FocusEvent<HTMLElement>) => {
    if (
      event.relatedTarget instanceof Node &&
      event.currentTarget.contains(event.relatedTarget)
    ) {
      return;
    }
    focusWithinRef.current = false;
  };

  const handleAnchorClick = () => {
    keepVisibleForAnchor();
    if (isMenuOpen) {
      setIsMenuOpen(false);
      /* Le dialogue se ferme : le focus revient sur sa commande. */
      menuButtonRef.current?.focus();
    }
  };

  if (phase !== "done") return null;

  return (
    <>
      <a
        href="#main-content"
        onFocus={handleFocusCapture}
        onBlur={handleBlurCapture}
        onClick={handleAnchorClick}
        data-cursor="hover"
        className="fixed left-4 top-3 z-[70] -translate-y-20 rounded-full bg-primary px-4 py-2 font-mono text-xs font-semibold text-on-primary shadow-glow transition-transform focus:translate-y-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        Aller au contenu
      </a>

      <motion.header
        initial={reducedMotion ? false : { opacity: 0, y: -16 }}
        animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : -120 }}
        transition={{ duration: reducedMotion ? 0 : 0.35, ease: EDITORIAL_EASE }}
        aria-hidden={!isVisible}
        className="pointer-events-none fixed inset-x-0 top-0 z-50 px-4 pt-3 sm:px-6 sm:pt-5"
      >
        <motion.div
          className="pointer-events-none absolute inset-x-0 top-0 h-0.5 origin-left bg-primary"
          style={{ scaleX: scrollYProgress }}
          aria-hidden="true"
        />
        <div
          className={`pointer-events-auto mx-auto flex max-w-7xl items-center justify-between gap-3 rounded-full transition-all duration-300 ease-editorial ${
            isScrolled
              ? "border border-accent-hair bg-[color:var(--nav-glass)] px-4 py-2 shadow-glass backdrop-blur-md"
              : "border border-transparent px-2 py-3"
          }`}
          onFocusCapture={handleFocusCapture}
          onBlurCapture={handleBlurCapture}
        >
          <Link
            href="/"
            data-cursor="hover"
            tabIndex={isVisible ? 0 : -1}
            className="group flex items-center gap-2 whitespace-nowrap font-heading text-base font-extrabold tracking-tight text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary sm:text-xl"
            aria-label="KoniG.dev — Accueil"
          >
            <div className="relative w-6 h-6 shrink-0 transition-transform duration-200 group-hover:scale-105">
              <Image
                src="/logo.png"
                alt="Logo KoniG.dev"
                fill
                sizes="24px"
                className="object-contain"
              />
            </div>
            <span>KoniG.dev</span>
          </Link>

          <nav
            aria-label="Navigation principale"
            className="hidden items-center gap-5 md:flex"
          >
            {NAV_LINKS.map((link) => {
              const isActive = activeHash === link.hash;
              return (
                <a
                  key={link.hash}
                  href={link.hash}
                  data-cursor="hover"
                  data-active={isActive ? "true" : "false"}
                  aria-current={isActive ? "true" : undefined}
                  tabIndex={isVisible ? 0 : -1}
                  onClick={handleAnchorClick}
                  className={`${NAV_LINK_CLASS}${isActive ? " text-accent" : ""}`}
                >
                  {link.label}
                </a>
              );
            })}
          </nav>

          <button
            type="button"
            ref={menuButtonRef}
            data-cursor="hover"
            tabIndex={isVisible ? 0 : -1}
            aria-expanded={isMenuOpen}
            aria-controls="konigdev-mobile-menu"
            onClick={() => setIsMenuOpen((open) => !open)}
            className={`${NAV_LINK_CLASS} md:hidden`}
          >
            {isMenuOpen ? "Fermer" : "Menu"}
          </button>
        </div>
      </motion.header>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            ref={menuPanelRef}
            id="konigdev-mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation du site"
            initial={reducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.28 }}
            className="fixed inset-0 z-[60] flex flex-col justify-center bg-[color:var(--menu-glass)] px-6 md:hidden"
          >
            <nav
              aria-label="Navigation principale mobile"
              className="flex flex-col gap-1"
            >
              {NAV_LINKS.map((link, index) => (
                <motion.a
                  key={link.hash}
                  href={link.hash}
                  data-cursor="hover"
                  onClick={handleAnchorClick}
                  initial={reducedMotion ? false : { opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={
                    reducedMotion
                      ? { duration: 0.2 }
                      : {
                          duration: 0.45,
                          delay: 0.05 + index * 0.06,
                          ease: EDITORIAL_EASE,
                        }
                  }
                  className="flex items-baseline gap-3 py-2 font-heading text-[clamp(2.25rem,12vw,3.75rem)] font-extrabold uppercase leading-[1.05] tracking-tight text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
                >
                  <span className="font-mono text-[10px] font-medium tracking-[0.12em] text-on-surface-variant">
                    0{index + 1}
                  </span>
                  {link.label}
                </motion.a>
              ))}
            </nav>

            <motion.p
              initial={reducedMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="mt-10 font-mono text-[9px] uppercase tracking-[0.18em] text-on-surface-variant"
            >
              Échap pour fermer
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
