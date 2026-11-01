"use client";

import { motion } from "framer-motion";
import { SITE_CONFIG } from "@/lib/constants";
import { getScrollRevealProps } from "@/components/useScrollReveal";

const METHOD_STEPS = [
  {
    number: "01",
    title: "Écouter & cadrer",
    description:
      "Appel de découverte de 30 min pour cerner vos objectifs, vos contraintes et vos utilisateurs cibles. Je rédige un cahier des charges synthétique validé ensemble.",
  },
  {
    number: "02",
    title: "Concevoir & prototyper",
    description:
      "Maquettes Figma haute fidélité, architecture technique et choix de stack avant la première ligne de code. Vous validez le parcours avant d'investir.",
  },
  {
    number: "03",
    title: "Développer & itérer",
    description:
      "Développement en sprints courts avec accès à un environnement de prévisualisation. Vous suivez l'avancement en temps réel, les retours sont intégrés rapidement.",
  },
  {
    number: "04",
    title: "Livrer & transmettre",
    description:
      "Déploiement en production, documentation claire et formation à la prise en main. Le code vous appartient à 100%, sans licence ni dépendance cachée.",
  },
];

const ABOUT_CARDS = [
  {
    label: "APPROCHE",
    value: "Code propriétaire",
    caption: "Le code livré vous appartient intégralement — aucune dépendance à mes outils.",
  },
  {
    label: "CADENCE",
    value: "2–3 projets / trimestre",
    caption: "Je limite volontairement le nombre de missions pour garantir un suivi de qualité.",
  },
  {
    label: "RÉACTIVITÉ",
    value: "< 24h de réponse",
    caption: "WhatsApp, email ou Meet — je vous réponds le jour même ou le lendemain.",
  },
];

export default function About() {
  return (
    <section
      id="a-propos"
      className="relative overflow-hidden py-12 sm:py-16 px-4 sm:px-6 lg:px-12 bg-background border-t border-outline/50 scroll-mt-20"
      aria-label="À propos d'Esdras Thychel MBOULOUKOUE — KoniG.dev"
    >
      {/* Halo décoratif */}
      <div
        className="pointer-events-none absolute bottom-0 left-1/4 w-[600px] h-[400px] rounded-full bg-[radial-gradient(ellipse,var(--halo),transparent_70%)] blur-3xl -z-10"
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8 sm:mb-12">
          <motion.div {...getScrollRevealProps({ y: 16 })} className="max-w-2xl">
            <div className="inline-flex items-center gap-2 mb-4">
              <span className="font-mono text-xs font-semibold uppercase tracking-widest text-primary">
                03 // À PROPOS
              </span>
              <span className="h-3 w-px bg-outline" />
              <span className="font-mono text-[11px] text-on-surface-variant uppercase tracking-wider">
                Philosophie & Méthode
              </span>
            </div>
            <h2 className="font-heading font-extrabold text-3xl sm:text-5xl lg:text-6xl tracking-tight text-on-surface leading-[1.08]">
              À l&apos;intersection du code solide{" "}
              <em className="font-serif italic font-normal text-primary not-italic">
                et de l&apos;impact réel.
              </em>
            </h2>
          </motion.div>
        </div>

        {/* Bloc biographique */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-10 sm:mb-14">
          <motion.div
            {...getScrollRevealProps({ y: 30 })}
            className="lg:col-span-7 rounded-3xl border border-outline bg-surface p-8 sm:p-10 lg:p-12"
          >
            <p className="font-mono text-xs uppercase tracking-widest text-on-surface-variant mb-6">
              LE CHEMINEMENT
            </p>
            <p className="font-sans text-base sm:text-lg text-on-surface leading-relaxed mb-6 font-normal">
              Je suis <strong className="font-semibold text-on-surface">Esdras Thychel MBOULOUKOUE</strong>,
              développeur full-stack et IA freelance basé à Brazzaville, République du Congo.
              Mon rôle dépasse la simple écriture de code : je collabore directement avec les
              décideurs pour modéliser des solutions logicielles durables.
            </p>
            <p className="font-sans text-sm sm:text-base text-on-surface-variant leading-relaxed font-normal">
              En combinant une maîtrise poussée des architectures Next.js et TypeScript avec
              l&apos;écosystème IA (n8n, Mistral AI, agents autonomes), j&apos;accompagne les fondateurs,
              PME et équipes africaines et internationales qui veulent des outils qui leur
              ressemblent — sans dépendance à une agence, sans bloatware.
            </p>
          </motion.div>

          <div className="lg:col-span-5 flex flex-col gap-4">
            {ABOUT_CARDS.map((card, i) => (
              <motion.div
                key={card.label}
                {...getScrollRevealProps({ y: 20, delay: i * 0.1 })}
                className="flex-1 rounded-2xl border border-outline bg-surface p-5 sm:p-6 hover:border-outline-strong hover:bg-surface-elevated transition-all duration-300"
              >
                <p className="font-mono text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">
                  {card.label}
                </p>
                <p className="font-heading font-bold text-xl sm:text-2xl text-primary mb-1 tracking-tight">
                  {card.value}
                </p>
                <p className="font-sans text-xs text-on-surface-variant leading-relaxed">
                  {card.caption}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Méthode en 4 étapes linéaires — pas de cycle rotatif */}
        <div>
          <motion.div
            {...getScrollRevealProps()}
            className="inline-flex items-center gap-2 mb-10"
          >
            <span className="font-mono text-xs font-semibold uppercase tracking-widest text-primary">
              04 // MA MÉTHODE
            </span>
            <span className="h-3 w-px bg-outline" />
            <span className="font-mono text-[11px] text-on-surface-variant uppercase tracking-wider">
              Processus de mission
            </span>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {METHOD_STEPS.map((step, index) => (
              <motion.div
                key={step.number}
                {...getScrollRevealProps({ y: 25, delay: index * 0.12, margin: "-60px" })}
                className="group relative rounded-2xl border border-outline bg-surface p-6 sm:p-7 hover:border-primary/30 hover:bg-surface-elevated transition-all duration-400 overflow-hidden"
              >
                {/* Numéro de fond (décoratif) */}
                <span className="absolute -top-2 -right-2 font-heading font-black text-6xl text-on-surface/[0.04] select-none pointer-events-none group-hover:text-primary/[0.06] transition-colors duration-300">
                  {step.number}
                </span>

                {/* Étape */}
                <div className="relative">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="font-mono text-xs font-bold text-primary">
                      {step.number}
                    </span>
                    {index < METHOD_STEPS.length - 1 && (
                      <div className="hidden lg:block absolute left-full top-1/2 -translate-y-1/2 w-[calc(100%+24px)] h-px bg-gradient-to-r from-outline to-transparent" />
                    )}
                  </div>
                  <h3 className="font-heading font-bold text-base sm:text-lg text-on-surface mb-3 tracking-tight">
                    {step.title}
                  </h3>
                  <p className="font-sans text-xs sm:text-sm text-on-surface-variant leading-relaxed font-normal">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA de fin de section */}
        <motion.div
          {...getScrollRevealProps({ delay: 0.3 })}
          className="mt-16 sm:mt-24 flex flex-col sm:flex-row items-center justify-between gap-6 p-8 sm:p-10 rounded-3xl border border-outline/70 bg-surface/50 backdrop-blur-md"
        >
          <div>
            <p className="font-heading font-bold text-xl sm:text-2xl text-on-surface mb-2">
              Prêt à démarrer votre projet ?
            </p>
            <p className="font-sans text-sm text-on-surface-variant">
              Appelez-moi directement ou décrivez votre besoin via WhatsApp — je réponds sous 24h.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <a
              href={SITE_CONFIG.whatsapp.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-primary text-on-primary font-mono text-xs font-bold tracking-wider uppercase hover:bg-primary-hover transition-all duration-300 shadow-glow hover:scale-[1.03]"
            >
              WhatsApp
            </a>
            <a
              href="#contact"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full border border-outline hover:border-outline-strong font-mono text-xs font-medium tracking-wider uppercase text-on-surface transition-all duration-300 hover:bg-surface-elevated"
            >
              Formulaire
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
