import React from "react";
import { TIMELINE_CHAPTERS } from "@/lib/about-data";

export default function Timeline() {
  return (
    <section className="w-full my-16 sm:my-24" aria-labelledby="timeline-heading">
      <div className="text-center sm:text-left mb-10 sm:mb-12">
        <h2
          id="timeline-heading"
          className="font-display font-extrabold text-[28px] sm:text-[32px] text-[#22252A] tracking-tight leading-[1.15] mb-2"
        >
          Mon parcours en chapitres
        </h2>
        <p className="font-text text-sm text-[#4A5663] max-w-[56ch] leading-relaxed">
          Un cheminement autodidacte guidé par la pratique concrète et la volonté de
          construire des outils pérennes.
        </p>
      </div>

      {/* Ligne chronologique des chapitres */}
      <div className="relative border-l-2 border-[rgba(34,37,42,0.12)] ml-4 sm:ml-6 pl-6 sm:pl-10 space-y-10 sm:space-y-12">
        {TIMELINE_CHAPTERS.map((chap) => (
          <div key={chap.number} className="relative">
            {/* Puce circulaire en relief alignée sur la ligne verticale */}
            <span
              className="absolute -left-[31px] sm:-left-[47px] top-1.5 w-4 h-4 rounded-full bg-white border-2 border-[#22252A] shadow-pill-relief"
              aria-hidden="true"
            />

            <div className="rounded-[24px] bg-white border border-white/95 p-6 sm:p-8 shadow-contact-card">
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-[#6B7480] uppercase tracking-wider">
                    Chapitre {chap.number}
                  </span>
                  <span className="h-2 w-px bg-[#22252A]/20" />
                  <span className="font-mono text-xs font-semibold text-[#22252A]">
                    {chap.period}
                  </span>
                </div>
              </div>

              <h3 className="font-display font-bold text-lg sm:text-xl text-[#22252A] tracking-tight mb-3">
                {chap.title}
              </h3>

              <p className="font-text text-xs sm:text-sm text-[#4A5663] leading-relaxed mb-4">
                {chap.description}
              </p>

              <ul className="space-y-2 pt-3 border-t border-[rgba(34,37,42,0.06)]">
                {chap.highlights.map((h, i) => (
                  <li key={i} className="font-text text-xs text-[#6B7480] flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#22252A] shrink-0 mt-1.5" />
                    <span className="leading-relaxed">{h}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

