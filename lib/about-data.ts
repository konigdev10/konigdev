export interface IdentityDetail {
  label: string;
  value: string;
}

export interface SkillCategory {
  title: string;
  skills: string[];
}

export interface TimelineChapter {
  number: string;
  period: string;
  title: string;
  description: string;
  highlights: string[];
}

export const IDENTITY_DETAILS: IdentityDetail[] = [
  { label: "Nom complet", value: "Esdras Thychel Mboulouékoué" },
  { label: "Nom professionnel", value: "KoniG.dev" },
  { label: "Structure", value: "KoniG Labs" },
  { label: "Localisation", value: "Brazzaville, République du Congo" },
  { label: "Statut", value: "Développeur indépendant (Freelance)" },
  { label: "Disponibilité", value: "Ouvert aux nouveaux projets" },
  { label: "Langues", value: "Français (langue maternelle), Anglais (technique)" },
];

export const SKILL_CATEGORIES: SkillCategory[] = [
  {
    title: "Web & Front-end",
    skills: ["Next.js 14", "TypeScript", "React", "Tailwind CSS", "HTML5 / CSS3"],
  },
  {
    title: "Mobile",
    skills: ["Flutter", "Dart", "Android", "iOS"],
  },
  {
    title: "Backend & Données",
    skills: ["Supabase", "PostgreSQL", "Node.js", "REST APIs", "Bases relationnelles"],
  },
  {
    title: "IA & Automatisation",
    skills: ["n8n", "Mistral AI", "OpenAI", "Python", "RAG & Agents autonomes"],
  },
  {
    title: "Outils de travail",
    skills: ["Figma", "Git", "GitHub", "Docker", "Linux"],
  },
];

export const TIMELINE_CHAPTERS: TimelineChapter[] = [
  {
    number: "01",
    period: "2021 à 2022",
    title: "L'apprentissage autonome des fondamentaux",
    description:
      "Découverte de la programmation en autodidacte à Brazzaville. Apprentissage approfondi de la logique logicielle, des structures de données, d'Algobox, du web moderne (JavaScript, CSS) et de Python.",
    highlights: [
      "Pratique intensive quotidienne et résolution de problèmes algorithmiques",
      "Conception des premiers scripts utilitaires et petits outils personnels",
    ],
  },
  {
    number: "02",
    period: "2023",
    title: "La spécialisation full-stack et mobile",
    description:
      "Passage aux technologies de production actuelles : adoption de TypeScript pour la robustesse du code, de l'écosystème React et Next.js pour le web, et de Flutter pour concevoir des applications mobiles multiplateformes.",
    highlights: [
      "Maîtrise de l'architecture App Router de Next.js et de Tailwind CSS",
      "Développement de premières applications mobiles complètes en Flutter",
    ],
  },
  {
    number: "03",
    period: "2024 à 2025",
    title: "L'écosystème IA et les flux de travail n8n",
    description:
      "Intégration poussée des modèles de langage (Mistral AI, OpenAI) et de l'orchestration de flux automatisés via n8n. Création d'agents autonomes branchés sur des bases de connaissances d'entreprises.",
    highlights: [
      "Automatisation de processus manuels récurrents pour éliminer les erreurs humaines",
      "Conception de systèmes RAG pour interroger des documents métier en langage naturel",
    ],
  },
  {
    number: "04",
    period: "2026",
    title: "KoniG Labs et l'accompagnement des entreprises",
    description:
      "Lancement formel des activités sous le nom KoniG Labs. Collaboration directe avec des fondateurs, PME et organisations en République du Congo, en Afrique francophone et à l'international pour livrer des produits logiciels concrets.",
    highlights: [
      "Déploiement en production de plateformes web complètes et performantes",
      "Accompagnement transparent : devis clair, code source remis à 100%, sans abonnement caché",
    ],
  },
];

