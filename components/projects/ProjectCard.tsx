"use client";

import React, { useState } from "react";
import Image from "next/image";
import type { Project } from "@/lib/projects-data";

interface ProjectCardProps {
  project: Project;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  tabIndex?: number;
  ariaHidden?: boolean;
  isActive?: boolean;
  compactList?: boolean;
}

export default function ProjectCard({
  project,
  onClick,
  tabIndex = 0,
  ariaHidden = false,
  isActive = false,
  compactList = false,
}: ProjectCardProps) {
  const [imageError, setImageError] = useState(false);
  const initial = project.nom.trim().charAt(0) || "P";

  if (compactList) {
    return (
      <button
        type="button"
        onClick={onClick}
        tabIndex={tabIndex}
        aria-hidden={ariaHidden}
        aria-label={`Voir le projet ${project.nom}`}
        className={`w-full flex items-center gap-3 p-3 text-left rounded-2xl bg-white transition-all duration-200 hover:-translate-y-0.5 focus-visible:-translate-y-0.5 shadow-[3px_3px_10px_rgba(120,130,145,0.18),-3px_-3px_10px_rgba(255,255,255,0.95)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#22252A] focus-visible:outline-offset-2 ${
          isActive ? "ring-2 ring-[#22252A]" : ""
        }`}
      >
        <div className="relative w-14 h-14 flex-shrink-0 rounded-xl overflow-hidden bg-[#E4E9EF] flex items-center justify-center">
          {project.image && !imageError ? (
            <Image
              src={project.image}
              alt={project.nom}
              fill
              className="object-cover"
              sizes="56px"
              onError={() => setImageError(true)}
            />
          ) : (
            <span className="font-display font-black text-lg text-[#22252A]" aria-hidden="true">
              {initial}
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <span className="block font-mono text-[10px] uppercase tracking-wider text-[#6B7480]">
            {project.categorie}
          </span>
          <p className="font-text font-bold text-xs text-[#22252A] truncate">
            {project.nom}
          </p>
        </div>
        <svg
          className="w-4 h-4 text-[#6B7480] flex-shrink-0"
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
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      tabIndex={tabIndex}
      aria-hidden={ariaHidden}
      aria-label={`Voir le projet ${project.nom}`}
      className={`group relative flex flex-col w-[128px] sm:w-[150px] h-[175px] sm:h-[190px] p-2.5 sm:p-3 text-left rounded-[20px] bg-white transition-all duration-200 select-none shadow-[4px_4px_12px_rgba(120,130,145,0.20),-4px_-4px_12px_rgba(255,255,255,0.95)] hover:-translate-y-1.5 focus-visible:-translate-y-1.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#22252A] focus-visible:outline-offset-[3px] ${
        isActive ? "ring-2 ring-[#22252A]" : ""
      }`}
    >
      {/* Vignette en ratio 4:3 */}
      <div className="relative w-full aspect-[4/3] rounded-[14px] overflow-hidden bg-[#E4E9EF] flex items-center justify-center flex-shrink-0">
        {project.image && !imageError ? (
          <Image
            src={project.image}
            alt={project.nom}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 128px, 150px"
            onError={() => setImageError(true)}
          />
        ) : (
          <span className="font-display font-black text-2xl text-[#22252A]" aria-hidden="true">
            {initial}
          </span>
        )}
      </div>

      {/* Détails du projet */}
      <div className="flex flex-col justify-center flex-1 mt-2 min-w-0">
        <span className="font-mono text-[9px] sm:text-[10px] text-[#6B7480] uppercase tracking-wider block truncate">
          {project.categorie}
        </span>
        <h3 className="font-text font-bold text-xs sm:text-[13px] text-[#22252A] leading-tight line-clamp-2 mt-0.5">
          {project.nom}
        </h3>
      </div>
    </button>
  );
}

