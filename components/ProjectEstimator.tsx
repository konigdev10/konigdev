"use client";

import React, { useState, useMemo } from "react";

/* ── Types ── */
interface ProjectType {
  id: string;
  name: string;
  badge: string;
  description: string;
  basePrice: number; // en FCFA
  baseDays: number;
  icon: string;
}

interface ModuleOption {
  id: string;
  name: string;
  category: string;
  price: number; // en FCFA
  days: number;
  description: string;
  recommendedFor?: string[];
}

const WHATSAPP_PHONE = "242061062936";

/* ── Types de projets disponibles ── */
const projectTypes: ProjectType[] = [
  {
    id: "vitrine",
    name: "Site Vitrine & Landing Page",
    badge: "Next.js 14 · SEO",
    description: "Présence de marque percutante, vitesse instantanée et conversion optimisée.",
    basePrice: 150000,
    baseDays: 7,
    icon: "🌐",
  },
  {
    id: "ecommerce",
    name: "E-Commerce & Commande WhatsApp",
    badge: "Catalogue & Panier",
    description: "Menu interactif, catalogue de produits et transmission directe sur WhatsApp.",
    basePrice: 250000,
    baseDays: 10,
    icon: "🛍️",
  },
  {
    id: "saas",
    name: "Application Web ou Mobile",
    badge: "Flutter & React",
    description: "Portail métier, tableau de bord client, base de données PostgreSQL temps réel.",
    basePrice: 450000,
    baseDays: 18,
    icon: "⚡",
  },
  {
    id: "automation",
    name: "Automatisation IA & n8n",
    badge: "Mistral AI & Flux",
    description: "Traitement automatique d'emails, qualification de leads et synchronisation CRM.",
    basePrice: 200000,
    baseDays: 8,
    icon: "🤖",
  },
];

/* ── Modules complémentaires ── */
const moduleOptions: ModuleOption[] = [
  {
    id: "auth",
    name: "Authentification Sécurisée & Rôles",
    category: "Sécurité",
    price: 45000,
    days: 2,
    description: "Espace membre, connexion Google / Email et gestion des permissions.",
    recommendedFor: ["saas"],
  },
  {
    id: "payment",
    name: "Paiement Mobile Money & Carte",
    category: "Monétisation",
    price: 60000,
    days: 3,
    description: "Intégration MTN MoMo, Airtel Money, Wave ou Stripe sécurisé.",
    recommendedFor: ["ecommerce", "saas"],
  },
  {
    id: "dashboard",
    name: "Tableau de Bord Admin & Stats",
    category: "Gestion",
    price: 75000,
    days: 4,
    description: "Gestion des commandes, suivi des utilisateurs et métriques clés en direct.",
    recommendedFor: ["ecommerce", "saas"],
  },
  {
    id: "whatsapp",
    name: "Tunnel WhatsApp & Alertes SMS",
    category: "Communication",
    price: 40000,
    days: 2,
    description: "Notifications automatiques de commande et relance client instantanée.",
    recommendedFor: ["vitrine", "ecommerce"],
  },
  {
    id: "ai_bot",
    name: "Agent IA & RAG sur vos données",
    category: "Intelligence",
    price: 85000,
    days: 4,
    description: "Assistant virtuel intelligent formé sur votre catalogue et vos FAQ métier.",
    recommendedFor: ["saas", "automation"],
  },
  {
    id: "seo_ultra",
    name: "SEO Avancé & Performance 100/100",
    category: "Visibilité",
    price: 35000,
    days: 1,
    description: "Balises sémantiques complètes, OpenGraph, sitemap XML et score vert.",
    recommendedFor: ["vitrine", "ecommerce"],
  },
  {
    id: "support",
    name: "Support & Maintenance 3 Mois",
    category: "Garantie",
    price: 50000,
    days: 0,
    description: "Surveillance, mises à jour de sécurité et assistance prioritaire garantie.",
    recommendedFor: ["vitrine", "ecommerce", "saas", "automation"],
  },
];

/* ── Options de rapidité ── */
const urgencyOptions = [
  { id: "normal", label: "Délai Standard", multiplier: 1, delayModifier: 0, desc: "Rythme optimal" },
  { id: "fast", label: "Accéléré (Prioritaire)", multiplier: 1.15, delayModifier: -3, desc: "Démarrage sous 24h" },
];

export default function ProjectEstimator() {
  const [selectedType, setSelectedType] = useState<string>("vitrine");
  const [selectedModules, setSelectedModules] = useState<string[]>(["whatsapp", "seo_ultra"]);
  const [urgency, setUrgency] = useState<string>("normal");
  const [clientCity, setClientCity] = useState<string>("Brazzaville");

  const currentType = useMemo(
    () => projectTypes.find((p) => p.id === selectedType) || projectTypes[0],
    [selectedType]
  );

  const toggleModule = (id: string) => {
    setSelectedModules((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  /* ── Calcul des totaux ── */
  const { totalFCFA, totalEUR, estimatedDays } = useMemo(() => {
    const modulesSum = selectedModules.reduce((acc, modId) => {
      const found = moduleOptions.find((m) => m.id === modId);
      return acc + (found ? found.price : 0);
    }, 0);

    const modulesDays = selectedModules.reduce((acc, modId) => {
      const found = moduleOptions.find((m) => m.id === modId);
      return acc + (found ? found.days : 0);
    }, 0);

    const urgencyChoice = urgencyOptions.find((u) => u.id === urgency) || urgencyOptions[0];

    const rawTotal = (currentType.basePrice + modulesSum) * urgencyChoice.multiplier;
    const roundedTotal = Math.round(rawTotal / 1000) * 1000;
    const eur = Math.round(roundedTotal / 655.957);

    const totalDays = Math.max(
      4,
      Math.round(currentType.baseDays + modulesDays + urgencyChoice.delayModifier)
    );

    return {
      totalFCFA: roundedTotal.toLocaleString("fr-FR"),
      totalEUR: eur.toLocaleString("fr-FR"),
      estimatedDays: totalDays,
    };
  }, [currentType, selectedModules, urgency]);

  /* ── Message WhatsApp préparé ── */
  const whatsappUrl = useMemo(() => {
    const chosenModulesNames = selectedModules
      .map((id) => moduleOptions.find((m) => m.id === id)?.name)
      .filter(Boolean)
      .join("\n- ");

    const text = `Bonjour Esdras,\n\nJe viens d'utiliser le simulateur de devis sur votre portfolio KoniG.dev et je souhaite lancer mon projet :\n\n📌 *Type de projet :* ${currentType.name}\n📍 *Localisation :* ${clientCity}\n⏱️ *Délai estimé :* ~${estimatedDays} jours\n💰 *Budget estimatif :* ${totalFCFA} FCFA (~${totalEUR} €)\n\n🧩 *Modules sélectionnés :*\n- ${chosenModulesNames || "Aucun module additionnel"}\n\nPouvons-nous en discuter pour valider le cadrage technique ? Merci !`;

    return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(text)}`;
  }, [currentType, clientCity, estimatedDays, totalFCFA, totalEUR, selectedModules]);

  return (
    <section id="estimateur" className="w-full py-20 sm:py-28 relative overflow-hidden bg-bg">
      {/* Halos d'ambiance */}
      <div className="absolute top-10 right-10 w-[450px] h-[450px] bg-accent/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[450px] h-[450px] bg-black/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-7xl mx-auto px-6 sm:px-10 relative z-10">
        {/* ── En-tête de section ── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-10 border-b border-black/10">
          <div>
            <div className="flex items-center gap-3">
              <span className="section-label">[ 04 // SIMULATEUR DE PROJET ]</span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-accent/15 text-ink font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                Estimation instantanée &amp; WhatsApp direct
              </span>
            </div>
            <h2 className="section-title text-2xl sm:text-4xl lg:text-5xl">
              Estimez votre projet digital <br />
              <span className="font-sans font-normal text-ink-light text-xl sm:text-3xl">
                En toute transparence, sans engagement.
              </span>
            </h2>
          </div>

          <p className="font-sans text-xs sm:text-sm text-ink-muted max-w-md leading-relaxed">
            Inspiré des meilleurs standards d&apos;ingénierie logicielle : configurez votre besoin,
            calculez votre budget et exportez directement le bon de cadrage sur WhatsApp en 1 clic.
          </p>
        </div>

        {/* ── Grille principale : Choix à gauche, Récapitulatif à droite ── */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ── Colonne Gauche (Étapes de configuration) ── */}
          <div className="lg:col-span-7 space-y-10">
            {/* Étape 1 : Type de projet */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="w-6 h-6 rounded-full bg-ink text-white font-mono text-xs font-bold flex items-center justify-center">
                  1
                </span>
                <h3 className="font-sans font-bold text-base sm:text-lg text-ink">
                  Quel est votre type de projet ?
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {projectTypes.map((pt) => {
                  const isSelected = selectedType === pt.id;
                  return (
                    <button
                      key={pt.id}
                      type="button"
                      onClick={() => setSelectedType(pt.id)}
                      className={`p-4 rounded-2xl text-left border transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? "bg-surface border-ink shadow-md ring-2 ring-ink/10"
                          : "bg-surface border-black/10 hover:border-black/30 hover:bg-surface-muted"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-xl">{pt.icon}</span>
                          <span className="px-2 py-0.5 rounded-md bg-surface-muted font-mono text-[10px] text-ink-muted font-semibold">
                            {pt.badge}
                          </span>
                        </div>
                        <h4 className="mt-3 font-sans font-bold text-sm text-ink">{pt.name}</h4>
                        <p className="mt-1 font-sans text-xs text-ink-muted leading-relaxed line-clamp-2">
                          {pt.description}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-black/5 flex items-center justify-between text-xs font-mono">
                        <span className="text-ink-light">À partir de</span>
                        <span className="font-bold text-ink">
                          {pt.basePrice.toLocaleString("fr-FR")} FCFA
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Étape 2 : Modules additionnels */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-ink text-white font-mono text-xs font-bold flex items-center justify-center">
                    2
                  </span>
                  <h3 className="font-sans font-bold text-base sm:text-lg text-ink">
                    Quels modules souhaitez-vous intégrer ?
                  </h3>
                </div>
                <span className="font-mono text-xs text-ink-muted">
                  {selectedModules.length} sélectionné{selectedModules.length > 1 ? "s" : ""}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {moduleOptions.map((mod) => {
                  const isChecked = selectedModules.includes(mod.id);
                  return (
                    <div
                      key={mod.id}
                      onClick={() => toggleModule(mod.id)}
                      className={`p-3.5 rounded-xl border transition-all duration-200 select-none cursor-pointer flex items-start gap-3 ${
                        isChecked
                          ? "bg-surface border-ink shadow-xs ring-1 ring-ink/10"
                          : "bg-surface border-black/10 hover:border-black/25"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}} // géré par le conteneur
                        className="mt-1 w-4 h-4 rounded text-ink focus:ring-accent accent-ink cursor-pointer"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <strong className="font-sans font-bold text-xs text-ink truncate block">
                            {mod.name}
                          </strong>
                          <span className="font-mono text-[11px] font-bold text-ink shrink-0 ml-2">
                            +{mod.price.toLocaleString("fr-FR")} F
                          </span>
                        </div>
                        <p className="mt-0.5 font-sans text-[11px] text-ink-muted leading-snug">
                          {mod.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Étape 3 : Délais & Localisation */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="w-6 h-6 rounded-full bg-ink text-white font-mono text-xs font-bold flex items-center justify-center">
                  3
                </span>
                <h3 className="font-sans font-bold text-base sm:text-lg text-ink">
                  Rythme de livraison &amp; Localisation
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Sélecteur de rythme */}
                <div className="space-y-2">
                  <label className="block font-mono text-xs font-bold text-ink uppercase tracking-wider">
                    Rythme souhaité
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {urgencyOptions.map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setUrgency(opt.id)}
                        className={`p-3 rounded-xl border text-center transition-all cursor-pointer font-sans text-xs ${
                          urgency === opt.id
                            ? "bg-ink text-white font-bold border-ink shadow-sm"
                            : "bg-surface text-ink-muted border-black/10 hover:border-black/25"
                        }`}
                      >
                        <span className="block font-bold">{opt.label}</span>
                        <span className="block text-[10px] opacity-70 mt-0.5">{opt.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sélecteur de ville */}
                <div className="space-y-2">
                  <label className="block font-mono text-xs font-bold text-ink uppercase tracking-wider">
                    Votre localisation
                  </label>
                  <select
                    value={clientCity}
                    onChange={(e) => setClientCity(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-surface border border-black/10 font-sans text-xs text-ink focus:outline-none focus:border-ink font-semibold"
                  >
                    <option value="Brazzaville">Brazzaville (Congo)</option>
                    <option value="Pointe-Noire">Pointe-Noire (Congo)</option>
                    <option value="Autre ville du Congo">Autre ville du Congo</option>
                    <option value="Afrique Centrale / Ouest (Distant)">Afrique Centrale / Ouest</option>
                    <option value="Europe / International (Distant)">Europe / International</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* ── Colonne Droite (Carte Récapitulative Fictive Sticky) ── */}
          <div className="lg:col-span-5 lg:sticky lg:top-28">
            <div className="rounded-3xl sm:rounded-4xl p-6 sm:p-8 bg-surface-card border border-black/10 shadow-hero relative overflow-hidden">
              {/* Badge supérieur */}
              <div className="flex items-center justify-between pb-4 border-b border-black/10">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                  <span className="font-mono text-xs font-bold uppercase tracking-wider text-ink">
                    Récapitulatif en direct
                  </span>
                </div>
                <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-black/5 text-ink-muted">
                  Devis indicatif 2026
                </span>
              </div>

              {/* Détail ligne par ligne */}
              <div className="py-5 space-y-3 font-sans text-xs sm:text-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <strong className="block text-ink font-bold">{currentType.name}</strong>
                    <span className="text-[11px] text-ink-muted font-mono">
                      Base technique &amp; architecture
                    </span>
                  </div>
                  <span className="font-mono font-bold text-ink">
                    {currentType.basePrice.toLocaleString("fr-FR")} FCFA
                  </span>
                </div>

                {selectedModules.map((modId) => {
                  const m = moduleOptions.find((item) => item.id === modId);
                  if (!m) return null;
                  return (
                    <div key={m.id} className="flex justify-between items-center text-xs text-ink-muted">
                      <span className="flex items-center gap-1.5">
                        <span className="text-accent font-bold">✓</span>
                        <span>{m.name}</span>
                      </span>
                      <span className="font-mono text-ink font-semibold">
                        +{m.price.toLocaleString("fr-FR")} F
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Métriques d'engagement */}
              <div className="p-4 rounded-2xl bg-surface border border-black/5 grid grid-cols-2 gap-3 font-mono text-xs my-4">
                <div>
                  <span className="text-ink-light block text-[10px] uppercase">Délai estimé</span>
                  <strong className="text-ink text-sm sm:text-base font-black">
                    ~{estimatedDays} jours
                  </strong>
                </div>
                <div>
                  <span className="text-ink-light block text-[10px] uppercase">Propriété</span>
                  <strong className="text-ink text-sm sm:text-base font-black">
                    100% Cédé
                  </strong>
                </div>
              </div>

              {/* Total final mis en valeur */}
              <div className="pt-4 border-t border-black/10 flex items-end justify-between">
                <div>
                  <span className="font-mono text-xs text-ink-muted block uppercase tracking-wider">
                    Budget estimé
                  </span>
                  <div className="font-sans font-black text-3xl sm:text-4xl text-ink tracking-tight mt-0.5">
                    {totalFCFA}{" "}
                    <span className="text-xs font-mono font-normal text-ink-muted">FCFA</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-mono text-xs text-ink-light">Équivalent</span>
                  <span className="block font-sans font-bold text-sm text-ink-muted">
                    ~{totalEUR} €
                  </span>
                </div>
              </div>

              {/* Bouton CTA WhatsApp */}
              <div className="mt-6 space-y-2">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl bg-ink text-white font-sans text-sm font-bold shadow-md hover:bg-accent hover:text-ink hover:shadow-lg transition-all duration-200 group"
                >
                  {/* Icône WhatsApp */}
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.885-9.884 9.885m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                  </svg>
                  <span>Valider mon devis sur WhatsApp</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </a>

                <p className="font-mono text-[11px] text-center text-ink-light">
                  Échange direct avec Esdras · Réponse sous 24h ouvrées
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
