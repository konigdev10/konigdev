import React from "react";
import Image from "next/image";
import Link from "next/link";
import SocialLinks from "./SocialLinks";

export default function AboutHero() {
  return (
    <article className="relative w-full rounded-[28px] bg-gradient-to-br from-[#F4F7FA] to-[#EDF1F6] border border-white/95 shadow-contact-card overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
        {/* ================================================================
            COLONNE GAUCHE (TEXTES, BOUTONS, RÉSEAUX)
            ================================================================ */}
        <div className="lg:col-span-7 p-6 sm:p-10 lg:p-14 z-10 flex flex-col justify-center">
          <p className="font-heading font-semibold text-lg sm:text-[22px] text-[#22252A] tracking-tight mb-2">
            Bonjour, je suis
          </p>

          <h1 className="leading-tight mb-3">
            <span className="block font-display font-black text-5xl sm:text-6xl lg:text-[64px] text-[#22252A] tracking-tight">
              Esdras
            </span>
            <span className="block font-display font-extrabold text-2xl sm:text-[28px] text-[#22252A] tracking-tight mt-1">
              Thychel Mboulouékoué
            </span>
          </h1>

          <p className="font-text text-sm sm:text-[15px] font-medium text-[#6B7480] mb-5">
            Développeur full-stack et IA, autodidacte, basé à Brazzaville
          </p>

          <p className="font-text text-sm text-[#4A5663] leading-[1.65] max-w-[54ch] mb-8">
            Je me suis formé seul au développement et je construis aujourd&apos;hui des sites,
            des applications web et mobiles, et des automatisations IA pour des entreprises
            d&apos;Afrique francophone et d&apos;ailleurs. Mon objectif : des outils simples,
            rapides et vraiment utiles à votre activité. Mon entreprise s&apos;appelle KoniG Labs.
            Vous me retrouverez en ligne sous le pseudo KoniG.dev.
          </p>

          {/* Deux boutons d'action */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 mb-6">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-6 py-3.5 rounded-[12px] bg-gradient-to-r from-[#3A3F46] to-[#14161A] text-white font-text text-xs font-bold uppercase tracking-wider shadow-btn-submit transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#22252A] focus-visible:outline-offset-2"
            >
              Parlons de votre projet
            </Link>

            <Link
              href="/services"
              className="inline-flex items-center justify-center px-6 py-3.5 rounded-[12px] bg-white text-[#22252A] font-text text-xs font-semibold tracking-wider shadow-pill-relief border border-white/95 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#22252A] focus-visible:outline-offset-2"
            >
              Voir mes services
            </Link>
          </div>

          {/* 4 liens ronds */}
          <SocialLinks />
        </div>

        {/* ================================================================
            COLONNE DROITE (HALO, PHOTO DÉTOURÉE, DÉCORS CHROMÉS)
            ================================================================ */}
        <div className="lg:col-span-5 relative h-[420px] sm:h-[500px] lg:h-[620px] flex items-end justify-center overflow-hidden">
          {/* Grand cercle très clair en arrière-plan avec halo doux */}
          <div
            className="pointer-events-none absolute bottom-[-40px] left-1/2 -translate-x-1/2 w-[340px] sm:w-[440px] h-[340px] sm:h-[440px] rounded-full bg-[radial-gradient(circle,_rgba(255,255,255,0.95)_0%,_rgba(255,255,255,0.45)_50%,_rgba(238,242,247,0)_72%)] z-[1]"
            aria-hidden="true"
          />

          {/* Décor chromé 1 : anneau (torus) avec flottement doux (6s infinite) */}
          <div
            className="pointer-events-none absolute top-16 left-12 w-14 h-14 z-[4] drop-shadow-[0_12px_20px_rgba(110,125,145,0.32)] animate-[chromeFloat_6s_ease-in-out_infinite] motion-reduce:animate-none"
            aria-hidden="true"
          >
            <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="chromeTorusAbout" x1="10%" y1="10%" x2="90%" y2="90%">
                  <stop offset="0%" stopColor="#FFFFFF" />
                  <stop offset="20%" stopColor="#E2E8F0" />
                  <stop offset="45%" stopColor="#94A3B8" />
                  <stop offset="70%" stopColor="#FFFFFF" />
                  <stop offset="90%" stopColor="#64748B" />
                  <stop offset="100%" stopColor="#334155" />
                </linearGradient>
              </defs>
              <path
                d="M50 14 C30.12 14 14 30.12 14 50 C14 69.88 30.12 86 50 86 C69.88 86 86 69.88 86 50 C86 30.12 69.88 14 50 14 Z M50 28 C62.15 28 72 37.85 72 50 C72 62.15 62.15 72 50 72 C37.85 72 28 62.15 28 50 C28 37.85 37.85 28 50 28 Z"
                fill="url(#chromeTorusAbout)"
              />
            </svg>
          </div>

          {/* Décor chromé 2 : petite sphère avec flottement doux */}
          <div
            className="pointer-events-none absolute bottom-28 right-12 w-7 h-7 z-[4] drop-shadow-[0_8px_16px_rgba(110,125,145,0.35)] animate-[chromeFloat_6s_ease-in-out_infinite_reverse] motion-reduce:animate-none"
            aria-hidden="true"
          >
            <svg viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <radialGradient id="chromeSphereAbout" cx="30%" cy="28%" r="70%">
                  <stop offset="0%" stopColor="#FFFFFF" />
                  <stop offset="35%" stopColor="#E2E8F0" />
                  <stop offset="75%" stopColor="#64748B" />
                  <stop offset="100%" stopColor="#334155" />
                </radialGradient>
              </defs>
              <circle cx="25" cy="25" r="22" fill="url(#chromeSphereAbout)" />
            </svg>
          </div>

          {/* Photo détourée coupée net par le bord inférieur arrondi */}
          <div className="relative z-[2] w-full max-w-[360px] sm:max-w-[420px] lg:max-w-[460px] h-full flex items-end justify-center pointer-events-none select-none">
            <Image
              src="/konigdev.png"
              alt="Portrait d'Esdras Thychel Mboulouékoué"
              width={520}
              height={680}
              priority
              className="max-h-[380px] sm:max-h-[460px] lg:max-h-[580px] w-auto object-contain object-bottom drop-shadow-[0_20px_35px_rgba(80,95,115,0.18)]"
            />
          </div>
        </div>
      </div>
    </article>
  );
}

