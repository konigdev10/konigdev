"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Project,
  CATEGORY_TO_CONTACT_PARAM,
} from "@/lib/projects-data";

interface ProjectPanelProps {
  project: Project | null;
  onClose: () => void;
  onSelectProject: (project: Project) => void;
  projects: Project[];
}

export default function ProjectPanel({
  project,
  onClose,
  onSelectProject,
  projects,
}: ProjectPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const [displayedProject, setDisplayedProject] = useState<Project | null>(project);
  const [isCrossFading, setIsCrossFading] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Transition de fondu croisé lors du changement de projet sans fermer le panneau
  useEffect(() => {
    if (!project) {
      // Fermeture
      return;
    }

    if (!displayedProject) {
      setDisplayedProject(project);
      setImageError(false);
      return;
    }

    if (displayedProject.slug !== project.slug) {
      setIsCrossFading(true);
      const timer = setTimeout(() => {
        setDisplayedProject(project);
        setImageError(false);
        setIsCrossFading(false);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [project, displayedProject]);

  // Focus sur le titre lors de l'ouverture
  useEffect(() => {
    if (project) {
      const focusTimer = setTimeout(() => {
        titleRef.current?.focus();
      }, 250);
      return () => clearTimeout(focusTimer);
    }
  }, [project]);

  // Gestion de la touche Échap
  useEffect(() => {
    if (!project) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [project, onClose]);

  const isOpen = Boolean(project && displayedProject);
  const currentProject = displayedProject;

  // Calcul du projet précédent et suivant
  const currentIndex = currentProject
    ? projects.findIndex((p) => p.slug === currentProject.slug)
    : -1;
  const prevProject =
    currentIndex > 0 ? projects[currentIndex - 1] : projects[projects.length - 1];
  const nextProject =
    currentIndex < projects.length - 1 ? projects[currentIndex + 1] : projects[0];

  const contactUrl = currentProject
    ? `/contact?projet=${CATEGORY_TO_CONTACT_PARAM[currentProject.categorie] || "site-web"}`
    : "/contact";

  return (
    <aside
      ref={panelRef}
      role="dialog"
      aria-modal="false"
      aria-labelledby="project-panel-title"
      aria-hidden={!isOpen}
      className={`fixed top-3 sm:top-6 bottom-3 sm:bottom-6 left-3 sm:left-6 w-[calc(100vw-24px)] sm:w-[420px] max-w-[92vw] z-50 rounded-[28px] bg-gradient-to-br from-[#F4F7FA] to-[#EDF1F6] border border-white/80 p-6 sm:p-7 overflow-y-auto flex flex-col justify-between shadow-[0_20px_60px_rgba(120,130,145,0.28)] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
        isOpen ? "translate-x-0" : "-translate-x-[115%] pointer-events-none"
      }`}
    >
      {currentProject && (
        <div
          className={`flex flex-col flex-1 transition-opacity duration-200 ${
            isCrossFading ? "opacity-0" : "opacity-100"
          }`}
        >
          {/* Bouton de fermeture rond */}
          <div className="flex items-center justify-between mb-4">
            <span className="font-mono text-[11px] uppercase tracking-wider text-[#6B7480]">
              {currentProject.categorie}
            </span>
            <button
              type="button"
              onClick={onClose}
              aria-label="Fermer la boîte de dialogue du projet"
              className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-[#22252A] shadow-[3px_3px_8px_rgba(120,130,145,0.20),-3px_-3px_8px_rgba(255,255,255,0.95)] hover:-translate-y-0.5 active:translate-y-0 transition-transform focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#22252A] focus-visible:outline-offset-2"
            >
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Vignette du projet (Ratio 16:10) */}
          <div className="relative w-full aspect-[16/10] rounded-[18px] overflow-hidden bg-[#E4E9EF] mb-5 flex items-center justify-center shadow-inner">
            {currentProject.image && !imageError ? (
              <Image
                src={currentProject.image}
                alt={currentProject.nom}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, 420px"
                onError={() => setImageError(true)}
              />
            ) : (
              <span className="font-display font-black text-4xl text-[#22252A]" aria-hidden="true">
                {currentProject.nom.charAt(0)}
              </span>
            )}
          </div>

          {/* Titre et Catégorie */}
          <h2
            id="project-panel-title"
            ref={titleRef}
            tabIndex={-1}
            className="font-display font-black text-2xl sm:text-[26px] text-[#22252A] tracking-tight leading-tight mb-3 outline-none"
          >
            {currentProject.nom}
          </h2>

          {/* Résumé */}
          <p className="font-text text-sm text-[#4A5663] leading-[1.6] mb-5">
            {currentProject.resume}
          </p>

          {/* Métadonnées label / valeur séparées par un filet fin */}
          <div className="border-t border-b border-[#DDE3EA] py-3.5 mb-5 space-y-2.5">
            <div className="flex items-center justify-between font-text text-xs">
              <span className="text-[#6B7480]">Rôle</span>
              <span className="font-semibold text-[#22252A] text-right max-w-[65%]">
                {currentProject.role}
              </span>
            </div>

            {currentProject.annee && (
              <div className="flex items-center justify-between font-text text-xs border-t border-[#EAEFF5] pt-2">
                <span className="text-[#6B7480]">Année</span>
                <span className="font-semibold text-[#22252A]">{currentProject.annee}</span>
              </div>
            )}

            <div className="flex items-center justify-between font-text text-xs border-t border-[#EAEFF5] pt-2">
              <span className="text-[#6B7480]">Statut</span>
              <span className="inline-flex items-center gap-1.5 font-semibold text-[#22252A]">
                <span
                  className={`w-2 h-2 rounded-full ${
                    currentProject.statut === "En ligne"
                      ? "bg-emerald-500"
                      : currentProject.statut === "En cours"
                      ? "bg-amber-500"
                      : "bg-[#6B7480]"
                  }`}
                  aria-hidden="true"
                />
                {currentProject.statut}
              </span>
            </div>
          </div>

          {/* Outils utilisés */}
          <div className="mb-5">
            <span className="block font-mono text-[11px] uppercase tracking-wider text-[#6B7480] mb-2.5">
              Technologies & Outils
            </span>
            <div className="flex flex-wrap gap-2">
              {currentProject.outils.map((outil) => (
                <span
                  key={outil}
                  className="px-3 py-1.5 rounded-xl bg-white font-text text-xs font-medium text-[#22252A] shadow-[2px_2px_6px_rgba(120,130,145,0.14),-2px_-2px_6px_rgba(255,255,255,0.95)]"
                >
                  {outil}
                </span>
              ))}
            </div>
          </div>

          {/* Résultat optionnel */}
          {currentProject.resultat && (
            <div className="p-3.5 rounded-2xl bg-white/70 border border-white mb-6">
              <span className="block font-mono text-[10px] uppercase tracking-wider text-[#6B7480] mb-1">
                Résultat obtenu
              </span>
              <p className="font-text text-xs text-[#4A5663] leading-relaxed">
                {currentProject.resultat}
              </p>
            </div>
          )}

          {/* Boutons d'action */}
          <div className="space-y-3 mb-6">
            {currentProject.lien && (
              <a
                href={currentProject.lien}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-[#3A3F46] to-[#14161A] text-white font-text text-xs font-bold uppercase tracking-wider shadow-[0_6px_20px_rgba(20,22,26,0.22)] hover:-translate-y-0.5 active:translate-y-0 transition-transform focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#22252A] focus-visible:outline-offset-2"
              >
                <span>Voir le projet</span>
                <svg
                  className="w-3.5 h-3.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
              </a>
            )}

            <Link
              href={contactUrl}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white text-[#22252A] font-text text-xs font-bold uppercase tracking-wider shadow-[3px_3px_10px_rgba(120,130,145,0.18),-3px_-3px_10px_rgba(255,255,255,0.95)] hover:-translate-y-0.5 active:translate-y-0 transition-transform focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#22252A] focus-visible:outline-offset-2"
            >
              <span>Discuter d&apos;un projet similaire</span>
              <svg
                className="w-3.5 h-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
          </div>

          {/* Navigation en bas : Projet précédent / Projet suivant */}
          <div className="pt-4 border-t border-[#DDE3EA] flex items-center justify-between font-text text-xs">
            <button
              type="button"
              onClick={() => onSelectProject(prevProject)}
              className="inline-flex items-center gap-1.5 text-[#6B7480] hover:text-[#22252A] font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#22252A] rounded-md px-1.5 py-1"
            >
              <svg
                className="w-3.5 h-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
              <span>Précédent</span>
            </button>

            <span className="font-mono text-[11px] text-[#6B7480]">
              {currentIndex + 1} / {projects.length}
            </span>

            <button
              type="button"
              onClick={() => onSelectProject(nextProject)}
              className="inline-flex items-center gap-1.5 text-[#6B7480] hover:text-[#22252A] font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#22252A] rounded-md px-1.5 py-1"
            >
              <span>Suivant</span>
              <svg
                className="w-3.5 h-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}

