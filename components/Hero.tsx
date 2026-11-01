"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import NavAnimatedButton from "@/components/NavAnimatedButton";
import { SITE_CONFIG } from "@/lib/constants";

export default function Hero() {
  return (
    <section
      id="accueil"
      className="relative w-full min-h-screen flex flex-col justify-between overflow-hidden bg-gradient-to-br from-[#FFFFFF] via-[#F8FAFD] to-[#EDF2F7] border-b border-[rgba(34,37,42,0.08)] select-none"
      aria-label="Accueil — Konigdev"
    >
      {/* ====================================================================
          NAVBAR DU NOUVEAU HERO (SEULE NAVBAR DU SITE)
          ==================================================================== */}
      <header className="relative z-30 w-full flex items-center justify-between px-6 sm:px-12 lg:px-16 pt-7 pb-4">
        {/* Logo */}
        <Link
          href="/"
          className="group flex items-center font-heading font-extrabold text-2xl tracking-tight text-[#22252A]"
          aria-label="Accueil Konigdev"
        >
          konig<span className="text-[#3A3F46]">.</span>
        </Link>

        {/* Menu central */}
        <nav
          aria-label="Navigation principale"
          className="hidden md:flex items-center gap-10"
        >
          <a
            href="#accueil"
            className="relative py-1 font-sans text-xs font-semibold text-[#22252A] tracking-wide"
          >
            Accueil
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-[2.5px] bg-[#22252A] rounded-full" />
          </a>
          <a
            href="#projets"
            className="py-1 font-sans text-xs font-medium text-[#6B7480] hover:text-[#22252A] tracking-wide transition-colors"
          >
            Réalisations
          </a>
          <a
            href="#services"
            className="py-1 font-sans text-xs font-medium text-[#6B7480] hover:text-[#22252A] tracking-wide transition-colors"
          >
            Services
          </a>
          <a
            href="#a-propos"
            className="py-1 font-sans text-xs font-medium text-[#6B7480] hover:text-[#22252A] tracking-wide transition-colors"
          >
            À propos
          </a>
        </nav>

        {/* Bouton CTA PARLONS-EN avec animation Uiverse interactive */}
        <NavAnimatedButton href={SITE_CONFIG.whatsapp.url} />
      </header>

      {/* ====================================================================
          CORPS DU HERO (PLEINE LARGEUR, COLLÉ AUX BORDS)
          ==================================================================== */}
      <div className="relative flex-1 w-full flex flex-col lg:block px-6 sm:px-12 lg:px-16 pt-2 pb-0">

        {/* HALOS LUMINEUX BLANCS EN FOND */}
        <div
          className="pointer-events-none absolute bottom-[-50px] left-1/2 -translate-x-1/2 w-[600px] sm:w-[720px] h-[600px] sm:h-[720px] rounded-full bg-[radial-gradient(circle,_rgba(255,255,255,0.98)_0%,_rgba(255,255,255,0.55)_45%,_rgba(237,242,247,0)_72%)] z-[1]"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute top-[15%] left-[12%] w-[420px] h-[420px] rounded-full bg-[radial-gradient(circle,_rgba(255,255,255,0.8)_0%,_rgba(240,245,252,0)_70%)] blur-2xl z-[1]"
          aria-hidden="true"
        />

        {/* ================= DÉCORS 3D CHROMÉS ARGENTÉS ================= */}
        {/* 1) Torus au-dessus à gauche de l'épaule */}
        <motion.div
          animate={{ y: [0, -12, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 7, ease: "easeInOut", repeat: Infinity }}
          className="hidden lg:block absolute left-[340px] top-[100px] w-[64px] h-[64px] pointer-events-none z-[8] drop-shadow-[0_14px_22px_rgba(110,125,145,0.32)]"
          aria-hidden="true"
        >
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="chromeTorusEdge" x1="10%" y1="10%" x2="90%" y2="90%">
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
              fill="url(#chromeTorusEdge)"
            />
          </svg>
        </motion.div>

        {/* 2) Petite sphère chromée */}
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 5.5, ease: "easeInOut", repeat: Infinity, delay: 1 }}
          className="hidden lg:block absolute left-[190px] bottom-[210px] w-7 h-7 pointer-events-none z-[8] drop-shadow-[0_8px_16px_rgba(110,125,145,0.35)]"
          aria-hidden="true"
        >
          <svg viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <radialGradient id="chromeSphereEdge" cx="30%" cy="28%" r="70%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="35%" stopColor="#E2E8F0" />
                <stop offset="75%" stopColor="#64748B" />
                <stop offset="100%" stopColor="#334155" />
              </radialGradient>
            </defs>
            <circle cx="25" cy="25" r="22" fill="url(#chromeSphereEdge)" />
          </svg>
        </motion.div>

        {/* ================= COLONNE GAUCHE (TEXTES & LIENS) ================= */}
        <div className="relative lg:absolute lg:left-16 lg:top-[50%] lg:-translate-y-1/2 w-full lg:w-[380px] z-20 flex flex-col items-center lg:items-start text-center lg:text-left mb-8 lg:mb-0">
          <p className="font-heading font-semibold text-lg sm:text-2xl text-[#22252A] tracking-tight mb-1">
            Bonjour, je suis
          </p>
          <h1 className="font-display font-black text-4xl sm:text-5xl lg:text-[48px] text-[#22252A] tracking-tight uppercase leading-none whitespace-nowrap mb-5">
            KONIGDEV
          </h1>
          <p className="font-sans text-[11px] sm:text-xs text-[#4A5663] leading-relaxed max-w-[340px] mb-7 font-normal">
            Développeur full-stack et IA autodidacte, basé à Brazzaville. Je conçois
            des sites web, des applications mobiles et des automatisations IA pour des
            entreprises d&apos;Afrique francophone et d&apos;ailleurs.
          </p>

          {/* Pastille e-mail + 3 boutons sociaux dessous */}
          <div className="flex flex-col items-center lg:items-start gap-3">
            <a
              href={`mailto:${SITE_CONFIG.email}`}
              className="inline-flex items-center px-4 py-1.5 rounded-full bg-white text-[#22252A] font-sans text-[9px] font-semibold tracking-wide shadow-card hover:-translate-y-0.5 transition-transform border border-white/95"
            >
              {SITE_CONFIG.email}
            </a>

            <div className="flex items-center gap-2.5">
              {/* 1) Email : cercle noir charbon #22252A */}
              <a
                href={`mailto:${SITE_CONFIG.email}`}
                aria-label="Envoyer un email"
                className="w-8 h-8 rounded-full bg-[#22252A] hover:bg-[#14161A] text-white flex items-center justify-center shadow-md hover:-translate-y-0.5 transition-all"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </a>

              {/* 2) GitHub : cercle blanc, logo noir */}
              <a
                href={SITE_CONFIG.github.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub Konigdev"
                className="w-8 h-8 rounded-full bg-white hover:bg-slate-50 text-[#22252A] flex items-center justify-center shadow-card hover:-translate-y-0.5 transition-all border border-white/95"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
              </a>

              {/* 3) LinkedIn : cercle blanc, logo noir */}
              <a
                href={SITE_CONFIG.linkedin.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn Konigdev"
                className="w-8 h-8 rounded-full bg-white hover:bg-slate-50 text-[#22252A] flex items-center justify-center shadow-card hover:-translate-y-0.5 transition-all border border-white/95"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>

              {/* 4) TikTok : cercle blanc, logo noir */}
              <a
                href={SITE_CONFIG.tiktok.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok Konigdev"
                className="w-8 h-8 rounded-full bg-white hover:bg-slate-50 text-[#22252A] flex items-center justify-center shadow-card hover:-translate-y-0.5 transition-all border border-white/95"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.76a4.85 4.85 0 01-1.01-.07z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* ================= PERSONNAGE AU CENTRE ================= */}
        <div className="relative lg:absolute lg:left-1/2 lg:-translate-x-1/2 lg:bottom-0 flex justify-center items-end z-10 pointer-events-none w-full lg:w-auto h-[340px] sm:h-[420px] lg:h-[76%] max-h-[520px]">
          <div className="relative w-full max-w-[320px] sm:max-w-[380px] lg:max-w-[420px] h-full flex items-end justify-center">
            <Image
              src="/konigdev.png"
              alt="Portrait de Konigdev — Esdras Thychel Mbouloukoue"
              width={280}
              height={460}
              priority
              className="max-h-[340px] sm:max-h-[420px] lg:max-h-[500px] w-auto object-contain object-bottom drop-shadow-[0_20px_35px_rgba(80,95,115,0.18)]"
            />
          </div>
        </div>

        {/* ================= COLONNE DROITE : 3 CARTES EN ZIG-ZAG ================= */}
        <div className="relative lg:static w-full flex flex-col items-center lg:block gap-6 mt-8 lg:mt-0 z-20">

          {/* CARTE 1 (Haut) : Applications mobiles Flutter */}
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 6, ease: "easeInOut", repeat: Infinity }}
            className="lg:absolute lg:right-[220px] lg:top-[50px] flex flex-col items-center"
          >
            <div className="p-2.5 bg-white rounded-[18px] shadow-floating border border-white/95 hover:scale-105 transition-transform duration-300">
              <div className="w-[140px] h-[86px] rounded-[11px] bg-gradient-to-br from-[#F3F7FA] to-[#E9F0F7] p-2 flex items-center justify-center gap-1.5 border border-[#EBF1F7] overflow-hidden">
                {/* Téléphone 1 */}
                <div className="w-[40px] h-[70px] bg-white rounded-md border-[1.5px] border-[#22252A] p-1 shadow-sm flex flex-col">
                  <div className="w-2.5 h-[1.5px] bg-[#22252A] rounded-full mx-auto mb-1" />
                  <div className="w-3/4 h-[2px] bg-[#D5DEE8] rounded-full mb-1" />
                  <div className="flex items-end gap-0.5 h-6 bg-[#F4F7FA] p-0.5 rounded my-auto">
                    <div className="flex-1 bg-[#A0ACB9] h-[40%] rounded-[1px]" />
                    <div className="flex-1 bg-[#22252A] h-[85%] rounded-[1px]" />
                    <div className="flex-1 bg-[#A0ACB9] h-[55%] rounded-[1px]" />
                    <div className="flex-1 bg-[#22252A] h-[95%] rounded-[1px]" />
                  </div>
                  <div className="w-full h-[2px] bg-[#D5DEE8] rounded-full mt-auto" />
                </div>
                {/* Téléphone 2 en arrière-plan */}
                <div className="w-[36px] h-[64px] bg-white rounded-md border border-[#8C98A7] p-1 opacity-80 scale-95 flex flex-col">
                  <div className="w-2 h-[1.5px] bg-[#8C98A7] rounded-full mx-auto mb-1" />
                  <div className="flex items-end gap-0.5 h-5 bg-[#F4F7FA] p-0.5 rounded my-auto">
                    <div className="flex-1 bg-[#22252A] h-[65%] rounded-[1px]" />
                    <div className="flex-1 bg-[#A0ACB9] h-[40%] rounded-[1px]" />
                  </div>
                </div>
              </div>
            </div>
            {/* Connecteur */}
            <div className="flex flex-col items-center h-[18px]">
              <div className="w-[1.5px] h-3 bg-[#22252A]/20" />
              <div className="w-1.5 h-1.5 rounded-full bg-[#22252A]" />
            </div>
            <span className="px-3.5 py-1 bg-white text-[#22252A] font-sans text-[8.5px] font-bold rounded-lg shadow-card border border-white/95 whitespace-nowrap">
              Applications mobiles Flutter
            </span>
          </motion.div>

          {/* CARTE 2 (Milieu droite) : Automatisation IA */}
          <motion.div
            animate={{ y: [0, -9, 0] }}
            transition={{ duration: 6, ease: "easeInOut", repeat: Infinity, delay: 1.8 }}
            className="lg:absolute lg:right-[55px] lg:top-[245px] flex flex-col items-center"
          >
            <div className="p-2.5 bg-white rounded-[18px] shadow-floating border border-white/95 hover:scale-105 transition-transform duration-300">
              <div className="relative w-[140px] h-[86px] rounded-[11px] bg-[#F8FAFD] px-3.5 flex items-center justify-between border border-[#EBF1F7] overflow-hidden">
                {/* Fil de connexion pointillé */}
                <div className="absolute left-5 right-5 top-1/2 -translate-y-1/2 h-[1.5px] border-b border-dashed border-[#9BA7B7]" />
                {/* Nœud 1 Déclencheur */}
                <div className="relative z-10 w-6 h-6 rounded-md bg-white border-[1.5px] border-[#CCD5DF] flex items-center justify-center shadow-xs">
                  <svg className="w-3 h-3 text-[#22252A]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                  </svg>
                </div>
                {/* Nœud 2 IA Noir Charbon */}
                <div className="relative z-10 w-6 h-6 rounded-md bg-[#22252A] text-white flex items-center justify-center shadow-md">
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2a4 4 0 0 0-4 4v1a4 4 0 0 0-4 4v2a4 4 0 0 0 4 4 4 4 0 0 0 4-4v-1a4 4 0 0 0 4-4v-2a4 4 0 0 0-4-4V6a4 4 0 0 0-4-4z" />
                  </svg>
                </div>
                {/* Nœud 3 Action */}
                <div className="relative z-10 w-6 h-6 rounded-md bg-white border-[1.5px] border-[#CCD5DF] flex items-center justify-center shadow-xs">
                  <svg className="w-3 h-3 text-[#22252A]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
              </div>
            </div>
            {/* Connecteur */}
            <div className="flex flex-col items-center h-[18px]">
              <div className="w-[1.5px] h-3 bg-[#22252A]/20" />
              <div className="w-1.5 h-1.5 rounded-full bg-[#22252A]" />
            </div>
            <span className="px-3.5 py-1 bg-white text-[#22252A] font-sans text-[8.5px] font-bold rounded-lg shadow-card border border-white/95 whitespace-nowrap">
              Automatisation IA
            </span>
          </motion.div>

          {/* CARTE 3 (Bas) : Développeur Next.js */}
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 6, ease: "easeInOut", repeat: Infinity, delay: 3.2 }}
            className="lg:absolute lg:right-[185px] lg:bottom-[45px] flex flex-col items-center"
          >
            <div className="p-2.5 bg-white rounded-[18px] shadow-floating border border-white/95 hover:scale-105 transition-transform duration-300">
              <div className="w-[140px] h-[86px] rounded-[11px] bg-white p-2 flex flex-col gap-1 border border-[#EBF1F7] overflow-hidden">
                <div className="flex items-center justify-between pb-1 border-b border-[#EEF3F8]">
                  <div className="flex gap-1">
                    <span className="w-1 h-1 rounded-full bg-[#B4BFCC]" />
                    <span className="w-1 h-1 rounded-full bg-[#B4BFCC]" />
                    <span className="w-1 h-1 rounded-full bg-[#B4BFCC]" />
                  </div>
                  <span className="text-[6px] font-bold text-[#22252A] tracking-wider">NEXT.JS</span>
                </div>
                <div className="flex gap-1 flex-1">
                  <div className="w-4 bg-[#F3F7FA] rounded" />
                  <div className="flex-1 flex flex-col gap-1">
                    <div className="flex-1 bg-[#F8FAFD] rounded border border-[#EAF0F6] flex items-center justify-center p-0.5">
                      <svg className="w-full h-4" viewBox="0 0 60 20">
                        <path d="M2 15 Q 15 4, 30 11 T 58 5" fill="none" stroke="#22252A" strokeWidth="1.8" strokeLinecap="round" />
                        <circle cx="58" cy="5" r="2.2" fill="#22252A" />
                      </svg>
                    </div>
                    <div className="flex gap-1 h-3">
                      <div className="flex-1 bg-[#EEF3F8] rounded-xs" />
                      <div className="flex-1 bg-[#EEF3F8] rounded-xs" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Connecteur */}
            <div className="flex flex-col items-center h-[18px]">
              <div className="w-[1.5px] h-3 bg-[#22252A]/20" />
              <div className="w-1.5 h-1.5 rounded-full bg-[#22252A]" />
            </div>
            <span className="px-3.5 py-1 bg-white text-[#22252A] font-sans text-[8.5px] font-bold rounded-lg shadow-card border border-white/95 whitespace-nowrap">
              Développeur Next.js
            </span>
          </motion.div>

        </div>

      </div>
    </section>
  );
}
