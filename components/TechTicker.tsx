"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";

interface TechItem {
  name: string;
  category: string;
  icon: React.ReactNode;
}

const TECHNOLOGIES_ROW_1: TechItem[] = [
  {
    name: "Next.js",
    category: "Framework Web",
    icon: (
      <svg className="w-5 h-5 text-[#22252A]" viewBox="0 0 180 180" fill="currentColor">
        <mask height="180" id="mask-next" maskUnits="userSpaceOnUse" width="180" x="0" y="0" style={{ maskType: "alpha" }}>
          <circle cx="90" cy="90" fill="black" r="90" />
        </mask>
        <g mask="url(#mask-next)">
          <circle cx="90" cy="90" fill="currentColor" r="90" />
          <path d="M149.508 157.438L69.1478 54H54V125.97H66.1136V69.3836L139.999 164.845C143.333 162.614 146.509 160.137 149.508 157.438Z" fill="white" />
          <rect fill="white" height="72" width="12" x="115" y="54" />
        </g>
      </svg>
    ),
  },
  {
    name: "TypeScript",
    category: "Langage",
    icon: (
      <svg className="w-5 h-5 text-[#22252A]" viewBox="0 0 24 24" fill="currentColor">
        <path d="M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0H1.125zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.71-.242 4.414 4.414 0 0 0-.809-.138c-.297-.019-.607-.028-.93-.028-.677 0-1.228.093-1.653.278-.424.185-.75.445-.978.78-.228.334-.342.74-.342 1.218 0 .436.084.812.253 1.128.168.316.41.59.726.822.316.232.7.436 1.152.612.452.176.96.348 1.524.515.59.176 1.157.376 1.7.6.544.223 1.012.492 1.405.807.392.315.698.696.918 1.142.22.446.33.978.33 1.597 0 .808-.175 1.53-.526 2.167-.35.636-.848 1.164-1.493 1.583-.645.419-1.428.729-2.35.93-.92.201-1.944.302-3.072.302-.793 0-1.57-.06-2.33-.18a8.777 8.777 0 0 1-2.072-.613v-2.695c.78.435 1.57.766 2.37.992.8.227 1.59.34 2.37.34.72 0 1.312-.102 1.777-.306.465-.204.819-.482 1.062-.835.244-.352.366-.765.366-1.238 0-.445-.09-.825-.27-1.14-.18-.315-.436-.59-.769-.824a6.388 6.388 0 0 0-1.219-.621c-.482-.176-1.028-.352-1.638-.528a9.426 9.426 0 0 1-1.748-.612 4.974 4.974 0 0 1-1.424-.835 3.738 3.738 0 0 1-.948-1.173 3.613 3.613 0 0 1-.342-1.624c0-.797.175-1.508.525-2.133.35-.625.845-1.14 1.485-1.546.64-.407 1.406-.709 2.298-.906.892-.197 1.869-.296 2.93-.296zm-9.873.238h3.33v13.688H11.52V9.988H8.615z" />
      </svg>
    ),
  },
  {
    name: "Flutter",
    category: "Mobile iOS & Android",
    icon: (
      <svg className="w-5 h-5 text-[#22252A]" viewBox="0 0 24 24" fill="currentColor">
        <path d="M14.314 0L2.3 12 6 15.7 21.684.013h-7.37zM6.028 15.676L0 21.704 3.67 24l9.7-9.7-3.642-3.643-3.7 5.019z" />
        <path d="M12.028 13.976l4.672 4.673H24l-7.3-7.3-4.672 2.627z" />
      </svg>
    ),
  },
  {
    name: "Python",
    category: "IA & Scripts",
    icon: (
      <svg className="w-5 h-5 text-[#22252A]" viewBox="0 0 24 24" fill="currentColor">
        <path d="M11.914 0C5.82 0 6.2 2.656 6.2 2.656l.006 2.75h5.813v.828H3.88S0 5.797 0 11.953c0 6.156 3.402 5.95 3.402 5.95h2.031v-2.859s-.11-3.403 3.348-3.403h5.766s3.242.052 3.242-3.18V2.656S18.238 0 11.914 0zm-3.21 1.848a1.05 1.05 0 0 1 1.054 1.05 1.05 1.05 0 0 1-1.054 1.055 1.05 1.05 0 0 1-1.055-1.055c0-.58.473-1.05 1.055-1.05z" />
        <path d="M12.086 24c6.094 0 5.714-2.656 5.714-2.656l-.006-2.75h-5.813v-.828h8.139s3.88.437 3.88-5.719c0-6.156-3.402-5.95-3.402-5.95h-2.031v2.859s.11 3.403-3.348 3.403H9.453s-3.242-.052-3.242 3.18v5.508S5.762 24 12.086 24zm3.21-1.848a1.05 1.05 0 0 1-1.054-1.05 1.05 1.05 0 0 1 1.054-1.055 1.05 1.05 0 0 1 1.055 1.055c0 .58-.473 1.05-1.055 1.05z" />
      </svg>
    ),
  },
  {
    name: "n8n",
    category: "Automatisation",
    icon: (
      <svg className="w-5 h-5 text-[#22252A]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="6" cy="6" r="3" />
        <circle cx="18" cy="18" r="3" />
        <circle cx="18" cy="6" r="3" />
        <path d="M6 9v6a3 3 0 0 0 3 3h6" />
        <path d="M9 6h6" />
      </svg>
    ),
  },
  {
    name: "Mistral AI",
    category: "LLM & RAG",
    icon: (
      <svg className="w-5 h-5 text-[#22252A]" viewBox="0 0 24 24" fill="currentColor">
        <path d="M3 4h4v4H3V4zm7 0h4v4h-4V4zm7 0h4v4h-4V4zM3 10h4v4H3v-4zm7 0h4v4h-4v-4zm7 0h4v4h-4v-4zM3 16h4v4H3v-4zm14 0h4v4h-4v-4z" />
      </svg>
    ),
  },
  {
    name: "Supabase",
    category: "Bases & Auth",
    icon: (
      <svg className="w-5 h-5 text-[#22252A]" viewBox="0 0 24 24" fill="currentColor">
        <path d="M21.362 9.354H12V.396a.396.396 0 0 0-.716-.233L.328 13.916a.8.8 0 0 0 .61 1.317H12v9.371a.396.396 0 0 0 .716.233l10.956-14.167a.8.8 0 0 0-.31-1.316z" />
      </svg>
    ),
  },
  {
    name: "Tailwind CSS",
    category: "Styling UI",
    icon: (
      <svg className="w-5 h-5 text-[#22252A]" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.001 4.8c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624C13.666 10.618 15.027 12 18.001 12c3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C16.337 6.182 14.976 4.8 12.001 4.8zm-6 7.2c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624 1.177 1.194 2.538 2.576 5.512 2.576 3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C10.336 13.382 8.975 12 6.001 12z" />
      </svg>
    ),
  },
  {
    name: "React",
    category: "Librairie Front-End",
    icon: (
      <svg className="w-5 h-5 text-[#22252A]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <ellipse cx="12" cy="12" rx="10" ry="4.2" transform="rotate(0 12 12)" />
        <ellipse cx="12" cy="12" rx="10" ry="4.2" transform="rotate(60 12 12)" />
        <ellipse cx="12" cy="12" rx="10" ry="4.2" transform="rotate(120 12 12)" />
        <circle cx="12" cy="12" r="1.8" fill="currentColor" />
      </svg>
    ),
  },
  {
    name: "PostgreSQL",
    category: "Base SQL",
    icon: (
      <svg className="w-5 h-5 text-[#22252A]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
        <path d="M7 11.5c1-1 3-1.5 5-1.5s4 .5 5 1.5" />
        <path d="M8 15c1 .8 2.5 1.2 4 1.2s3-.4 4-1.2" />
        <line x1="12" y1="10" x2="12" y2="16.2" />
      </svg>
    ),
  },
  {
    name: "Figma",
    category: "Prototypage UI",
    icon: (
      <svg className="w-5 h-5 text-[#22252A]" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 12a3 3 0 1 1 3-3 3 3 0 0 1-3 3zm0 0v6a3 3 0 1 1-3-3h3zm0-6V0H9a3 3 0 0 0 0 6h3zm0 0h3a3 3 0 1 0 0-6h-3v6zm0 6h3a3 3 0 1 0 0-6h-3v6z" />
      </svg>
    ),
  },
];

const TECHNOLOGIES_ROW_2: TechItem[] = [
  {
    name: "OpenAI",
    category: "Modèles & Agents",
    icon: (
      <svg className="w-5 h-5 text-[#22252A]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="8" />
        <path d="M12 4v16" />
        <path d="M4.93 7.07l14.14 9.86" />
        <path d="M4.93 16.93l14.14-9.86" />
      </svg>
    ),
  },
  {
    name: "Node.js",
    category: "Runtime Backend",
    icon: (
      <svg className="w-5 h-5 text-[#22252A]" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.5l9 5.2v10.4l-9 5.2-9-5.2V7.7l9-5.2zm0 2.3L4.8 9.3v7.3l7.2 4.1 7.2-4.1V9.3L12 4.8z" />
      </svg>
    ),
  },
  {
    name: "Docker",
    category: "Conteneurisation",
    icon: (
      <svg className="w-5 h-5 text-[#22252A]" viewBox="0 0 24 24" fill="currentColor">
        <path d="M13.98 9.53h2.35v2.35h-2.35V9.53zm-2.82 0h2.35v2.35h-2.35V9.53zm-2.82 0h2.35v2.35H8.34V9.53zm-2.82 0h2.35v2.35H5.52V9.53zm8.46-2.82h2.35v2.35h-2.35V6.71zm-2.82 0h2.35v2.35h-2.35V6.71zm-2.82 0h2.35v2.35H8.34V6.71zm-2.82 0h2.35v2.35H5.52V6.71z" />
        <path d="M22.5 13.5c-.38-.25-1.2-.38-2.06-.05-.13-.49-.44-.92-.88-1.22l-.46-.3-.3.46c-.46.7-.48 1.57-.06 2.29-.44.25-1.07.48-1.8.48H2.5c-.28 0-.5.22-.5.5 0 3.86 3.14 7 7 7 5.09 0 9.42-3.4 10.7-8.15.93-.16 2.05-.72 2.8-1.51v-.5z" />
      </svg>
    ),
  },
  {
    name: "Git",
    category: "Versionnage",
    icon: (
      <svg className="w-5 h-5 text-[#22252A]" viewBox="0 0 24 24" fill="currentColor">
        <path d="M21.62 10.45l-8.07-8.07a2.53 2.53 0 0 0-3.58 0L8.03 4.33l3.28 3.28a2.54 2.54 0 0 1 3.23 3.24l3.16 3.16a2.54 2.54 0 1 1-1.25 1.25l-2.92-2.92v4.61a2.54 2.54 0 1 1-1.77 0v-5.26a2.54 2.54 0 0 1-1.37-3.32L5.12 7.08 2.38 9.82a2.53 2.53 0 0 0 0 3.58l8.07 8.07a2.53 2.53 0 0 0 3.58 0l7.59-7.59a2.53 2.53 0 0 0 0-3.43z" />
      </svg>
    ),
  },
  {
    name: "REST APIs",
    category: "Intégrations",
    icon: (
      <svg className="w-5 h-5 text-[#22252A]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
        <line x1="14" y1="4" x2="10" y2="20" />
      </svg>
    ),
  },
  {
    name: "GraphQL",
    category: "Requêtes API",
    icon: (
      <svg className="w-5 h-5 text-[#22252A]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <polygon points="12 2 21 7 21 17 12 22 3 17 3 7 12 2" />
        <circle cx="12" cy="12" r="2.5" fill="currentColor" />
      </svg>
    ),
  },
  {
    name: "Redis",
    category: "Cache & Files",
    icon: (
      <svg className="w-5 h-5 text-[#22252A]" viewBox="0 0 24 24" fill="currentColor">
        <path d="M2.5 12l9.5-5.5 9.5 5.5-9.5 5.5L2.5 12z" />
        <path d="M2.5 15.5l9.5 5.5 9.5-5.5-2 1.2-7.5 4.3-7.5-4.3-2-1.2z" />
        <path d="M2.5 18.5l9.5 5.5 9.5-5.5-2 1.2-7.5 4.3-7.5-4.3-2-1.2z" />
      </svg>
    ),
  },
  {
    name: "Linux",
    category: "Serveurs & DevOps",
    icon: (
      <svg className="w-5 h-5 text-[#22252A]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3a4 4 0 0 0-4 4v5a4 4 0 0 0 8 0V7a4 4 0 0 0-4-4z" />
        <path d="M7 12a5 5 0 0 0-3 4.5V19a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2.5a5 5 0 0 0-3-4.5" />
        <circle cx="10" cy="7" r="0.75" fill="currentColor" />
        <circle cx="14" cy="7" r="0.75" fill="currentColor" />
      </svg>
    ),
  },
  {
    name: "JavaScript",
    category: "Langage",
    icon: (
      <svg className="w-5 h-5 text-[#22252A]" viewBox="0 0 24 24" fill="currentColor">
        <rect x="2" y="2" width="20" height="20" rx="3" fill="#22252A" />
        <path d="M14 9v6.5c0 1.2-.8 1.8-2 1.8-.8 0-1.5-.4-1.8-.8l.8-1c.2.3.5.5.9.5.5 0 .8-.2.8-.7V9h1.3zm3 0v4.8c0 1.8 1.1 2.5 2.5 2.5.8 0 1.5-.3 1.9-.7l-.6-1.1c-.3.3-.7.5-1.2.5-.7 0-1.1-.3-1.1-1.3V9H17z" fill="white" />
      </svg>
    ),
  },
  {
    name: "Dart",
    category: "Moteur Flutter",
    icon: (
      <svg className="w-5 h-5 text-[#22252A]" viewBox="0 0 24 24" fill="currentColor">
        <path d="M4.1 3.2L12 0l7.9 3.2-3.8 8.8H7.9L4.1 3.2zm-.1 1.8l3.6 8.3h8.8l3.6-8.3-8 19-8-19z" />
      </svg>
    ),
  },
];

export default function TechTicker() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Écoute du défilement de la page sur cette section
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  // Ressort d'amortissement doux pour que le mouvement soit soyeux et fluide
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 70,
    damping: 24,
    restDelta: 0.001,
  });

  // Quand on scroll vers le bas : défilement de la gauche vers la droite (de -25% à +8%)
  // Quand on scroll vers le haut : s'inverse automatiquement vers la gauche
  const xRow1 = useTransform(smoothProgress, [0, 1], ["-26%", "8%"]);

  // Rangée 2 : défilement en contrepoint pour un relief cinétique
  const xRow2 = useTransform(smoothProgress, [0, 1], ["6%", "-26%"]);

  return (
    <section
      ref={containerRef}
      className="relative w-full py-6 sm:py-8 bg-gradient-to-b from-[#EDF2F7] via-[#F4F7FA] to-[#EEF2F7] border-b border-[rgba(34,37,42,0.08)] overflow-hidden select-none"
      aria-label="Technologies et langages maîtrisés"
    >
      {/* Masques de dégradé latéral pour faire disparaître en douceur les icônes sur les bords */}
      <div
        className="pointer-events-none absolute inset-y-0 left-0 w-24 sm:w-48 bg-gradient-to-r from-[#EDF2F7] via-[#EDF2F7]/80 to-transparent z-10"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 w-24 sm:w-48 bg-gradient-to-l from-[#EDF2F7] via-[#EDF2F7]/80 to-transparent z-10"
        aria-hidden="true"
      />

      {/* Petit libellé indicateur centré */}
      <div className="w-full text-center mb-3.5">
        <span className="font-mono text-[10px] uppercase tracking-widest text-[#6B7480]">
          Technologies &bull; Langages &bull; Outils de production
        </span>
      </div>

      <div className="flex flex-col gap-4">
        {/* ==============================================================
            RANGÉE 1 : DÉFILE DE GAUCHE À DROITE AU SCROLL VERS LE BAS
            ============================================================== */}
        <motion.div
          style={{ x: xRow1 }}
          className="flex items-center gap-3.5 sm:gap-5 whitespace-nowrap will-change-transform"
        >
          {/* Duplication pour garantir un flux visuel infini et dense */}
          {[...TECHNOLOGIES_ROW_1, ...TECHNOLOGIES_ROW_1, ...TECHNOLOGIES_ROW_1].map(
            (tech, index) => (
              <div
                key={`row1-${tech.name}-${index}`}
                className="inline-flex items-center gap-3 px-4 sm:px-5 py-2.5 rounded-2xl bg-white border border-white/95 shadow-pill-relief hover:border-[#22252A] transition-all duration-200 cursor-default"
              >
                <div className="w-7 h-7 rounded-xl bg-[#EEF2F7] flex items-center justify-center shrink-0">
                  {tech.icon}
                </div>
                <div className="flex flex-col text-left">
                  <span className="font-display font-extrabold text-xs sm:text-sm text-[#22252A] tracking-tight">
                    {tech.name}
                  </span>
                  <span className="font-mono text-[9px] text-[#6B7480] uppercase tracking-wider">
                    {tech.category}
                  </span>
                </div>
              </div>
            )
          )}
        </motion.div>

        {/* ==============================================================
            RANGÉE 2 : DÉFILEMENT COMPLÉMENTAIRE CONTREPOINT
            ============================================================== */}
        <motion.div
          style={{ x: xRow2 }}
          className="flex items-center gap-3.5 sm:gap-5 whitespace-nowrap will-change-transform"
        >
          {[...TECHNOLOGIES_ROW_2, ...TECHNOLOGIES_ROW_2, ...TECHNOLOGIES_ROW_2].map(
            (tech, index) => (
              <div
                key={`row2-${tech.name}-${index}`}
                className="inline-flex items-center gap-3 px-4 sm:px-5 py-2.5 rounded-2xl bg-white border border-white/95 shadow-pill-relief hover:border-[#22252A] transition-all duration-200 cursor-default"
              >
                <div className="w-7 h-7 rounded-xl bg-[#EEF2F7] flex items-center justify-center shrink-0">
                  {tech.icon}
                </div>
                <div className="flex flex-col text-left">
                  <span className="font-display font-extrabold text-xs sm:text-sm text-[#22252A] tracking-tight">
                    {tech.name}
                  </span>
                  <span className="font-mono text-[9px] text-[#6B7480] uppercase tracking-wider">
                    {tech.category}
                  </span>
                </div>
              </div>
            )
          )}
        </motion.div>
      </div>
    </section>
  );
}

