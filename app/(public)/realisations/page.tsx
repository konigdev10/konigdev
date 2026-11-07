import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import ProjectBox from "@/components/projects/ProjectBox";
import Footer from "@/components/Footer";
import { getPublishedProjects } from "@/lib/projects-service";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Réalisations | Konigdev",
  description:
    "Sites, applications et automatisations IA réalisés par Konigdev à Brazzaville.",
};

export default async function RealisationsPage() {
  const projects = await getPublishedProjects();

  const whatsappNumber =
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "242061062936";
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    "Bonjour Esdras, j'ai vu vos réalisations sur votre portfolio et je souhaite discuter d'un projet."
  )}`;

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
            className="hidden sm:inline-flex items-center justify-center px-4 py-2 rounded-xl bg-white text-[#22252A] font-text text-xs font-bold uppercase tracking-wider shadow-[3px_3px_8px_rgba(120,130,145,0.18),-3px_-3px_8px_rgba(255,255,255,0.95)] hover:-translate-y-0.5 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#22252A] focus-visible:outline-offset-2"
          >
            Parlons-en
          </Link>
        </div>
      </header>

      {/* Contenu principal */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 pt-6 pb-20 flex flex-col items-center">
        {/* EN-TÊTE DE LA PAGE avec apparition unique */}
        <div className="w-full max-w-3xl mx-auto text-center mb-6 sm:mb-8 animate-fadeIn">
          <h1 className="font-display font-black text-3xl sm:text-4xl lg:text-[44px] text-[#22252A] tracking-tight leading-tight mb-3">
            Mes réalisations
          </h1>
          <p className="font-text text-sm sm:text-base text-[#4A5663] max-w-[56ch] mx-auto leading-relaxed">
            Sites, applications et automatisations livrés. Ouvrez la boîte pour les découvrir.
          </p>
        </div>

        {/* COMPOSANT DE LA BOÎTE EN CARTON ET SES CARTES */}
        <section
          aria-label="Présentation interactive des réalisations"
          className="w-full flex justify-center my-2 sm:my-4"
        >
          <ProjectBox initialProjects={projects} />
        </section>

        {/* LISTE SEO ACCESSIBLE (sr-only) pour les moteurs de recherche et lecteurs d'écran */}
        <section className="sr-only" aria-label="Liste complète des projets réalisés">
          <h2>Catalogue complet des projets réalisés par Konigdev</h2>
          <ul>
            {projects.map((proj) => (
              <li key={proj.slug}>
                <h3>{proj.nom}</h3>
                <p>Catégorie : {proj.categorie}</p>
                <p>Rôle : {proj.role}</p>
                {proj.annee && <p>Année : {proj.annee}</p>}
                <p>Statut : {proj.statut}</p>
                <p>Description : {proj.resume}</p>
                <p>Outils utilisés : {proj.outils.join(", ")}</p>
                {proj.resultat && <p>Résultat : {proj.resultat}</p>}
              </li>
            ))}
          </ul>
        </section>

        {/* APPEL À L'ACTION FINAL */}
        <section
          aria-label="Discuter d'un projet"
          className="w-full max-w-3xl mx-auto mt-16 sm:mt-24 p-8 sm:p-12 rounded-[28px] bg-gradient-to-br from-[#F4F7FA] to-[#EDF1F6] border border-white/90 shadow-[0_20px_60px_rgba(120,130,145,0.18)] text-center flex flex-col items-center"
        >
          <h2 className="font-display font-black text-2xl sm:text-3xl text-[#22252A] tracking-tight mb-3">
            Un projet en tête ? Parlons-en.
          </h2>
          <p className="font-text text-sm text-[#4A5663] max-w-lg mb-8 leading-relaxed">
            Que vous ayez un cahier des charges précis ou une idée à structurer, échangeons
            directement pour définir les meilleures solutions techniques.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
            <Link
              href="/contact"
              className="w-full sm:w-auto inline-flex items-center justify-center px-7 py-3.5 rounded-2xl bg-gradient-to-r from-[#3A3F46] to-[#14161A] text-white font-text text-xs font-bold uppercase tracking-wider shadow-[0_8px_24px_rgba(20,22,26,0.20)] hover:-translate-y-0.5 active:translate-y-0 transition-transform focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#22252A] focus-visible:outline-offset-2"
            >
              Demander un devis
            </Link>

            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-white text-[#22252A] font-text text-xs font-bold uppercase tracking-wider shadow-[3px_3px_10px_rgba(120,130,145,0.18),-3px_-3px_10px_rgba(255,255,255,0.95)] hover:-translate-y-0.5 active:translate-y-0 transition-transform focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#22252A] focus-visible:outline-offset-2"
            >
              <span>Écrire sur WhatsApp</span>
              <svg
                className="w-4 h-4 text-[#22252A]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
              </svg>
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
