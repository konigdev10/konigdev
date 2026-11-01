import React from "react";
import { FAQ_ITEMS } from "@/lib/services-data";

export default function Faq() {
  return (
    <section className="w-full my-20 sm:my-28" aria-labelledby="faq-heading">
      <div className="text-center sm:text-left mb-12">
        <h2
          id="faq-heading"
          className="font-display font-extrabold text-[28px] sm:text-[36px] text-[#22252A] tracking-tight leading-[1.15] mb-3"
        >
          Questions fréquentes
        </h2>
        <p className="font-text text-sm text-[#4A5663] max-w-[56ch] leading-relaxed">
          Les réponses aux interrogations les plus courantes avant de lancer une collaboration.
        </p>
      </div>

      <div className="space-y-4 max-w-4xl">
        {FAQ_ITEMS.map((item) => (
          <details
            key={item.id}
            className="group rounded-[20px] bg-white border border-white/95 p-5 sm:p-6 shadow-contact-card transition-all duration-200"
          >
            <summary className="flex items-center justify-between gap-4 cursor-pointer list-none select-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#22252A] focus-visible:outline-offset-2 rounded-lg">
              <span className="font-display font-bold text-sm sm:text-base text-[#22252A] tracking-tight">
                {item.question}
              </span>
              {/* Flèche d'ouverture native SVG qui pivote au statut open via CSS */}
              <span className="w-8 h-8 rounded-full bg-[#EEF2F7] flex items-center justify-center shrink-0 text-[#22252A] group-open:rotate-180 transition-transform duration-200">
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
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </span>
            </summary>
            <div className="pt-4 mt-3 border-t border-[rgba(34,37,42,0.06)]">
              <p className="font-text text-xs sm:text-sm text-[#4A5663] leading-relaxed">
                {item.answer}
              </p>
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}

