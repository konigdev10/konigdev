"use client";

import { motion } from "framer-motion";
import { SITE_CONFIG } from "@/lib/constants";

const SOCIAL_LINKS = [
  {
    name: "WhatsApp",
    url: SITE_CONFIG.whatsapp.url,
    handle: SITE_CONFIG.whatsapp.display,
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
      </svg>
    ),
  },
  {
    name: "GitHub",
    url: SITE_CONFIG.github.url,
    handle: `@${SITE_CONFIG.github.username}`,
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
      </svg>
    ),
  },
  {
    name: "LinkedIn",
    url: SITE_CONFIG.linkedin.url,
    handle: SITE_CONFIG.linkedin.handle,
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
      </svg>
    ),
  },
  {
    name: "TikTok",
    url: SITE_CONFIG.tiktok.url,
    handle: SITE_CONFIG.tiktok.handle,
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.76a4.85 4.85 0 01-1.01-.07z" />
      </svg>
    ),
  },
  {
    name: "Facebook",
    url: SITE_CONFIG.facebook.url,
    handle: SITE_CONFIG.facebook.handle,
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.791-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.883v2.271h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
      </svg>
    ),
  },
  {
    name: "Telegram",
    url: SITE_CONFIG.telegram.url,
    handle: SITE_CONFIG.telegram.handle,
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
      </svg>
    ),
  },
  {
    name: "Email",
    url: `mailto:${SITE_CONFIG.email}`,
    handle: SITE_CONFIG.email,
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
      </svg>
    ),
  },
];

const BRAND_LETTERS = [
  { char: "K", rotateHover: -12, yOffset: -24 },
  { char: "o", rotateHover: 8, yOffset: -18 },
  { char: "n", rotateHover: -10, yOffset: -22 },
  { char: "i", rotateHover: 14, yOffset: -26 },
  { char: "G", rotateHover: -14, yOffset: -20 },
  { char: "D", rotateHover: 10, yOffset: -24 },
  { char: "e", rotateHover: -8, yOffset: -18 },
  { char: "V", rotateHover: 15, yOffset: -28 },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative w-full bg-[#EDF2F7] text-[#22252A] pt-10 sm:pt-14 pb-8 overflow-hidden border-t border-[rgba(34,37,42,0.08)]">
      {/* Halo subtil en fond */}
      <div
        className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[320px] rounded-full bg-[radial-gradient(circle,_rgba(255,255,255,0.85)_0%,_transparent_70%)] blur-2xl"
        aria-hidden="true"
      />

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 flex flex-col items-center text-center relative z-10">

        {/* ==================================================================
            LETTRES GÉANTES INTERACTIVES "KoniGDeV" EN NOIR CHARBON
            QUI S'AMUSENT AU SURVOL (AVEC MARGES DE RESPIRATION)
            ================================================================== */}
        <div className="my-4 sm:my-6 px-4 sm:px-8 select-none cursor-pointer flex items-center justify-center w-full max-w-5xl mx-auto">
          <h3
            className="font-display font-black text-[clamp(2.2rem,7.2vw,6.2rem)] leading-none tracking-tight flex items-center justify-center flex-nowrap"
            aria-label="KoniGDeV"
          >
            {BRAND_LETTERS.map((item, idx) => (
              <motion.span
                key={`${item.char}-${idx}`}
                whileHover={{
                  y: item.yOffset,
                  rotate: item.rotateHover,
                  scale: 1.14,
                  color: "#14161A",
                  transition: { type: "spring", stiffness: 450, damping: 10 },
                }}
                whileTap={{ scale: 0.92 }}
                className="inline-block transition-colors duration-150 text-[#22252A] hover:drop-shadow-[0_12px_24px_rgba(34,37,42,0.2)] px-[1px]"
              >
                {item.char}
              </motion.span>
            ))}
          </h3>
        </div>

        <p className="font-mono text-xs uppercase tracking-widest text-[#6B7480] mb-5">
          Passez la souris sur les lettres &bull; Esdras Thychel Mbouloukoue
        </p>

        {/* ==================================================================
            UNIQUEMENT LES RÉSEAUX SOCIAUX
            ================================================================== */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mb-8 sm:mb-10">
          {SOCIAL_LINKS.map((social) => (
            <motion.a
              key={social.name}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ y: -4, scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="group flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-white border border-[rgba(34,37,42,0.08)] hover:border-[#22252A] hover:shadow-card transition-all shadow-sm"
              aria-label={`${social.name} de Konigdev`}
            >
              <span className="text-[#4A5663] group-hover:text-[#22252A] transition-colors">
                {social.icon}
              </span>
              <div className="flex flex-col text-left">
                <span className="font-sans text-xs font-semibold text-[#22252A] transition-colors">
                  {social.name}
                </span>
                <span className="font-mono text-[10px] text-[#6B7480]">
                  {social.handle}
                </span>
              </div>
              <span className="text-[#6B7480] group-hover:text-[#22252A] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all text-xs ml-1">
                ↗
              </span>
            </motion.a>
          ))}
        </div>

        {/* Ligne de copyright sobre */}
        <div className="w-full pt-8 border-t border-[rgba(34,37,42,0.08)] flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[11px] text-[#6B7480]">
          <p>© {currentYear} KoniGDeV — Tous droits réservés.</p>
          <p className="flex items-center gap-2">
            <span>Brazzaville, Congo &bull; UTC+1</span>
            <span className="w-2 h-2 rounded-full bg-[#22252A] animate-pulse" />
          </p>
        </div>

      </div>
    </footer>
  );
}
