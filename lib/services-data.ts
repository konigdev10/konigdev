export interface ServiceOffer {
  id: string;
  order: number;
  title: string;
  shortTitle: string;
  tagline: string;
  priceStartingAt: string;
  typicalDuration: string;
  description: string;
  deliverables: string[];
  technologies: string[];
}

export interface ServicePack {
  id: string;
  name: string;
  targetAudience: string;
  startingPrice: string;
  duration: string;
  features: string[];
  highlight?: boolean;
}

export interface ProcessStep {
  number: string;
  title: string;
  description: string;
  duration: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export const SERVICE_OFFERS: ServiceOffer[] = [
  {
    id: "automatisation-ia",
    order: 1,
    title: "Automatisation et IA",
    shortTitle: "Automatisation et IA",
    tagline: "Flux de travail autonomes et assistants connectés à vos outils.",
    priceStartingAt: "À partir de 60 000 FCFA",
    typicalDuration: "1 à 2 semaines",
    description:
      "Mise en place de flux n8n, webhooks et modèles de langage pour traiter vos emails, synchroniser vos données dans Google Sheets ou Airtable, et automatiser vos tâches récurrentes sans erreurs.",
    deliverables: [
      "Scénarios n8n documentés et déployés sur votre infrastructure ou cloud",
      "Connexions API sécurisées (WhatsApp, Gmail, CRM, bases de données)",
      "Agents IA avec accès à vos documents métier (RAG) et consignes claires",
      "Guide de prise en main et période de suivi technique de 14 jours",
    ],
    technologies: ["n8n", "Mistral AI", "Python", "Webhooks", "PostgreSQL"],
  },
  {
    id: "presence-en-ligne",
    order: 2,
    title: "Présence en ligne",
    shortTitle: "Présence en ligne",
    tagline: "Sites vitrines rapides, soignés et lisibles sur tous les écrans.",
    priceStartingAt: "À partir de 80 000 FCFA",
    typicalDuration: "1 à 3 semaines",
    description:
      "Conception et développement de sites web professionnels pour présenter votre activité, vos réalisations et permettre à vos prospects de vous contacter directement via formulaire ou WhatsApp.",
    deliverables: [
      "Site moderne développé en Next.js ou HTML/CSS propre",
      "Adaptation parfaite sur téléphone, tablette et ordinateur",
      "Formulaire de contact relié à votre adresse email et WhatsApp",
      "Optimisation des performances de chargement et référencement naturel",
    ],
    technologies: ["Next.js", "TypeScript", "Tailwind CSS", "SEO"],
  },
  {
    id: "applications-sur-mesure",
    order: 3,
    title: "Applications sur mesure",
    shortTitle: "Applications sur mesure",
    tagline: "Outils de gestion internes, portails clients et applications mobiles.",
    priceStartingAt: "À partir de 250 000 FCFA",
    typicalDuration: "3 à 6 semaines",
    description:
      "Développement de plateformes logicielles complètes pour vos opérations : portails d'administration, suivi de commandes, gestion de stock et applications mobiles Flutter pour Android et iOS.",
    deliverables: [
      "Application web ou mobile avec authentification et rôles sécurisés",
      "Base de données relationnelle structurée et sauvegardes programmées",
      "Tableau de bord de gestion avec indicateurs et filtres de recherche",
      "Code source complet remis sans restriction de propriété intellectuelle",
    ],
    technologies: ["Next.js", "Flutter", "Supabase", "PostgreSQL", "REST APIs"],
  },
  {
    id: "design",
    order: 4,
    title: "Design",
    shortTitle: "Design",
    tagline: "Maquettes d'interfaces ergonomiques, prototypes et chartes graphiques.",
    priceStartingAt: "À partir de 15 000 FCFA",
    typicalDuration: "3 à 7 jours",
    description:
      "Création de maquettes Figma prêtes pour le développement, organisation de vos parcours clients, refonte graphique d'interfaces existantes et conception de supports numériques événementiels.",
    deliverables: [
      "Fichiers sources Figma organisés avec composants et styles",
      "Prototype interactif cliquable pour valider les flux avant développement",
      "Export de tous les visuels et icônes optimisés pour le web",
      "Supports d'invitation web événementielle ou infographie digitale",
    ],
    technologies: ["Figma", "Design System", "Prototypage", "UI/UX"],
  },
];

export const SERVICE_PACKS: ServicePack[] = [
  {
    id: "pack-essentiel",
    name: "Pack Démarrage",
    targetAudience: "Indépendants, consultants et artisans",
    startingPrice: "80 000 FCFA",
    duration: "7 à 10 jours",
    features: [
      "Site vitrine d'une à trois pages épurées",
      "Bouton WhatsApp direct et formulaire de contact",
      "Hébergement configuré et nom de domaine relié",
      "Optimisation mobile et rapidité de chargement",
      "Code propriétaire et aucune mensualité logicielle",
    ],
    highlight: false,
  },
  {
    id: "pack-pro",
    name: "Pack Métier & IA",
    targetAudience: "PME, cabinets et entreprises en croissance",
    startingPrice: "220 000 FCFA",
    duration: "2 à 3 semaines",
    features: [
      "Plateforme web complète avec catalogue ou espace de commande",
      "Automatisation n8n (traitement de devis ou réception d'alertes)",
      "Intégration d'un assistant IA répondant sur vos documents",
      "Tableau de bord d'administration pour vos données",
      "Accompagnement et suivi technique pendant 30 jours",
    ],
    highlight: true,
  },
  {
    id: "pack-sur-mesure",
    name: "Pack Sur-Mesure",
    targetAudience: "Startups, équipes et projets spécifiques",
    startingPrice: "Sur devis détaillé",
    duration: "Selon cahier des charges",
    features: [
      "Application mobile Flutter (iOS & Android) ou SaaS complet",
      "Architecture logicielle personnalisée avec API dédiée",
      "Intégrations de paiement mobile money ou passerelles bancaires",
      "Audit de sécurité et tests de charge",
      "Transfert de compétences technique à votre équipe",
    ],
    highlight: false,
  },
];

export const PROCESS_STEPS: ProcessStep[] = [
  {
    number: "01",
    title: "Échange initial gratuit",
    description:
      "Une discussion de 20 minutes par WhatsApp ou par appel pour comprendre votre besoin, vos objectifs et vos contraintes de calendrier.",
    duration: "Jour 1",
  },
  {
    number: "02",
    title: "Cadrage et devis clair",
    description:
      "Rédaction d'une proposition technique sans jargon, avec la liste exacte des livrables, le planning et un tarif ferme.",
    duration: "Sous 24h à 48h",
  },
  {
    number: "03",
    title: "Développement et démonstrations",
    description:
      "Création de votre projet avec des points d'étape réguliers. Vous testez l'avancement sur un lien privé avant toute mise en ligne.",
    duration: "1 à 4 semaines",
  },
  {
    number: "04",
    title: "Livraison et accompagnement",
    description:
      "Déploiement sur votre domaine, remise de l'intégralité du code source et session d'explication pour être parfaitement autonome.",
    duration: "Jour J + suivi",
  },
];

export const FAQ_ITEMS: FaqItem[] = [
  {
    id: "delai",
    question: "Combien de temps prend la réalisation d'un projet ?",
    answer:
      "Un site vitrine ou une automatisation de flux prend généralement entre 7 et 14 jours. Pour une application web ou mobile sur mesure, le délai habituel se situe entre 3 et 6 semaines selon la complexité des fonctionnalités.",
  },
  {
    id: "paiement",
    question: "Quelles sont les modalités de paiement acceptées ?",
    answer:
      "Le règlement s'effectue généralement en deux étapes : 40% d'acompte au lancement après signature du devis, et le solde de 60% à la livraison finale après vos tests de validation. Les paiements sont acceptés par virement bancaire ou Mobile Money (Airtel Money, MTN Mobile Money).",
  },
  {
    id: "propriete",
    question: "Suis-je propriétaire du code et des outils créés ?",
    answer:
      "Oui, totalement. Dès la livraison finale et le règlement du solde, 100% des fichiers sources, des comptes et des droits de propriété intellectuelle vous appartiennent. Aucun abonnement caché, aucun verrouillage.",
  },
  {
    id: "apres-livraison",
    question: "Que se passe-t-il après la mise en ligne ?",
    answer:
      "Chaque prestation inclut une garantie de suivi technique de 14 à 30 jours pour corriger tout ajustement sans frais supplémentaires. Au-delà, nous pouvons convenir d'une formule d'accompagnement ponctuel ou mensuel si vous souhaitez faire évoluer votre outil.",
  },
  {
    id: "technologies",
    question: "Pourquoi utilisez-vous Next.js et n8n plutôt qu'un modèle WordPress ?",
    answer:
      "Next.js garantit des temps de chargement immédiats, une excellente sécurité et une durabilité sans failles de plugins tiers. Pour l'automatisation, n8n permet d'interconnecter vos outils avec une flexibilité maximale et sans dépendre d'abonnements coûteux.",
  },
];

