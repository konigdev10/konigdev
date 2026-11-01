import React from "react";
import { PROCESS_STEPS } from "@/lib/services-data";

export default function Process() {
  return (
    <section className="w-full my-20 sm:my-28" aria-labelledby="process-heading">
      <div className="text-center sm:text-left mb-12">
        <h2
          id="process-heading"
          className="font-display font-extrabold text-[28px] sm:text-[36px] text-[#22252A] tracking-tight leading-[1.15] mb-3"
        >
          Comment se déroule un projet
        </h2>
        <p className="font-text text-sm text-[#4A5663] max-w-[56ch] leading-relaxed">
          Une méthode en 4 étapes simples, transparente et sans engagement avant la
          validation écrite du devis.
        </p>
      </div>

      {/* Grille des 4 étapes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {PROCESS_STEPS.map((step) => (
          <div
            key={step.number}
            className="rounded-[24px] bg-white border border-white/95 p-6 sm:p-7 shadow-contact-card flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono text-2xl font-bold text-[#22252A]">
                  {step.number}
                </span>
                <span className="font-mono text-[10px] text-[#6B7480] bg-[#EEF2F7] px-2.5 py-1 rounded-full">
                  {step.duration}
                </span>
              </div>

              <h3 className="font-display font-bold text-base sm:text-lg text-[#22252A] tracking-tight mb-2">
                {step.title}
              </h3>

              <p className="font-text text-xs text-[#4A5663] leading-relaxed">
                {step.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

