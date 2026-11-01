"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import ProjectCard from "./ProjectCard";
import ProjectPanel from "./ProjectPanel";
import { Project, PROJECTS } from "@/lib/projects-data";

interface ProjectBoxProps {
  initialProjects?: Project[];
}

export default function ProjectBox({ initialProjects = PROJECTS }: ProjectBoxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [isMobileScreen, setIsMobileScreen] = useState(false);
  const [isTabletScreen, setIsTabletScreen] = useState(false);

  const closeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const boxButtonRef = useRef<HTMLButtonElement>(null);
  const lastClickedCardRef = useRef<HTMLButtonElement | null>(null);
  const hitAreaRef = useRef<HTMLDivElement>(null);

  // Détection tactile et responsive
  useEffect(() => {
    const checkCapabilities = () => {
      const touch =
        "ontouchstart" in window ||
        navigator.maxTouchPoints > 0 ||
        window.matchMedia("(pointer: coarse)").matches;
      setIsTouchDevice(touch);
      setIsMobileScreen(window.innerWidth < 480);
      setIsTabletScreen(window.innerWidth < 900 && window.innerWidth >= 480);
    };

    checkCapabilities();
    window.addEventListener("resize", checkCapabilities);
    return () => window.removeEventListener("resize", checkCapabilities);
  }, []);

  // Annule le timer de fermeture s'il existe
  const clearCloseTimer = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  // Ouverture via la zone invisible (hit area)
  const handleMouseEnter = () => {
    if (isTouchDevice) return;
    clearCloseTimer();
    setIsOpen(true);
  };

  // Fermeture après 400ms après sortie du pointeur
  const handleMouseLeave = () => {
    if (isTouchDevice) return;
    clearCloseTimer();

    // Ne pas fermer si le panneau est ouvert
    if (activeProject) return;

    closeTimerRef.current = setTimeout(() => {
      // Vérifier si le focus n'est pas à l'intérieur de la boîte
      const activeEl = document.activeElement;
      if (hitAreaRef.current && hitAreaRef.current.contains(activeEl)) {
        return;
      }
      setIsOpen(false);
    }, 400);
  };

  // Toggle au clic / toucher
  const handleBoxClick = () => {
    clearCloseTimer();
    setIsOpen((prev) => !prev);
  };

  // Clavier pour la boîte
  const handleBoxKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setIsOpen((prev) => !prev);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setIsOpen(false);
      setActiveProject(null);
    }
  };

  // Clic sur une carte
  const handleCardClick = (project: Project, e: React.MouseEvent<HTMLButtonElement>) => {
    lastClickedCardRef.current = e.currentTarget;
    setActiveProject(project);
    setIsOpen(true);
  };

  // Fermeture du panneau
  const handleClosePanel = useCallback(() => {
    setActiveProject(null);
    // Rendre le focus à la carte cliquée
    if (lastClickedCardRef.current) {
      lastClickedCardRef.current.focus();
    } else {
      boxButtonRef.current?.focus();
    }
  }, []);

  const totalCards = initialProjects.length;
  const middleIndex = (totalCards - 1) / 2;

  return (
    <div className="relative w-full flex flex-col items-center">
      {/* Panneau de gauche */}
      <ProjectPanel
        project={activeProject}
        onClose={handleClosePanel}
        onSelectProject={(proj) => setActiveProject(proj)}
        projects={initialProjects}
      />

      {/* Conteneur global centré avec décalage de +210px sur grand écran (>= 1100px) quand le panneau est ouvert */}
      <div
        className={`w-full flex flex-col items-center justify-center transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
          activeProject ? "xl:translate-x-[210px]" : "translate-x-0"
        }`}
      >
        {/* Zone invisible (Hit Area) : s'étend d'environ 200px au-dessus de la boîte, largeur ~700px */}
        <div
          ref={hitAreaRef}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className="relative w-full max-w-[720px] pt-[200px] pb-10 flex flex-col items-center justify-center select-none"
        >
          {/* Conteneur 3D de la boîte avec perspective */}
          <div
            className="relative flex flex-col items-center"
            style={{ perspective: "1200px" }}
          >
            {/* Bouton accessible représentant la boîte */}
            <button
              ref={boxButtonRef}
              type="button"
              onClick={handleBoxClick}
              onKeyDown={handleBoxKeyDown}
              aria-expanded={isOpen}
              aria-label="Ouvrir la boîte des réalisations"
              className="relative group focus:outline-none focus-visible:ring-4 focus-visible:ring-[#22252A]/20 rounded-[28px]"
            >
              {/* CARTES DE PROJET EN ÉVENTAIL (z-20, au-dessus du rabat arrière mais derrière la face avant) */}
              {!isMobileScreen && (
                <div
                  className="absolute left-1/2 bottom-[140px] -translate-x-1/2 z-20 pointer-events-none"
                  aria-hidden={!isOpen}
                >
                  {initialProjects.map((project, i) => {
                    const offset = i - middleIndex;
                    // Échelle et espacements selon taille d'écran
                    const stepX = isTabletScreen ? 82 : 110;
                    const targetX = offset * stepX;
                    const targetY = -(190 + Math.abs(offset) * 14);
                    const targetRotate = offset * 7;

                    // Délais d'ouverture et de fermeture
                    const openDelay = 200 + i * 90;
                    const closeDelay = (totalCards - 1 - i) * 60;

                    const transformStyle = isOpen
                      ? `translate3d(${targetX}px, ${targetY}px, 0) rotate(${targetRotate}deg)`
                      : "translate3d(0, 40px, 0) scale(0.85) rotate(0deg)";

                    return (
                      <div
                        key={project.slug}
                        className="absolute left-1/2 top-0 -translate-x-1/2 transition-all motion-reduce:transition-none"
                        style={{
                          transform: transformStyle,
                          opacity: isOpen ? 1 : 0,
                          pointerEvents: isOpen ? "auto" : "none",
                          transitionProperty: "transform, opacity",
                          transitionDuration: isOpen ? "700ms" : "400ms",
                          transitionTimingFunction: isOpen
                            ? "cubic-bezier(0.34, 1.56, 0.64, 1)"
                            : "ease-in",
                          transitionDelay: isOpen
                            ? `${openDelay}ms`
                            : `${closeDelay}ms`,
                          zIndex: 20 + i,
                        }}
                      >
                        <ProjectCard
                          project={project}
                          onClick={(e) => handleCardClick(project, e)}
                          tabIndex={isOpen ? 0 : -1}
                          ariaHidden={!isOpen}
                          isActive={activeProject?.slug === project.slug}
                        />
                      </div>
                    );
                  })}
                </div>
              )}

              {/* STRUCTURE DE LA BOÎTE EN CARTON (CSS PUR) */}
              <div className="relative w-[280px] sm:w-[360px] h-[190px] sm:h-[220px]">
                {/* 1. RABAT ARRIÈRE (z-10, trapèze plus sombre) */}
                <div
                  className="absolute -top-[52px] left-[15px] sm:left-[20px] right-[15px] sm:right-[20px] h-[54px] z-10 transition-transform duration-500 ease-out origin-bottom motion-reduce:transition-none"
                  style={{
                    backgroundColor: "#D5DAE1",
                    clipPath: "polygon(6% 0%, 94% 0%, 100% 100%, 0% 100%)",
                    transform: isOpen
                      ? "rotateX(-12deg) translateY(-2px)"
                      : "rotateX(0deg)",
                  }}
                  aria-hidden="true"
                />

                {/* 2. FOND INTÉRIEUR CREUSÉ (z-15, donne la profondeur du carton) */}
                <div
                  className="absolute inset-x-2 sm:inset-x-3 top-0 h-[70px] z-15 rounded-t-xl bg-[#CBD2DC] shadow-[inset_0_12px_24px_rgba(100,110,125,0.30)]"
                  aria-hidden="true"
                />

                {/* 3. FACE AVANT DU CORPS DE LA BOÎTE (z-30) */}
                <div
                  className="absolute inset-0 z-30 rounded-b-[28px] bg-gradient-to-b from-[#F4F7FA] via-[#EDF2F7] to-[#E4E9EF] border-x border-b border-[#D5DAE1] shadow-[0_20px_45px_rgba(120,130,145,0.22)] flex flex-col justify-between p-5 sm:p-6 overflow-hidden"
                  aria-hidden="true"
                >
                  {/* Ruban charbon très fin sur le haut de la face avant */}
                  <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#22252A]" />

                  {/* Liseré supérieur doux */}
                  <div className="w-full flex items-center justify-between text-[#8E99A8] pt-1">
                    <span className="font-mono text-[9px] uppercase tracking-wider">
                      REF-KG.24
                    </span>
                    <span className="font-mono text-[9px] uppercase tracking-wider">
                      BOX-DEV
                    </span>
                  </div>

                  {/* Étiquette "Mes projets" au centre */}
                  <div className="flex flex-col items-center justify-center my-auto">
                    <div className="px-3.5 py-1.5 rounded-xl bg-white/90 border border-white font-text text-[11px] font-semibold text-[#6B7480] shadow-[2px_2px_6px_rgba(120,130,145,0.12),-2px_-2px_6px_rgba(255,255,255,0.9)] flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#22252A]" />
                      <span>Mes projets</span>
                    </div>
                  </div>

                  {/* Bas de la boîte */}
                  <div className="w-full flex items-center justify-between border-t border-[#DDE3EA] pt-2">
                    <span className="font-display font-extrabold text-[11px] text-[#22252A] tracking-wider">
                      konig<span className="text-[#3A3F46]">.</span>box
                    </span>
                    <span className="font-mono text-[10px] text-[#6B7480]">
                      {totalCards} projets
                    </span>
                  </div>
                </div>

                {/* 4. RABATS SUPÉRIEURS (z-40) */}
                {/* Rabat latéral gauche : pivote vers l'extérieur et le haut (~25° au-dessus de l'horizontale) */}
                <div
                  className="absolute -top-[42px] -left-[14px] sm:-left-[18px] w-[50px] sm:w-[62px] h-[52px] sm:h-[64px] z-40 transition-transform duration-500 ease-out origin-bottom-left motion-reduce:transition-none"
                  style={{
                    backgroundColor: "#F7F9FB",
                    border: "1px solid #E2E6EC",
                    borderRadius: "6px 14px 4px 6px",
                    transform: isOpen
                      ? "rotateZ(-115deg) translateY(-4px)"
                      : "rotateZ(0deg)",
                  }}
                  aria-hidden="true"
                />

                {/* Rabat latéral droit : pivote vers l'extérieur et le haut (~25° au-dessus de l'horizontale) */}
                <div
                  className="absolute -top-[42px] -right-[14px] sm:-right-[18px] w-[50px] sm:w-[62px] h-[52px] sm:h-[64px] z-40 transition-transform duration-500 ease-out origin-bottom-right motion-reduce:transition-none"
                  style={{
                    backgroundColor: "#F7F9FB",
                    border: "1px solid #E2E6EC",
                    borderRadius: "14px 6px 6px 4px",
                    transform: isOpen
                      ? "rotateZ(115deg) translateY(-4px)"
                      : "rotateZ(0deg)",
                  }}
                  aria-hidden="true"
                />

                {/* Rabat avant : s'incline vers l'avant (rotateX d'environ 18°) */}
                <div
                  className="absolute -top-[38px] left-[20px] sm:left-[26px] right-[20px] sm:right-[26px] h-[40px] z-40 transition-transform duration-500 ease-out origin-bottom motion-reduce:transition-none"
                  style={{
                    backgroundColor: "#F7F9FB",
                    borderTop: "1px solid #E2E6EC",
                    borderLeft: "1px solid #E2E6EC",
                    borderRight: "1px solid #E2E6EC",
                    clipPath: "polygon(5% 0%, 95% 0%, 100% 100%, 0% 100%)",
                    transform: isOpen ? "rotateX(18deg) scaleY(0.95)" : "rotateX(0deg)",
                  }}
                  aria-hidden="true"
                />
              </div>

              {/* Ombre portée diffuse sous la boîte */}
              <div
                className="w-[240px] sm:w-[310px] h-[22px] rounded-[50%] bg-[#788291]/25 blur-md mx-auto -mt-2 transition-all duration-500"
                style={{
                  transform: isOpen ? "scale(1.08)" : "scale(1)",
                  opacity: isOpen ? 0.35 : 0.25,
                }}
                aria-hidden="true"
              />
            </button>

            {/* Phrase d'aide sous la boîte (disparaît quand la boîte est ouverte) */}
            <div
              className={`mt-4 text-center transition-opacity duration-300 ${
                isOpen ? "opacity-0 pointer-events-none" : "opacity-100"
              }`}
            >
              <p className="font-text text-xs text-[#6B7480]">
                {isTouchDevice ? "Touchez la boîte" : "Passez la souris sur la boîte"}
              </p>
            </div>
          </div>

          {/* AFFICHAGE MOBILE (< 480px) : Liste verticale défilante sous la boîte ouverte */}
          {isMobileScreen && isOpen && (
            <div className="w-full max-w-[340px] mt-6 flex flex-col gap-2.5 z-20 animate-fadeIn">
              <span className="block font-mono text-[10px] uppercase tracking-wider text-[#6B7480] text-center mb-1">
                Sélectionnez un projet à consulter
              </span>
              {initialProjects.map((project) => (
                <ProjectCard
                  key={project.slug}
                  project={project}
                  onClick={(e) => handleCardClick(project, e)}
                  compactList={true}
                  isActive={activeProject?.slug === project.slug}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

