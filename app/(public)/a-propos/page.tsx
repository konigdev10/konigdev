import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import Script from "next/script";
import AboutHero from "@/components/about/AboutHero";
import IdentityCard from "@/components/about/IdentityCard";
import Timeline from "@/components/about/Timeline";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "À propos | Esdras Thychel Mboulouékoué (KoniG.dev) — Développeur Full-Stack & IA",
  description:
    "Découvrez le parcours, la fiche d'identité et la boîte à outils d'Esdras Thychel Mboulouékoué, développeur autodidacte et fondateur de KoniG Labs à Brazzaville.",
};

const PERSON_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Esdras Thychel Mboulouékoué",
  alternateName: "KoniG.dev",
  jobTitle: "Développeur Full-Stack & IA",
  worksFor: {
    "@type": "Organization",
    name: "KoniG Labs",
  },
  url: "https://konigdev.vercel.app",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Brazzaville",
    addressCountry: "CG",
  },
  sameAs: [
    "https://github.com/konigdev2286",
    "https://www.linkedin.com/in/esdras-thychel-mbouloukoue-07168a400",
    "https://www.tiktok.com/@konig.dev22",
  ],
};

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#EEF2F7] via-[#F5F8FC] to-[#EEF2F7] text-[#22252A] overflow-x-hidden">
      {/* Données structurées JSON-LD */}
      <Script
        id="person-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(PERSON_JSON_LD) }}
      />

      {/* Navigation supérieure */}
      <header className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 pt-8 pb-4 flex items-center justify-between z-20">
        <Link
          href="/"
          className="inline-flex items-center gap-2 font-text text-xs font-semibold text-[#4A5663] hover:text-[#22252A] transition-colors group focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#22252A] focus-visible:outline-offset-2 rounded-md py-1 px-2"
          aria-label="Retourner à l'accueil"
        >
          {/* Flèche SVG faite main */}
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

        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="group flex items-center gap-2 font-display font-extrabold text-xl tracking-tight text-[#22252A]"
            aria-label="Accueil Konigdev"
          >
            <div className="relative w-7 h-7 shrink-0 transition-transform duration-200 group-hover:scale-105">
              <Image
                src="/logo.png"
                alt="Logo KoniG.dev"
                fill
                sizes="28px"
                priority
                className="object-contain"
              />
            </div>
            <span>konig<span className="text-[#3A3F46]">.</span></span>
          </Link>
          <Link
            href="/contact"
            className="hidden sm:inline-flex items-center justify-center px-4 py-2 rounded-xl bg-gradient-to-br from-[#3A3F46] to-[#14161A] text-white font-text text-[10px] font-bold uppercase tracking-wider shadow-btn-submit hover:-translate-y-0.5 transition-all"
          >
            Me contacter
          </Link>
        </div>
      </header>

      {/* Contenu principal de la page avec animation d'apparition douce au chargement */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-8 sm:py-12 animate-fade-slide-up motion-reduce:transform-none motion-reduce:opacity-100">
        {/* ==================================================================
            PARTIE 1 : PRÉSENTATION EN DEUX COLONNES AVEC PHOTO DÉTOURÉE
            ================================================================== */}
        <AboutHero />

        {/* ==================================================================
            PARTIE 2 : FICHE D'IDENTITÉ ET BOÎTE À OUTILS
            ================================================================== */}
        <IdentityCard />

        {/* ==================================================================
            PARTIE 3 : PARCOURS EN CHAPITRES
            ================================================================== */}
        <Timeline />

        {/* Bannière de contact finale */}
        <section className="w-full my-16 sm:my-20 p-8 sm:p-12 rounded-[28px] bg-gradient-to-br from-[#F4F7FA] to-[#EDF1F6] border border-white/95 shadow-contact-card text-center flex flex-col items-center">
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-[#22252A] tracking-tight mb-2">
            Envie de collaborer ensemble ?
          </h2>
          <p className="font-text text-sm text-[#4A5663] max-w-[48ch] leading-relaxed mb-6">
            Je suis disponible pour échanger sur vos projets de création web, d&apos;applications
            ou d&apos;automatisations d&apos;entreprise.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#3A3F46] to-[#14161A] text-white font-text text-xs font-bold uppercase tracking-wider shadow-btn-submit hover:-translate-y-0.5 transition-all"
          >
            Démarrer une conversation
          </Link>
        </section>
      </main>

      {/* Footer épuré avec lettres KoniGDeV */}
      <Footer />
    </div>
  );
}

