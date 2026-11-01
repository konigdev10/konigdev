import type { ReactNode } from "react";

/**
 * Dessins de l'anneau. Ce sont des interprétations géométriques au trait,
 * redessinées ici — pas les logos officiels, qui ne sont pas réutilisables
 * tels quels. Quand une marque n'a pas d'équivalent lisible en traits fins
 * (PostgreSQL, Docker, Node), on garde un symbole générique du même métier.
 *
 * Chaque glyphe est dessiné dans une boîte 24 × 24, sans remplissage :
 * la couleur et l'épaisseur du trait sont données par IconToken.
 */
export type RingIcon = {
  /** Libellé affiché au survol et lu par les lecteurs d'écran. */
  name: string;
  /** Ce que la techno apporte, en infobulle. */
  role: string;
  glyph: ReactNode;
};

export const RING_ICONS: RingIcon[] = [
  {
    name: "Next.js",
    role: "Full-Stack React",
    glyph: (
      <>
        <circle cx="12" cy="12" r="9.25" />
        <path d="M9 7.6v8.8M9 7.6l6 8.8M15 7.6v5.4" />
      </>
    ),
  },
  {
    name: "React",
    role: "Bibliothèque UI",
    glyph: (
      <>
        <circle cx="12" cy="12" r="1.4" />
        <ellipse cx="12" cy="12" rx="9.2" ry="3.6" />
        <ellipse cx="12" cy="12" rx="9.2" ry="3.6" transform="rotate(60 12 12)" />
        <ellipse cx="12" cy="12" rx="9.2" ry="3.6" transform="rotate(120 12 12)" />
      </>
    ),
  },
  {
    name: "TypeScript",
    role: "Typage strict",
    glyph: (
      <>
        <rect x="3.2" y="3.2" width="17.6" height="17.6" rx="4" />
        <path d="M7.6 10h5.2M10.2 10v6.2" />
        <path d="M18 14.6c0 1.1-1.5 1.6-2.6 1.6s-2.2-.6-2.2-1.7c0-2.2 4.8-1.2 4.8-3.4 0-1.1-1.1-1.7-2.3-1.7-1.1 0-2.1.5-2.1 1.5" />
      </>
    ),
  },
  {
    name: "JavaScript",
    role: "Langage du web",
    glyph: (
      <>
        <rect x="3.2" y="3.2" width="17.6" height="17.6" rx="4" />
        <path d="M9.4 8.4v6.9c0 1.6-1.2 2.2-2.5 2.2" />
        <path d="M18 14.9c0 1.1-1.5 1.7-2.7 1.7s-2.3-.7-2.3-1.8c0-2.3 5-1.3 5-3.6 0-1.1-1.1-1.8-2.4-1.8s-2.2.6-2.2 1.6" />
      </>
    ),
  },
  {
    name: "Node.js",
    role: "Runtime & API",
    glyph: (
      <>
        <path d="M12 2.6 20.4 7v10L12 21.4 3.6 17V7z" />
        <path d="M9 14.4V9.6M9 9.6l6 4.8M15 9.6v2.6" />
      </>
    ),
  },
  {
    name: "Python",
    role: "Scripts & IA",
    glyph: (
      <>
        <path d="M9.4 3.4h3.2a2.8 2.8 0 0 1 2.8 2.8v2.4H9.6a3 3 0 0 0-3 3v2.3H4.6a2.8 2.8 0 0 1-2.8-2.8V6.2a2.8 2.8 0 0 1 2.8-2.8z" />
        <path d="M14.6 20.6h-3.2a2.8 2.8 0 0 1-2.8-2.8v-2.4h5.8a3 3 0 0 0 3-3V10h2a2.8 2.8 0 0 1 2.8 2.8v5a2.8 2.8 0 0 1-2.8 2.8z" />
        <circle cx="8.6" cy="6.6" r=".7" />
        <circle cx="15.4" cy="17.4" r=".7" />
      </>
    ),
  },
  {
    name: "Tailwind CSS",
    role: "Système de design",
    glyph: (
      <>
        <path d="M8.4 7.4c1.8-3 3.6-3 5.4 0s3.6 3 5.4 0" />
        <path d="M2.6 12.6c1.8-3 3.6-3 5.4 0s3.6 3 5.4 0" />
        <path d="M8.4 17.6c1.8-3 3.6-3 5.4 0s3.6 3 5.4 0" />
      </>
    ),
  },
  {
    name: "Flutter",
    role: "Apps iOS & Android",
    glyph: (
      <>
        <path d="M11.4 2.8h3.4L7.2 12l7.6 9.2h-3.4L3.8 12z" />
        <path d="M15.6 8.6 20.2 12l-4.6 3.4" />
      </>
    ),
  },
  {
    name: "PostgreSQL",
    role: "Base relationnelle",
    glyph: (
      <>
        <ellipse cx="12" cy="6" rx="7.4" ry="2.9" />
        <path d="M4.6 6v12c0 1.6 3.3 2.9 7.4 2.9s7.4-1.3 7.4-2.9V6" />
        <path d="M4.6 12c0 1.6 3.3 2.9 7.4 2.9s7.4-1.3 7.4-2.9" />
      </>
    ),
  },
  {
    name: "Supabase",
    role: "Backend & Auth",
    glyph: (
      <>
        <path d="M13.6 2.6 4.8 13.2h5.2l-1.4 8.2 8.8-10.6h-5.2z" />
      </>
    ),
  },
  {
    name: "n8n",
    role: "Automatisations",
    glyph: (
      <>
        <circle cx="5.6" cy="12" r="2.6" />
        <circle cx="18.4" cy="6.4" r="2.6" />
        <circle cx="18.4" cy="17.6" r="2.6" />
        <path d="M7.9 10.8 16.1 7.3M7.9 13.2l8.2 3.5" />
      </>
    ),
  },
  {
    name: "Git",
    role: "Versionnement",
    glyph: (
      <>
        <circle cx="7.4" cy="5.4" r="2.4" />
        <circle cx="7.4" cy="18.6" r="2.4" />
        <circle cx="16.6" cy="9.4" r="2.4" />
        <path d="M7.4 7.8v8.4M9.7 6.6l4.6 1.6M16.6 11.8c0 3.2-3.2 3.4-5.4 4.4" />
      </>
    ),
  },
  {
    name: "Docker",
    role: "Conteneurs",
    glyph: (
      <>
        <path d="M2.8 13.4h16.6a4.6 4.6 0 0 1-4.4 5.6H8a5.2 5.2 0 0 1-5.2-5.6z" />
        <path d="M6.6 10.6V7.4h3.2v3.2zM10.6 10.6V7.4h3.2v3.2zM14.6 10.6V7.4h3.2v3.2M17.8 5.4c1.6.6 2.4 1.8 2.6 3" />
      </>
    ),
  },
  {
    name: "API & JSON",
    role: "Intégrations",
    glyph: (
      <>
        <path d="M8.6 4.6C6.4 4.6 6.8 9.4 4.4 12c2.4 2.6 2 7.4 4.2 7.4" />
        <path d="M15.4 4.6c2.2 0 1.8 4.8 4.2 7.4-2.4 2.6-2 7.4-4.2 7.4" />
        <path d="M12 9.4v.1M12 14.5v.1" />
      </>
    ),
  },
  {
    name: "IA & LLM",
    role: "Agents & Mistral",
    glyph: (
      <>
        <path d="M12 3.2c.7 3.6 1.9 4.8 5.5 5.5-3.6.7-4.8 1.9-5.5 5.5-.7-3.6-1.9-4.8-5.5-5.5 3.6-.7 4.8-1.9 5.5-5.5z" />
        <path d="M17.4 15.2c.4 2 1 2.7 3 3.1-2 .4-2.6 1-3 3-.4-2-1-2.6-3-3 2-.4 2.6-1.1 3-3.1z" />
        <circle cx="6.6" cy="18.4" r="1.5" />
      </>
    ),
  },
  {
    name: "Figma",
    role: "Maquettes",
    glyph: (
      <>
        <path d="M9 2.6h3a3.2 3.2 0 0 1 0 6.4H9a3.2 3.2 0 0 1 0-6.4zM9 9h3a3.2 3.2 0 0 1 0 6.4H9V9zM9 15.4h3a3.2 3.2 0 1 1-3 3.2v-3.2zM12 2.6h1.8a3.2 3.2 0 0 1 0 6.4H12zM15.6 9a2.8 2.8 0 1 1 0 5.6 2.8 2.8 0 0 1 0-5.6z" />
      </>
    ),
  },
  {
    name: "Mistral AI",
    role: "Modèles ouverts",
    glyph: (
      <>
        <path d="M3.4 15.2 7 11.6l3.4 3.6H7.4l-4 3.4zM3.4 8.8 7 12.4l3.4-3.6" />
        <path d="M10.6 15.2 14 11.6l3.4 3.6" />
        <path d="M17.4 8.8 20.6 12" />
      </>
    ),
  },
  {
    name: "OpenAI",
    role: "Agents conversationnels",
    glyph: (
      <>
        <path d="M12 3.6c2.1 0 3.3 1.5 4.4 3.1M12 3.6C9.9 3.6 8.7 5.1 7.6 6.7" />
        <path d="M19.2 15.4c-1.1 1.6-2.3 3.1-4.4 3.1M19.2 9.7c1.1 1.6 1.6 3.2 1 4.8" />
        <path d="M4.8 9.7c-1.1 1.6-1.6 3.2-1 4.8M4.8 15.4c1.1 1.6 2.3 3.1 4.4 3.1" />
        <path d="M7.6 6.7c1.5-.5 3.1-.5 4.4.4M16.4 6.7c-1.5-.5-3.1-.5-4.4.4" />
        <path d="M9.2 18.5c1.5.5 3.1.5 4.4-.4" />
      </>
    ),
  },
  {
    name: "Stripe",
    role: "Paiements en ligne",
    glyph: (
      <>
        <rect x="2.8" y="5.4" width="18.4" height="13.2" rx="2.6" />
        <path d="M2.8 9.6h18.4" />
        <path d="M13.6 14.4h4.2" />
      </>
    ),
  },
  {
    name: "Notion",
    role: "Bases & docs",
    glyph: (
      <>
        <path d="M5.4 3.6h9.2l4 3.8v13H5.4z" />
        <path d="M14.6 3.6v3.8h4" />
        <path d="M9 9.4v6.6M9 9.4l6 6.6M15 9.4v6.6" />
      </>
    ),
  },
  {
    name: "Webhooks",
    role: "Déclencheurs d'événements",
    glyph: (
      <>
        <circle cx="6.2" cy="5.8" r="2.6" />
        <circle cx="6.2" cy="18.2" r="2.6" />
        <circle cx="17.8" cy="12" r="2.6" />
        <path d="M8.2 7.4c2.6.6 4.4 1.9 6.2 3.6M8.2 16.6c2.6-.6 4.4-1.9 6.2-3.6" />
      </>
    ),
  },
  {
    name: "SQL",
    role: "Requêtes & données",
    glyph: (
      <>
        <ellipse cx="12" cy="5.8" rx="7.6" ry="2.8" />
        <path d="M4.4 5.8v12.4c0 1.5 3.4 2.8 7.6 2.8s7.6-1.3 7.6-2.8V5.8" />
        <path d="M4.4 12c0 1.5 3.4 2.8 7.6 2.8s7.6-1.3 7.6-2.8" />
      </>
    ),
  },
  {
    name: "HTML & CSS",
    role: "Socle du web",
    glyph: (
      <>
        <path d="M3.4 4.6h17.2l-1.5 14.2L12 21l-7.1-2.2z" />
        <path d="M8.2 9.4h7.6M9 13.2h6" />
      </>
    ),
  },
  {
    name: "WhatsApp API",
    role: "Notifications client",
    glyph: (
      <>
        <path d="M3.8 20.2 5.3 15a8.2 8.2 0 1 1 3.6 3.7z" />
        <path d="M9 9.2c-.4 1.6.6 3.2 1.8 4.2s2.6 1.8 4 1.4" />
      </>
    ),
  },
];

/**
 * Version mobile : 12 jetons, sans flou ni parallaxe.
 * Sélection volontaire — les socles les plus parlants d'un projet client.
 */
export const RING_ICONS_COMPACT = RING_ICONS.filter((icon) =>
  [
    "Next.js",
    "React",
    "TypeScript",
    "JavaScript",
    "Node.js",
    "Python",
    "Tailwind CSS",
    "Flutter",
    "PostgreSQL",
    "Supabase",
    "n8n",
    "IA & LLM",
  ].includes(icon.name)
);

/** Liste textuelle équivalente, pour les lecteurs d'écran. */
export const RING_ICON_NAMES = RING_ICONS.map((icon) => icon.name);
