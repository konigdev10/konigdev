export type ProjectCategory =
  | "Site web"
  | "Application web"
  | "Application mobile"
  | "Automatisation IA"
  | "Graphisme";

export type ProjectStatus = "En ligne" | "En cours" | "Étude de cas";

export interface Project {
  slug: string;
  nom: string;
  categorie: ProjectCategory;
  annee?: string;
  statut: ProjectStatus;
  role: string;
  resume: string;
  outils: string[];
  resultat?: string;
  image?: string;
  lien?: string;
}

export const CATEGORY_TO_CONTACT_PARAM: Record<ProjectCategory, string> = {
  "Site web": "site-web",
  "Application web": "application-web",
  "Application mobile": "application-mobile",
  "Automatisation IA": "automatisation-ia",
  "Graphisme": "graphisme",
};

export const PROJECTS: Project[] = [
  {
    slug: "le-viceto",
    nom: "Le Viceto",
    categorie: "Site web",
    annee: "2026",
    statut: "En ligne",
    role: "Conception UI/UX, développement full-stack et intégration WhatsApp",
    resume:
      "Vitrine numérique et parcours de commande complet pour un restaurant de Brazzaville. Menu interactif avec ardoise du jour dynamique, panier client et bon de commande transmis instantanément sur WhatsApp. Adresse : Rue Mbochi, au-dessus de la pharmacie, Imm. INAYE.",
    outils: ["Next.js 14", "TypeScript", "Tailwind CSS", "Vercel"],
    resultat:
      "Commande en ligne opérationnelle depuis le lancement — menu, panier et validation WhatsApp sans friction, accessible sur mobile et desktop.",
    image: "/viceto.png",
    lien: "https://viceto.vercel.app/",
  },
  {
    slug: "neodomotique-congo",
    nom: "Neodomotique Congo",
    categorie: "Site web",
    statut: "En ligne",
    role: "Conception UI/UX, développement front-end et tunnel de devis WhatsApp",
    resume:
      "Site vitrine d'une agence de domotique qui équipe des logements à Brazzaville et Pointe-Noire : éclairage intelligent, commande vocale, automatisation sur mesure. Chaque action du visiteur — choisir un pack, demander une information, lancer un devis — ouvre WhatsApp avec un message déjà rédigé, pour que la conversation démarre sans formulaire. Interface sombre rehaussée de doré, assistant intégré et parcours de devis en étapes.",
    outils: ["Next.js", "Tailwind CSS", "WhatsApp (wa.me)", "Vercel"],
    image: "/neodomotique.png",
    lien: "https://neodomotique-congo.vercel.app/",
  },
  {
    slug: "plateforme-gestion-interne",
    nom: "Application web de gestion [À REMPLIR]",
    categorie: "Application web",
    annee: "2024",
    statut: "En cours",
    role: "Architecture logicielle, développement full-stack et gestion des accès",
    resume:
      "Plateforme web interne centralisant le traitement des données et le suivi des opérations quotidiennes. Interface adaptée aux postes de travail avec gestion des permissions par utilisateur. [À REMPLIR : nom du client et fonctionnalités clés]",
    outils: ["Next.js", "React", "TypeScript", "Supabase", "PostgreSQL"],
    resultat:
      "Centralisation des dossiers et suppression des saisies manuelles en doublon. [À REMPLIR : impact opérationnel]",
    image: "/realisations/plateforme-gestion-interne.jpg",
  },
  {
    slug: "application-mobile-services",
    nom: "Application mobile multiplateforme [À REMPLIR]",
    categorie: "Application mobile",
    annee: "2024",
    statut: "Étude de cas",
    role: "Design des écrans et développement applicatif iOS / Android",
    resume:
      "Application mobile pensée pour rester utilisable même avec une connexion internet instable. Fonctionnement local fluide avec synchronisation dès le retour du réseau. [À REMPLIR : nom du client et cas d'usage]",
    outils: ["Flutter", "Dart", "REST API", "SQLite"],
    image: "/realisations/application-mobile-services.jpg",
  },
  {
    slug: "pipeline-automatisation-ia",
    nom: "Automatisation de flux opérationnels [À REMPLIR]",
    categorie: "Automatisation IA",
    annee: "2024",
    statut: "En ligne",
    role: "Création des scénarios n8n, paramétrage des modèles de langage et intégration webhooks",
    resume:
      "Système autonome connectant la boîte de réception, les formulaires entrants et la base de données pour trier les requêtes et rédiger des synthèses automatiques. [À REMPLIR : nom du client et outils interconnectés]",
    outils: ["n8n", "OpenAI / Mistral", "Webhooks", "PostgreSQL"],
    resultat:
      "Traitement instantané des demandes entrantes sans intervention manuelle répétitive. [À REMPLIR : volume ou temps gagné]",
    image: "/realisations/pipeline-automatisation-ia.jpg",
  },
  {
    slug: "identite-visuelle-branding",
    nom: "Identité de marque et supports graphiques [À REMPLIR]",
    categorie: "Graphisme",
    annee: "2023",
    statut: "Étude de cas",
    role: "Direction artistique, création du logo, typographie et déclinaisons visuelles",
    resume:
      "Élaboration d'une identité visuelle claire et mémorable pour accompagner le lancement d'une marque. Guide de style complet pour les publications numériques et les documents imprimés. [À REMPLIR : nom du client et livrables]",
    outils: ["Figma", "Illustrator", "Typographie", "Design System"],
    image: "/realisations/identite-visuelle-branding.jpg",
  },
];

