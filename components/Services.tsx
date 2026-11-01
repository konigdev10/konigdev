"use client";

import React, { useState } from "react";
import Link from "next/link";
import GlassFolder, { FolderFile } from "@/components/GlassFolder";

const FOLDER_SERVICES: Array<{
  id: string;
  label: string;
  meta: string;
  art: "ember" | "glacier" | "dusk" | "verdant";
  seed: number;
  files: FolderFile[];
}> = [
  {
    id: "automatisation-ia",
    label: "Automatisation & IA",
    meta: "3 prestations clés",
    art: "ember",
    seed: 14,
    files: [
      {
        name: "Agents autonomes & RAG",
        meta: "Mistral · OpenAI · Documentation",
        art: "ember",
        href: "/services",
      },
      {
        name: "Flux opérationnels n8n",
        meta: "Sheets · Notion · Airtable",
        href: "/services",
      },
      {
        name: "Connexions API & Webhooks",
        meta: "Python · Sécurité & Automatismes",
        href: "/services",
      },
    ],
  },
  {
    id: "presence-en-ligne",
    label: "Présence en ligne",
    meta: "3 prestations clés",
    art: "glacier",
    seed: 28,
    files: [
      {
        name: "Site vitrine sur mesure",
        meta: "Next.js 14 · Chargement instantané",
        art: "glacier",
        href: "/services",
      },
      {
        name: "Prise de contact directe",
        meta: "Formulaire relié à WhatsApp",
        href: "/services",
      },
      {
        name: "Référencement & Vitesse",
        meta: "Score Core Web Vitals optimal",
        href: "/services",
      },
    ],
  },
  {
    id: "applications-sur-mesure",
    label: "Applications sur mesure",
    meta: "3 prestations clés",
    art: "dusk",
    seed: 56,
    files: [
      {
        name: "Portails SaaS & Métier",
        meta: "Next.js · Supabase · PostgreSQL",
        art: "dusk",
        href: "/services",
      },
      {
        name: "Applications mobiles",
        meta: "Flutter · Android & iOS",
        href: "/services",
      },
      {
        name: "Bases relationnelles & Auth",
        meta: "Gestion avancée des rôles",
        href: "/services",
      },
    ],
  },
  {
    id: "design-ui-ux",
    label: "Design UI & Ergonomie",
    meta: "3 prestations clés",
    art: "verdant",
    seed: 92,
    files: [
      {
        name: "Maquettes interactives Figma",
        meta: "Prototypes cliquables avant dev",
        art: "verdant",
        href: "/services",
      },
      {
        name: "Design Systems modulaires",
        meta: "Tokens · Typographie · UI Kit",
        href: "/services",
      },
      {
        name: "Supports numériques",
        meta: "Identité & Invitations web",
        href: "/services",
      },
    ],
  },
];

// Doubler la liste pour un défilement infini fluide sans coupure
const MARQUEE_SERVICES = [...FOLDER_SERVICES, ...FOLDER_SERVICES];

export default function Services() {
  const [activeOpenId, setActiveOpenId] = useState<string | null>(null);
  const isPaused = Boolean(activeOpenId);

  return (
    <section
      id="services"
      className="relative w-full py-16 sm:py-24 px-0 bg-gradient-to-b from-[#EEF2F7] via-[#F5F8FC] to-[#EEF2F7] border-t border-[rgba(34,37,42,0.06)] text-[#22252A] scroll-mt-20 overflow-hidden"
      aria-label="Services et expertises proposés par Konigdev"
    >
      {/* Halos doux en arrière-plan */}
      <div
        className="pointer-events-none absolute top-1/4 -left-20 w-80 h-80 rounded-full bg-white/70 blur-3xl -z-10"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute bottom-1/4 -right-20 w-80 h-80 rounded-full bg-white/60 blur-3xl -z-10"
        aria-hidden="true"
      />

      <div className="w-full flex flex-col items-center">
        {/* En-tête de section */}
        <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 border border-white font-mono text-[10px] text-[#6B7480] uppercase tracking-wider shadow-sm mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#22252A]" />
            <span>01 · Services & Expertises</span>
          </div>

          <h2 className="font-display font-black text-3xl sm:text-4xl lg:text-[44px] text-[#22252A] tracking-tight leading-tight mb-3">
            Ce que je peux faire pour vous
          </h2>

          <p className="font-text text-sm sm:text-base text-[#4A5663] max-w-[56ch] mx-auto leading-relaxed">
            Sites, applications, automatisations IA et design. Ouvrez les dossiers pour
            parcourir les prestations et spécifications.
          </p>
        </div>

        {/* RUBAN DÉFILANT DES DOSSIERS DE GAUCHE VERS LA DROITE */}
        <div className="relative w-full overflow-hidden py-10 group">
          {/* Dégradés latéraux pour estomper les bords */}
          <div
            className="pointer-events-none absolute inset-y-0 left-0 w-16 sm:w-32 bg-gradient-to-r from-[#EEF2F7] via-[#EEF2F7]/80 to-transparent z-20"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute inset-y-0 right-0 w-16 sm:w-32 bg-gradient-to-l from-[#EEF2F7] via-[#EEF2F7]/80 to-transparent z-20"
            aria-hidden="true"
          />

          {/* Rail animé de gauche vers la droite (-50% vers 0%) */}
          <div
            className="flex items-center gap-10 sm:gap-14 w-max will-change-transform"
            style={{
              animation: "scrollLeftToRight 36s linear infinite",
              animationPlayState: isPaused ? "paused" : "running",
            }}
          >
            {MARQUEE_SERVICES.map((srv, index) => {
              const uniqueKey = `${srv.id}-${index}`;
              const isOpen = activeOpenId === uniqueKey;

              return (
                <div
                  key={uniqueKey}
                  className="flex-shrink-0 transition-transform duration-300 hover:scale-[1.02]"
                  onMouseEnter={() => {
                    // Au survol, on garde le rail visible
                  }}
                >
                  <GlassFolder
                    label={srv.label}
                    meta={srv.meta}
                    art={srv.art}
                    seed={srv.seed}
                    files={srv.files}
                    width={330}
                    action="none"
                    open={isOpen}
                    onOpenChange={(nextOpen) => {
                      setActiveOpenId(nextOpen ? uniqueKey : null);
                    }}
                    appearDelay={(index % 4) * 120}
                  />
                </div>
              );
            })}
          </div>

          <style jsx>{`
            @keyframes scrollLeftToRight {
              0% {
                transform: translateX(-50%);
              }
              100% {
                transform: translateX(0%);
              }
            }

            .group:hover div[style*="animation"] {
              animation-play-state: paused !important;
            }

            @media (prefers-reduced-motion: reduce) {
              div[style*="animation"] {
                animation: none !important;
              }
            }
          `}</style>
        </div>

        {/* Boutons d'accès vers la page complète Services */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8 px-4 sm:px-6">
          <Link
            href="/services"
            className="inline-flex items-center justify-center px-7 py-3.5 rounded-2xl bg-gradient-to-r from-[#3A3F46] to-[#14161A] text-white font-text text-xs font-bold uppercase tracking-wider shadow-[0_8px_24px_rgba(20,22,26,0.20)] hover:-translate-y-0.5 active:translate-y-0 transition-transform focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#22252A] focus-visible:outline-offset-2"
          >
            Découvrir le comparatif des packs & tarifs
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center px-7 py-3.5 rounded-2xl bg-white text-[#22252A] font-text text-xs font-bold uppercase tracking-wider shadow-[3px_3px_10px_rgba(120,130,145,0.18),-3px_-3px_10px_rgba(255,255,255,0.95)] hover:-translate-y-0.5 active:translate-y-0 transition-transform focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#22252A] focus-visible:outline-offset-2"
          >
            Discuter de votre besoin
          </Link>
        </div>
      </div>
    </section>
  );
}
