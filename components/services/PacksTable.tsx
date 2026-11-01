import React from "react";
import Link from "next/link";
import { SERVICE_PACKS } from "@/lib/services-data";

export default function PacksTable() {
  return (
    <section
      className="w-full my-20 sm:my-28"
      aria-labelledby="packs-heading"
    >
      <div className="text-center sm:text-left mb-12">
        <h2
          id="packs-heading"
          className="font-display font-extrabold text-[28px] sm:text-[36px] text-[#22252A] tracking-tight leading-[1.15] mb-3"
        >
          Formules et tarifs indicatifs
        </h2>
        <p className="font-text text-sm text-[#4A5663] max-w-[56ch] leading-relaxed">
          Trois niveaux d&apos;accompagnement pour choisir la formule la plus adaptée
          à votre étape de développement.
        </p>
      </div>

      {/* Grille des 3 packs Soft UI */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
        {SERVICE_PACKS.map((pack) => {
          return (
            <article
              key={pack.id}
              className={`rounded-[28px] p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 ${
                pack.highlight
                  ? "bg-gradient-to-br from-[#F4F7FA] to-[#EDF1F6] border-2 border-[#22252A] shadow-contact-card"
                  : "bg-white border border-white/95 shadow-contact-card"
              }`}
            >
              <div>
                {/* En-tête du pack */}
                <div className="mb-6 pb-6 border-b border-[rgba(34,37,42,0.08)]">
                  {pack.highlight && (
                    <span className="inline-block px-3 py-1 mb-3 rounded-full bg-[#22252A] text-white font-text text-[10px] font-bold uppercase tracking-wider">
                      Recommandé
                    </span>
                  )}
                  <h3 className="font-display font-extrabold text-xl sm:text-2xl text-[#22252A] tracking-tight mb-1">
                    {pack.name}
                  </h3>
                  <p className="font-text text-xs text-[#6B7480] mb-4 min-h-[32px]">
                    {pack.targetAudience}
                  </p>

                  <div className="flex items-baseline gap-1">
                    <span className="font-display font-black text-2xl sm:text-3xl text-[#22252A] tracking-tight">
                      {pack.startingPrice}
                    </span>
                  </div>
                  <p className="font-mono text-[11px] text-[#6B7480] mt-1">
                    Délai habituel : {pack.duration}
                  </p>
                </div>

                {/* Caractéristiques */}
                <div className="mb-8">
                  <span className="font-text text-xs font-bold uppercase tracking-wider text-[#22252A] block mb-3.5">
                    Inclus dans cette formule :
                  </span>
                  <ul className="space-y-3">
                    {pack.features.map((feature, i) => (
                      <li
                        key={i}
                        className="font-text text-xs text-[#4A5663] flex items-start gap-2.5 leading-relaxed"
                      >
                        {/* Coche SVG minimaliste faite main */}
                        <svg
                          className="w-4 h-4 text-[#22252A] shrink-0 mt-0.5"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Bouton vers contact */}
              <Link
                href={`/contact?pack=${encodeURIComponent(pack.name)}`}
                className={`w-full h-12 rounded-[14px] flex items-center justify-center font-text text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#22252A] focus-visible:outline-offset-2 ${
                  pack.highlight
                    ? "bg-gradient-to-r from-[#3A3F46] to-[#14161A] text-white shadow-btn-submit hover:-translate-y-0.5"
                    : "bg-[#EEF2F7] text-[#22252A] shadow-pill-relief border border-white/95 hover:-translate-y-0.5"
                }`}
              >
                Choisir cette formule
              </Link>
            </article>
          );
        })}
      </div>
    </section>
  );
}

