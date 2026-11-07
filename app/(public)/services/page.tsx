import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import ServiceStack from "@/components/services/ServiceStack";
import PacksTable from "@/components/services/PacksTable";
import Process from "@/components/services/Process";
import Faq from "@/components/services/Faq";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Services & Tarifs | KoniG.dev — Sites, Applications & IA",
  description:
    "Découvrez les offres de développement web Next.js, applications Flutter, flux d'automatisation IA et design d'interfaces proposées par KoniG.dev à Brazzaville.",
};

export default function ServicesPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#EEF2F7] via-[#F5F8FC] to-[#EEF2F7] text-[#22252A] overflow-x-hidden">
      {/* Navigation supérieure */}
      <header className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 pt-8 pb-4 flex items-center justify-between z-20">
        <Link
          href="/"
          className="inline-flex items-center gap-2 font-text text-xs font-semibold text-[#4A5663] hover:text-[#22252A] transition-colors group focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#22252A] focus-visible:outline-offset-2 rounded-md py-1 px-2"
          aria-label="Retour à l'accueil"
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
            Devis gratuit
          </Link>
        </div>
      </header>

      {/* Contenu principal avec une seule animation d'apparition douce au chargement */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-10 sm:py-16 animate-fade-slide-up motion-reduce:transform-none motion-reduce:opacity-100">
        {/* ==================================================================
            SECTION 1 : EN-TÊTE
            ================================================================== */}
        <section className="mb-14 sm:mb-20 text-center sm:text-left">
          <h1 className="font-display font-black text-[34px] sm:text-[44px] text-[#22252A] tracking-tight leading-[1.12] mb-4">
            Ce que je peux faire pour vous
          </h1>
          <p className="font-text text-sm sm:text-base text-[#4A5663] max-w-[56ch] leading-relaxed">
            Sites, applications, automatisations IA et design. Chaque projet
            commence par un échange gratuit, puis un devis clair.
          </p>
        </section>

        {/* ==================================================================
            SECTION 2 : LA PILE DE CARTES INTERACTIVE
            ================================================================== */}
        <ServiceStack />

        {/* ==================================================================
            SECTION 3 : TABLEAU COMPARATIF DES PACKS
            ================================================================== */}
        <PacksTable />

        {/* ==================================================================
            SECTION 4 : ÉTAPES DE COLLABORATION
            ================================================================== */}
        <Process />

        {/* ==================================================================
            SECTION 5 : QUESTIONS FRÉQUENTES (FAQ)
            ================================================================== */}
        <Faq />

        {/* ==================================================================
            SECTION 6 : BANNIÈRE D'APPEL À L'ACTION
            ================================================================== */}
        <section className="w-full my-20 p-8 sm:p-14 rounded-[28px] bg-gradient-to-br from-[#F4F7FA] to-[#EDF1F6] border border-white/95 shadow-contact-card text-center flex flex-col items-center">
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-[#22252A] tracking-tight mb-3">
            Vous avez un projet en tête ?
          </h2>
          <p className="font-text text-sm text-[#4A5663] max-w-[50ch] leading-relaxed mb-8">
            Discutons de vos besoins et voyons ensemble la meilleure façon de concrétiser votre vision.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Link
              href="/contact"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#3A3F46] to-[#14161A] text-white font-text text-xs font-bold uppercase tracking-wider shadow-btn-submit hover:-translate-y-0.5 transition-all"
            >
              Démarrer une conversation
            </Link>
            <a
              href="https://wa.me/242061062936?text=Bonjour%20Konigdev,%20je%20souhaite%20des%20renseignements%20sur%20vos%20services."
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white text-[#22252A] font-text text-xs font-semibold tracking-wider shadow-pill-relief border border-white/95 hover:-translate-y-0.5 transition-all"
            >
              Écrire sur WhatsApp
            </a>
          </div>
        </section>
      </main>

      {/* Footer épuré avec lettres KoniGDeV */}
      <Footer />
    </div>
  );
}

