import React from "react";
import ProjectBox from "@/components/projects/ProjectBox";
import { getPublishedProjects } from "@/lib/projects-service";

export default async function PortfolioProject() {
  const projects = await getPublishedProjects();

  return (
    <section
      id="projets"
      className="relative w-full py-12 sm:py-16 px-4 sm:px-6 lg:px-12 bg-gradient-to-b from-[#EEF2F7] via-[#F5F8FC] to-[#EEF2F7] border-t border-[rgba(34,37,42,0.06)] text-[#22252A] scroll-mt-20 overflow-hidden"
      aria-label="Réalisations — Projets réalisés par Konigdev"
    >
      {/* Halo lumineux très doux en arrière-plan */}
      <div
        className="pointer-events-none absolute top-10 right-1/4 w-96 h-96 rounded-full bg-white/70 blur-3xl -z-10"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute bottom-10 left-1/4 w-96 h-96 rounded-full bg-white/60 blur-3xl -z-10"
        aria-hidden="true"
      />

      <div className="w-full max-w-7xl mx-auto flex flex-col items-center">
        {/* En-tête de section */}
        <div className="w-full max-w-3xl mx-auto text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 border border-white font-mono text-[10px] text-[#6B7480] uppercase tracking-wider shadow-sm mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#22252A]" />
            <span>Travaux livrés & Projets</span>
          </div>

          <h2 className="font-display font-black text-3xl sm:text-4xl lg:text-[44px] text-[#22252A] tracking-tight leading-tight mb-3">
            Mes réalisations
          </h2>

          <p className="font-text text-sm sm:text-base text-[#4A5663] max-w-[56ch] mx-auto leading-relaxed">
            Sites, applications et automatisations livrés. Ouvrez la boîte pour les découvrir.
          </p>
        </div>

        {/* Boîte interactive 3D et éventail de cartes */}
        <div className="w-full flex justify-center my-2 sm:my-4">
          <ProjectBox initialProjects={projects} />
        </div>

        {/* Liste SEO accessible pour les moteurs de recherche et lecteurs d'écran */}
        <div className="sr-only" aria-label="Liste des réalisations de Konigdev">
          <h3>Catalogue complet des réalisations</h3>
          <ul>
            {projects.map((proj) => (
              <li key={proj.slug}>
                <h4>{proj.nom}</h4>
                <p>Catégorie : {proj.categorie}</p>
                <p>Rôle : {proj.role}</p>
                {proj.annee && <p>Année : {proj.annee}</p>}
                <p>Statut : {proj.statut}</p>
                <p>Description : {proj.resume}</p>
                <p>Technologies : {proj.outils.join(", ")}</p>
                {proj.resultat && <p>Résultat : {proj.resultat}</p>}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
