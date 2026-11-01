import React from "react";
import { IDENTITY_DETAILS, SKILL_CATEGORIES } from "@/lib/about-data";

export default function IdentityCard() {
  return (
    <section className="w-full my-16 sm:my-24" aria-labelledby="identity-heading">
      <div className="text-center sm:text-left mb-8 sm:mb-10">
        <h2
          id="identity-heading"
          className="font-display font-extrabold text-[28px] sm:text-[32px] text-[#22252A] tracking-tight leading-[1.15]"
        >
          L&apos;essentiel en un coup d&apos;œil
        </h2>
      </div>

      {/* Carte Soft UI avec deux blocs côte à côte (empilés sous 900px) */}
      <div className="rounded-[28px] bg-gradient-to-br from-[#F4F7FA] to-[#EDF1F6] border border-white/95 shadow-contact-card p-6 sm:p-10 lg:p-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* ==============================================================
              BLOC GAUCHE : FICHE D'IDENTITÉ (LIGNES SÉPARÉES PAR FILET FIN)
              ============================================================== */}
          <div className="lg:col-span-5 bg-white rounded-[22px] border border-white/95 p-6 sm:p-7 shadow-pill-relief">
            <span className="font-text text-xs font-bold uppercase tracking-wider text-[#22252A] block mb-5 pb-3 border-b border-[rgba(34,37,42,0.08)]">
              Fiche d&apos;identité
            </span>

            <div className="divide-y divide-[rgba(34,37,42,0.06)]">
              {IDENTITY_DETAILS.map((detail) => (
                <div key={detail.label} className="py-3 flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                  <span className="font-text text-[11px] text-[#6B7480] uppercase tracking-wide">
                    {detail.label}
                  </span>
                  <span className="font-text text-sm font-semibold text-[#22252A] sm:text-right">
                    {detail.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ==============================================================
              BLOC DROITE : BOÎTE À OUTILS & STACK TECHNIQUE
              ============================================================== */}
          <div className="lg:col-span-7 bg-white rounded-[22px] border border-white/95 p-6 sm:p-7 shadow-pill-relief flex flex-col justify-between">
            <div>
              <span className="font-text text-xs font-bold uppercase tracking-wider text-[#22252A] block mb-5 pb-3 border-b border-[rgba(34,37,42,0.08)]">
                Boîte à outils &amp; technologies
              </span>

              <div className="space-y-5">
                {SKILL_CATEGORIES.map((cat) => (
                  <div key={cat.title}>
                    <span className="font-text text-[11px] font-semibold text-[#6B7480] uppercase tracking-wide block mb-2">
                      {cat.title}
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {cat.skills.map((skill) => (
                        <span
                          key={skill}
                          className="px-3 py-1.5 rounded-xl bg-[#EEF2F7] text-[#22252A] font-mono text-xs font-medium border border-[rgba(34,37,42,0.04)]"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

