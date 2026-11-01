import type { Metadata } from "next";
import Link from "next/link";
import ContactForm from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Contact | KoniG.dev — Parlons de votre projet",
  description:
    "Formulaire de contact pour vos projets web, applications mobiles et automatisations IA avec Esdras Thychel MBOULOUKOUE (KoniG.dev). Réponse sous 24 heures.",
};

export default function ContactPage() {
  return (
    <main className="relative min-h-screen w-full bg-gradient-to-b from-[#EEF2F7] via-[#F5F8FC] to-[#EEF2F7] py-12 sm:py-20 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center overflow-hidden">
      {/* Sphères douces décoratives en arrière-plan (Soft UI) */}
      <div
        className="pointer-events-none absolute -top-10 -left-10 w-44 h-44 rounded-full bg-gradient-to-br from-white/90 via-[#E4EBF5]/60 to-[#CCD8E8]/30 blur-2xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute top-1/3 -right-12 w-52 h-52 rounded-full bg-gradient-to-br from-white/95 via-[#E6EDF6]/50 to-[#CCD8E8]/20 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-10 left-1/4 w-60 h-60 rounded-full bg-gradient-to-br from-white/90 via-[#E4EBF5]/50 to-[#CCD8E8]/20 blur-3xl"
        aria-hidden="true"
      />

      {/* Barre retour navigation supérieure */}
      <div className="w-full max-w-[860px] mx-auto mb-6 flex items-center justify-between z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 font-text text-xs font-semibold text-[#4A5663] hover:text-[#22252A] transition-colors group focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#22252A] focus-visible:outline-offset-2 rounded-md py-1 px-2"
          aria-label="Retourner à l'accueil"
        >
          {/* Flèche SVG écrite à la main */}
          <svg
            className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-1 text-[#22252A]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          <span>Retour à l&apos;accueil</span>
        </Link>

        <span className="font-display font-extrabold text-sm text-[#22252A] tracking-tight">
          konig<span className="text-[#3A3F46]">.</span>
        </span>
      </div>

      {/* Carte du formulaire Soft UI */}
      <div className="w-full z-10 flex justify-center">
        <ContactForm />
      </div>
    </main>
  );
}

