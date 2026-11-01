"use client";

import React, { useState } from "react";
import Link from "next/link";
import { SERVICE_OFFERS } from "@/lib/services-data";
import {
  AutomationIcon,
  WebPresenceIcon,
  CustomAppsIcon,
  DesignIcon,
} from "./ServiceIcons";

function getOfferIcon(id: string) {
  switch (id) {
    case "automatisation-ia":
      return <AutomationIcon className="w-5 h-5" />;
    case "presence-en-ligne":
      return <WebPresenceIcon className="w-5 h-5" />;
    case "applications-sur-mesure":
      return <CustomAppsIcon className="w-5 h-5" />;
    case "design":
      return <DesignIcon className="w-5 h-5" />;
    default:
      return <AutomationIcon className="w-5 h-5" />;
  }
}

export default function ServiceStack() {
  // isDeployed: false = État 1 (pastilles d'intro), true = État 2 (pile déployée)
  const [isDeployed, setIsDeployed] = useState<boolean>(false);
  const [activeOfferId, setActiveOfferId] = useState<string>("automatisation-ia");

  return (
    <div
      className="relative w-full min-h-[720px] rounded-[28px] bg-[#EEF2F7] border border-white/80 p-6 sm:p-12 flex flex-col justify-between overflow-hidden shadow-inset-field"
      aria-label="Présentation interactive des offres de services"
    >
      {/* ==================================================================
          QUATRE TEXTES DANS LES COINS DU CADRE (~20px, #6B7480, opacité .8)
          ================================================================== */}
      <div className="w-full flex items-center justify-between text-[#6B7480] opacity-80 font-display font-bold text-lg sm:text-xl select-none">
        <span>Services</span>
        <span>Konigdev</span>
      </div>

      {/* ==================================================================
          ZONE CENTRALE : SOIT ÉTAT 1 (INTRO), SOIT ÉTAT 2 (LA PILE)
          ================================================================== */}
      <div className="relative my-auto py-10 w-full flex items-center justify-center">
        {!isDeployed ? (
          /* ==============================================================
             ÉTAT 1 : INTRODUCTION AU CHARGEMENT
             Deux pastilles sombres côte à côte avec un bouton central rond "Voir"
             ============================================================== */
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 relative animate-fade-slide-up motion-reduce:transform-none">
            {/* Pastille gauche : Mon besoin */}
            <div className="w-[220px] sm:w-[200px] h-[56px] rounded-full bg-[#14161A] border border-white/12 px-5 flex flex-col justify-center text-left text-[#E6E9ED] shadow-md select-none transition-transform duration-500">
              <span className="font-text text-[10px] text-[#AEB4BC] uppercase tracking-wider">
                Mon besoin
              </span>
              <span className="font-text text-[13px] font-medium leading-tight truncate">
                Site, application, IA ou design
              </span>
            </div>

            {/* Bouton central rond "Voir" */}
            <button
              type="button"
              onClick={() => setIsDeployed(true)}
              className="z-10 w-12 h-12 rounded-full bg-gradient-to-br from-[#3A3F46] to-[#14161A] text-white font-text text-xs font-bold uppercase tracking-wider shadow-btn-submit border border-white/15 flex items-center justify-center hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#22252A] focus-visible:outline-offset-2"
              aria-label="Voir la pile des 4 offres de services"
            >
              Voir
            </button>

            {/* Pastille droite : Mon budget */}
            <div className="w-[220px] sm:w-[200px] h-[56px] rounded-full bg-[#14161A] border border-white/12 px-5 flex flex-col justify-center text-left text-[#E6E9ED] shadow-md select-none transition-transform duration-500">
              <span className="font-text text-[10px] text-[#AEB4BC] uppercase tracking-wider">
                Mon budget
              </span>
              <span className="font-text text-[13px] font-medium leading-tight">
                À partir de 15 000 FCFA
              </span>
            </div>
          </div>
        ) : (
          /* ==============================================================
             ÉTAT 2 : LA PILE DE 4 CARTES SOMBRES
             Ordre fixe : Automatisation et IA, Présence en ligne, Applications, Design.
             Une seule carte ouverte, les autres réduites en pastilles de 44px.
             ============================================================== */
          <div className="w-full max-w-[700px] flex flex-col gap-3 transition-all duration-700 ease-in-out">
            {SERVICE_OFFERS.map((offer) => {
              const isOpen = activeOfferId === offer.id;

              if (isOpen) {
                // CARTE OUVERTE
                return (
                  <div
                    key={offer.id}
                    className="w-full rounded-[24px] bg-[#14161A] border border-white/12 p-6 sm:p-8 text-[#E6E9ED] shadow-2xl transition-all duration-500 ease-out"
                    role="region"
                    aria-label={`Détails de l'offre ${offer.title}`}
                  >
                    {/* En-tête de la carte */}
                    <div className="flex items-start justify-between gap-4 pb-5 border-b border-white/10">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#22252A] border border-white/10 flex items-center justify-center text-[#E6E9ED] shrink-0">
                          {getOfferIcon(offer.id)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs text-[#AEB4BC]">
                              0{offer.order}
                            </span>
                            <span className="h-2.5 w-px bg-white/20" />
                            <h3 className="font-display font-extrabold text-xl sm:text-2xl text-white tracking-tight">
                              {offer.title}
                            </h3>
                          </div>
                          <p className="font-text text-xs text-[#AEB4BC] mt-0.5">
                            {offer.tagline}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="inline-block font-text text-xs font-semibold text-white bg-[#22252A] px-3 py-1 rounded-full border border-white/10">
                          {offer.priceStartingAt}
                        </span>
                        <p className="font-mono text-[10px] text-[#AEB4BC] mt-1">
                          Délai : {offer.typicalDuration}
                        </p>
                      </div>
                    </div>

                    {/* Corps de la carte : description & livrables */}
                    <div className="py-5">
                      <p className="font-text text-sm text-[#E6E9ED] leading-relaxed mb-5">
                        {offer.description}
                      </p>

                      <div className="space-y-2.5 mb-6">
                        <span className="font-text text-xs font-semibold text-white uppercase tracking-wider block">
                          Ce qui est inclus :
                        </span>
                        <ul className="space-y-2">
                          {offer.deliverables.map((item, idx) => (
                            <li
                              key={idx}
                              className="font-text text-xs text-[#AEB4BC] flex items-start gap-2.5"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-white shrink-0 mt-1.5" />
                              <span className="leading-relaxed">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Technologies */}
                      <div className="flex flex-wrap gap-1.5 pt-4 border-t border-white/10">
                        {offer.technologies.map((tech) => (
                          <span
                            key={tech}
                            className="font-mono text-[10px] text-[#AEB4BC] bg-[#22252A] px-2.5 py-1 rounded-md border border-white/5"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Actions au bas de la carte */}
                    <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
                      <span className="font-text text-xs text-[#AEB4BC]">
                        Échange initial gratuit de 20 minutes
                      </span>
                      <Link
                        href={`/contact?service=${encodeURIComponent(offer.title)}`}
                        className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#3A3F46] to-[#22252A] hover:from-[#444A52] hover:to-[#2B2F36] text-white font-text text-xs font-bold uppercase tracking-wider shadow-md transition-all duration-200 hover:-translate-y-0.5"
                      >
                        Demander un devis
                      </Link>
                    </div>
                  </div>
                );
              }

              // CARTE FERMÉE : RÉDUITE EN PASTILLE SOMBRE (44px)
              return (
                <button
                  key={offer.id}
                  type="button"
                  onClick={() => setActiveOfferId(offer.id)}
                  className="w-full h-[44px] rounded-full bg-[#14161A] hover:bg-[#1E2229] border border-white/12 px-5 sm:px-6 flex items-center justify-between text-[#E6E9ED] text-left transition-all duration-300 cursor-pointer shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#22252A] focus-visible:outline-offset-2"
                  aria-expanded="false"
                  aria-label={`Ouvrir les détails de l'offre ${offer.title}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-[#AEB4BC]">
                      0{offer.order}
                    </span>
                    <span className="font-text text-xs sm:text-sm font-semibold tracking-wide text-white">
                      {offer.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[11px] text-[#AEB4BC] hidden sm:inline">
                      {offer.priceStartingAt}
                    </span>
                    {/* Flèche d'ouverture vers le bas SVG fait main */}
                    <svg
                      className="w-4 h-4 text-[#AEB4BC]"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ==================================================================
          BAS DU CADRE : VILLE ET TEXTE DESCRIPTIF (2 lignes)
          ================================================================== */}
      <div className="w-full flex flex-col sm:flex-row sm:items-end justify-between gap-4 text-[#6B7480] opacity-80 font-text text-xs sm:text-sm select-none">
        <span className="font-display font-bold text-lg sm:text-xl">
          Brazzaville
        </span>
        <p className="sm:text-right max-w-[280px] leading-snug">
          Quatre façons de travailler ensemble,
          <br />
          du site à l&apos;automatisation IA.
        </p>
      </div>
    </div>
  );
}

