"use client";

import React, { useState, useEffect } from "react";

interface Step {
  number: string;
  title: string;
  subtitle: string;
  summary: string;
  description: string;
  tag: string;
  icon: (props: { className?: string }) => React.JSX.Element;
}

const steps: Step[] = [
  {
    number: "01",
    title: "Ã‰change & Cadrage",
    subtitle: "Comprendre votre besoin rÃ©el",
    summary: "Audit technique & objectifs",
    description:
      "Nous Ã©changeons sur vos objectifs prÃ©cis, vos utilisateurs cibles et vos contraintes techniques. Aucun devis n'est Ã©mis sans avoir clarifiÃ© le pÃ©rimÃ¨tre exact de la mission.",
    tag: "Phase initiale",
    icon: ({ className = "w-5 h-5" }) => (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
  },
  {
    number: "02",
    title: "Devis & Engagement",
    subtitle: "Un tarif clair, sans frais cachÃ©s",
    summary: "Calendrier ferme & livrables",
    description:
      "Vous recevez une proposition transparente dÃ©taillÃ©e avec un calendrier d'exÃ©cution ferme. Nous validons ensemble les livrables prÃ©cis avant d'engager le dÃ©veloppement.",
    tag: "Validation",
    icon: ({ className = "w-5 h-5" }) => (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    number: "03",
    title: "DÃ©veloppement ItÃ©ratif",
    subtitle: "Des points d'Ã©tape rÃ©guliers",
    summary: "Sprints courts & dÃ©mos en direct",
    description:
      "Je construis votre outil par blocs fonctionnels. Vous suivez l'avancement via des accÃ¨s de test intermÃ©diaires et validez chaque module au fil de l'eau.",
    tag: "Construction",
    icon: ({ className = "w-5 h-5" }) => (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    ),
  },
  {
    number: "04",
    title: "Livraison & Autonomie",
    subtitle: "Mise en ligne et prise en main",
    summary: "DÃ©ploiement & passation complÃ¨te",
    description:
      "DÃ©ploiement en production, tests finaux de charge et sÃ©curitÃ©, puis transfert de compÃ©tences complet. Vous restez 100% propriÃ©taire de vos donnÃ©es et de votre code.",
    tag: "Mise en ligne",
    icon: ({ className = "w-5 h-5" }) => (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    ),
  },
];

export default function Method() {
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [isRotating, setIsRotating] = useState(true);

  // Changement automatique de l'Ã©tape active toutes les 9 secondes si rotation activÃ©e
  useEffect(() => {
    if (!isRotating) return;
    const interval = setInterval(() => {
      setActiveStepIndex((prev) => (prev + 1) % steps.length);
    }, 9500);
    return () => clearInterval(interval);
  }, [isRotating]);

  const activeStep = steps[activeStepIndex];

  return (
    <section
      id="methode"
      className="w-full py-20 sm:py-32 bg-surface-card border-y border-black/5 relative overflow-hidden"
    >
      {/* Halo d'ambiance discret */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-ink/5 rounded-full blur-3xl pointer-events-none -z-0" />

      <div className="w-full max-w-7xl mx-auto px-6 sm:px-10 relative z-10">
        {/* EntÃªte */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-12 border-b border-black/10">
          <div>
            <span className="section-label">{"[ 02 // PROCESSUS CIRCULAIRE ]"}</span>
            <h2 className="section-title">
              Ma mÃ©thode de travail <br />
              <span className="font-sans font-normal text-ink-light">
                Un cycle continu en 4 Ã©tapes.
              </span>
            </h2>
          </div>
          <div className="flex flex-col items-start md:items-end gap-3">
            <p className="font-sans text-ink-muted text-sm sm:text-base max-w-md md:text-right">
              Un flux rotatif prÃ©visible, de la premiÃ¨re Ã©tincelle jusqu&apos;Ã  l&apos;autonomie totale.
            </p>
            {/* ContrÃ´le Play / Pause de la rotation */}
            <div className="flex items-center gap-3 bg-surface px-3 py-1.5 rounded-full border border-black/5 shadow-xs">
              <span className="inline-flex items-center gap-1.5 font-mono text-xs text-ink-muted">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isRotating ? "bg-ink animate-pulse" : "bg-black/30"
                  }`}
                />
                Rotation {isRotating ? "active" : "en pause"}
              </span>
              <button
                type="button"
                onClick={() => setIsRotating(!isRotating)}
                className="text-xs font-mono font-semibold px-2 py-0.5 rounded-md bg-ink text-white hover:bg-black transition-colors"
                title={isRotating ? "Mettre la rotation en pause" : "Relancer la rotation"}
              >
                {isRotating ? "Pause" : "Play"}
              </button>
            </div>
          </div>
        </div>

        {/* â”€â”€â”€ CERCLE ORBITAL (GRAND Ã‰CRAN / TABLETTE) â”€â”€â”€ */}
        <div className={`mt-16 relative flex items-center justify-center orbit-container ${!isRotating ? "orbit-paused" : ""}`}>
          {/* Zone du cercle orbital */}
          <div className="relative w-[340px] h-[340px] sm:w-[500px] sm:h-[500px] lg:w-[620px] lg:h-[620px] flex items-center justify-center">
            
            {/* Anneau SVG de fond avec points et flÃ¨che de rotation */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              viewBox="0 0 620 620"
              fill="none"
            >
              {/* Grand anneau externe discret */}
              <circle
                cx="310"
                cy="310"
                r="260"
                stroke="currentColor"
                className="text-black/5"
                strokeWidth="1.5"
                strokeDasharray="6 6"
              />
              {/* DeuxiÃ¨me anneau fin */}
              <circle
                cx="310"
                cy="310"
                r="190"
                stroke="currentColor"
                className="text-black/5"
                strokeWidth="1"
              />
              {/* Anneau d'accentuation nÃ©on */}
              <circle
                cx="310"
                cy="310"
                r="260"
                stroke="#0B0B0F"
                strokeWidth="2"
                strokeDasharray="40 280"
                className="opacity-60"
              />
            </svg>

            {/* â”€â”€â”€ L'ANNEAU QUI TOURNE â”€â”€â”€ */}
            <div className="absolute inset-0 animate-orbit">
              
              {/* Ã‰tape 01 â€” Haut (Nord, 0Â°) */}
              <div
                className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                onClick={() => {
                  setActiveStepIndex(0);
                  setIsRotating(false);
                }}
              >
                <div className="animate-orbit-counter">
                  <div
                    className={`p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl border transition-all duration-300 flex items-center gap-3 backdrop-blur-md bg-surface ${
                      activeStepIndex === 0
                        ? "border-ink shadow-soft scale-105"
                        : "border-black/10 shadow-soft hover:border-black/30 hover:scale-102"
                    }`}
                  >
                    <span className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-ink text-ink flex items-center justify-center font-mono font-bold text-xs sm:text-sm shadow-xs shrink-0">
                      01
                    </span>
                    <div className="text-left pr-2">
                      <p className="font-mono text-[10px] text-ink-muted uppercase">Ã‰tape 01</p>
                      <h4 className="font-sans font-bold text-xs sm:text-sm text-ink whitespace-nowrap">
                        Ã‰change & Cadrage
                      </h4>
                    </div>
                  </div>
                </div>
              </div>

              {/* Ã‰tape 02 â€” Droite (Est, 90Â°) */}
              <div
                className="absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                onClick={() => {
                  setActiveStepIndex(1);
                  setIsRotating(false);
                }}
              >
                <div className="animate-orbit-counter">
                  <div
                    className={`p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl border transition-all duration-300 flex items-center gap-3 backdrop-blur-md bg-surface ${
                      activeStepIndex === 1
                        ? "border-ink shadow-soft scale-105"
                        : "border-black/10 shadow-soft hover:border-black/30 hover:scale-102"
                    }`}
                  >
                    <span className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-ink text-ink flex items-center justify-center font-mono font-bold text-xs sm:text-sm shadow-xs shrink-0">
                      02
                    </span>
                    <div className="text-left pr-2">
                      <p className="font-mono text-[10px] text-ink-muted uppercase">Ã‰tape 02</p>
                      <h4 className="font-sans font-bold text-xs sm:text-sm text-ink whitespace-nowrap">
                        Devis & Engagement
                      </h4>
                    </div>
                  </div>
                </div>
              </div>

              {/* Ã‰tape 03 â€” Bas (Sud, 180Â°) */}
              <div
                className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 cursor-pointer group"
                onClick={() => {
                  setActiveStepIndex(2);
                  setIsRotating(false);
                }}
              >
                <div className="animate-orbit-counter">
                  <div
                    className={`p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl border transition-all duration-300 flex items-center gap-3 backdrop-blur-md bg-surface ${
                      activeStepIndex === 2
                        ? "border-ink shadow-soft scale-105"
                        : "border-black/10 shadow-soft hover:border-black/30 hover:scale-102"
                    }`}
                  >
                    <span className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-ink text-ink flex items-center justify-center font-mono font-bold text-xs sm:text-sm shadow-xs shrink-0">
                      03
                    </span>
                    <div className="text-left pr-2">
                      <p className="font-mono text-[10px] text-ink-muted uppercase">Ã‰tape 03</p>
                      <h4 className="font-sans font-bold text-xs sm:text-sm text-ink whitespace-nowrap">
                        DÃ©v. ItÃ©ratif
                      </h4>
                    </div>
                  </div>
                </div>
              </div>

              {/* Ã‰tape 04 â€” Gauche (Ouest, 270Â°) */}
              <div
                className="absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                onClick={() => {
                  setActiveStepIndex(3);
                  setIsRotating(false);
                }}
              >
                <div className="animate-orbit-counter">
                  <div
                    className={`p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl border transition-all duration-300 flex items-center gap-3 backdrop-blur-md bg-surface ${
                      activeStepIndex === 3
                        ? "border-ink shadow-soft scale-105"
                        : "border-black/10 shadow-soft hover:border-black/30 hover:scale-102"
                    }`}
                  >
                    <span className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-ink text-ink flex items-center justify-center font-mono font-bold text-xs sm:text-sm shadow-xs shrink-0">
                      04
                    </span>
                    <div className="text-left pr-2">
                      <p className="font-mono text-[10px] text-ink-muted uppercase">Ã‰tape 04</p>
                      <h4 className="font-sans font-bold text-xs sm:text-sm text-ink whitespace-nowrap">
                        Livraison & Suivi
                      </h4>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* â”€â”€â”€ HUB CENTRAL / CÅ’UR DU CERCLE (FICHE DÃ‰TAILLÃ‰E ACTIVE) â”€â”€â”€ */}
            <div className="relative z-20 w-[240px] sm:w-[320px] lg:w-[360px] p-6 sm:p-8 rounded-3xl bg-surface border border-black/10 shadow-float text-center flex flex-col items-center justify-between transition-all duration-500">
              {/* Badge d'Ã©tape */}
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2.5 py-1 rounded-full bg-ink text-white font-mono text-[11px] font-bold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-ink animate-pulse" />
                  {`${activeStep.number} / 04`}
                </span>
                <span className="font-mono text-[11px] text-ink-muted font-medium">
                  {activeStep.tag}
                </span>
              </div>

              {/* Titre & Description */}
              <h3 className="font-sans font-extrabold text-lg sm:text-xl text-ink">
                {activeStep.title}
              </h3>
              <p className="mt-1 font-mono text-xs text-ink-dark font-medium text-ink-light">
                {activeStep.subtitle}
              </p>

              <p className="mt-4 font-sans text-xs sm:text-sm text-ink-muted leading-relaxed line-clamp-4">
                {activeStep.description}
              </p>

              {/* RÃ©sumÃ© d'action */}
              <div className="mt-5 w-full pt-4 border-t border-black/5 flex items-center justify-between text-left">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-ink" />
                  <span className="font-mono text-[11px] text-ink font-semibold">
                    {activeStep.summary}
                  </span>
                </div>
                {/* IcÃ´ne de l'Ã©tape */}
                <div className="text-ink">
                  <activeStep.icon className="w-5 h-5 text-ink-light" />
                </div>
              </div>

              {/* Mini navigation circulaire */}
              <div className="mt-5 flex items-center gap-1.5">
                {steps.map((s, idx) => (
                  <button
                    key={s.number}
                    type="button"
                    onClick={() => {
                      setActiveStepIndex(idx);
                      setIsRotating(false);
                    }}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      activeStepIndex === idx
                        ? "w-7 bg-ink"
                        : "w-2 bg-black/15 hover:bg-black/30"
                    }`}
                    title={`Aller Ã  l'Ã©tape ${s.number}`}
                  />
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* â”€â”€â”€ BANDEAU RÃ‰CAPITULATIF AU BAS â”€â”€â”€ */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4">
          {steps.map((step, idx) => {
            const isSelected = activeStepIndex === idx;
            return (
              <button
                key={step.number}
                type="button"
                onClick={() => {
                  setActiveStepIndex(idx);
                  setIsRotating(false);
                }}
                className={`text-left p-4 sm:p-5 rounded-2xl border transition-all duration-300 ${
                  isSelected
                    ? "bg-ink text-white border-ink shadow-soft scale-102"
                    : "bg-surface text-ink border-black/5 hover:border-black/20"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`font-mono text-xs font-bold ${
                      isSelected ? "text-ink" : "text-ink-muted"
                    }`}
                  >
                    {step.number}
                  </span>
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isSelected ? "bg-ink" : "bg-black/20"
                    }`}
                  />
                </div>
                <h4 className="font-sans font-bold text-xs sm:text-sm">
                  {step.title}
                </h4>
                <p
                  className={`mt-1 font-sans text-[11px] line-clamp-1 ${
                    isSelected ? "text-white/70" : "text-ink-muted"
                  }`}
                >
                  {step.summary}
                </p>
              </button>
            );
          })}
        </div>

      </div>
    </section>
  );
}

