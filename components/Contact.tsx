"use client";

import { motion } from "framer-motion";
import { getScrollRevealProps } from "@/components/useScrollReveal";
import ContactForm from "@/components/ContactForm";

export default function Contact() {
  return (
    <section
      id="contact"
      className="relative overflow-hidden py-12 sm:py-16 px-4 sm:px-6 lg:px-12 bg-background border-t border-[rgba(34,37,42,0.08)] scroll-mt-20"
      aria-label="Section de contact KoniG.dev"
    >
      {/* Halo d'ambiance doux */}
      <div
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] rounded-full bg-[radial-gradient(ellipse,_rgba(34,37,42,0.03)_0%,_transparent_70%)] blur-3xl -z-10"
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto">
        {/* En-tête de section */}
        <motion.div {...getScrollRevealProps({ y: 16 })} className="mb-8 sm:mb-10 text-center">
          <div className="inline-flex items-center gap-2 mb-4">
            <span className="font-mono text-xs font-semibold uppercase tracking-widest text-[#22252A]">
              05 // CONTACT &amp; ESTIMATION
            </span>
            <span className="h-3 w-px bg-[rgba(34,37,42,0.15)]" />
            <span className="font-mono text-[11px] text-[#6B7480] uppercase tracking-wider">
              Réponse sous 24h
            </span>
          </div>
          <h2 className="font-heading font-extrabold text-3xl sm:text-5xl lg:text-6xl tracking-tight text-[#22252A] leading-[1.08] max-w-3xl mx-auto">
            Votre prochain projet,{" "}
            <em className="font-serif italic font-normal text-[#22252A] not-italic">
              concrètement.
            </em>
          </h2>
        </motion.div>

        {/* Formulaire Soft UI / Neumorphism */}
        <div className="flex justify-center">
          <ContactForm />
        </div>
      </div>
    </section>
  );
}
