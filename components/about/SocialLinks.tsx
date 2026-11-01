import React from "react";
import { SITE_CONFIG } from "@/lib/constants";

export default function SocialLinks() {
  return (
    <div className="flex items-center gap-3 pt-2 flex-wrap">
      {/* 1) Email : cercle #22252A avec enveloppe blanche */}
      <a
        href={`mailto:${SITE_CONFIG.email}`}
        aria-label="Envoyer un email à Esdras Thychel Mboulouékoué"
        className="w-10 h-10 rounded-full bg-[#22252A] hover:bg-[#14161A] text-white flex items-center justify-center shadow-md transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#22252A] focus-visible:outline-offset-2"
      >
        <svg
          className="w-4 h-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
          <polyline points="22,6 12,13 2,6" />
        </svg>
      </a>

      {/* 2) GitHub : cercle blanc avec logo noir */}
      <a
        href={SITE_CONFIG.github.url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Profil GitHub de KoniG.dev"
        className="w-10 h-10 rounded-full bg-white hover:bg-[#F8FAFD] text-[#22252A] flex items-center justify-center shadow-pill-relief border border-white/95 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#22252A] focus-visible:outline-offset-2"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
        </svg>
      </a>

      {/* 3) LinkedIn : cercle blanc avec logo noir */}
      <a
        href={SITE_CONFIG.linkedin.url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Profil LinkedIn d'Esdras Thychel Mboulouékoué"
        className="w-10 h-10 rounded-full bg-white hover:bg-[#F8FAFD] text-[#22252A] flex items-center justify-center shadow-pill-relief border border-white/95 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#22252A] focus-visible:outline-offset-2"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
        </svg>
      </a>

      {/* 4) TikTok : cercle blanc avec logo noir */}
      <a
        href={SITE_CONFIG.tiktok.url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Compte TikTok de KoniG.dev"
        className="w-10 h-10 rounded-full bg-white hover:bg-[#F8FAFD] text-[#22252A] flex items-center justify-center shadow-pill-relief border border-white/95 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#22252A] focus-visible:outline-offset-2"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.76a4.85 4.85 0 01-1.01-.07z" />
        </svg>
      </a>

      {/* 5) Facebook : cercle blanc avec logo noir */}
      <a
        href={SITE_CONFIG.facebook.url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Page Facebook de KoniG.dev"
        className="w-10 h-10 rounded-full bg-white hover:bg-[#F8FAFD] text-[#22252A] flex items-center justify-center shadow-pill-relief border border-white/95 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#22252A] focus-visible:outline-offset-2"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.791-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.883v2.271h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
        </svg>
      </a>

      {/* 6) Telegram : cercle blanc avec logo noir */}
      <a
        href={SITE_CONFIG.telegram.url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Telegram de KoniG.dev"
        className="w-10 h-10 rounded-full bg-white hover:bg-[#F8FAFD] text-[#22252A] flex items-center justify-center shadow-pill-relief border border-white/95 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#22252A] focus-visible:outline-offset-2"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
        </svg>
      </a>
    </div>
  );
}

