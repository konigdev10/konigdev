/**
 * Types de lignes correspondant à supabase/migrations/001_init.sql.
 * Écrits à la main (et non générés) pour que le typage soit vérifiable dès
 * maintenant, avant l'existence d'une instance. Toute divergence entre ce
 * fichier et la migration est une erreur à corriger des deux côtés.
 *
 * `type ... = { ... }` et non `interface` : supabase-js confronte ces formes à
 * Record<string, unknown>, et une interface déclarée n'a pas de signature
 * d'index implicite. Avec des interfaces, Database['public'] ne satisfait plus
 * GenericSchema et toutes les requêtes retombent sur never / undefined — le
 * mode strict ne vérifierait plus rien sans rien annoncer.
 */

export type Categorie =
  | "Site web"
  | "Application web"
  | "Application mobile"
  | "Automatisation IA"
  | "Graphisme";

export type StatutProjet = "En ligne" | "En cours" | "Étude de cas";

export type TypeAppareil = "mobile" | "tablette" | "ordinateur";

export const CATEGORIES: readonly Categorie[] = [
  "Site web",
  "Application web",
  "Application mobile",
  "Automatisation IA",
  "Graphisme",
];

export const STATUTS_PROJET: readonly StatutProjet[] = [
  "En ligne",
  "En cours",
  "Étude de cas",
];

export type ProjectRow = {
  id: string;
  created_at: string;
  updated_at: string;
  slug: string;
  nom: string;
  categorie: Categorie;
  annee: string | null;
  statut: StatutProjet;
  role: string;
  resume: string;
  outils: string[];
  resultat: string | null;
  image_url: string | null;
  lien: string | null;
  ordre: number;
  publie: boolean;
};

/** Ce que le formulaire d'admin envoie. id/timestamps/ordre sont gérés par la base. */
export type ProjectDraft = {
  slug: string;
  nom: string;
  categorie: Categorie;
  annee: string | null;
  statut: StatutProjet;
  role: string;
  resume: string;
  outils: string[];
  resultat: string | null;
  image_url: string | null;
  lien: string | null;
  publie: boolean;
};

export type VisitRow = {
  id: string;
  created_at: string;
  path: string;
  referrer: string | null;
  pays: string | null;
  region: string | null;
  ville: string | null;
  quartier: string | null;
  device_type: TypeAppareil | null;
  marque: string | null;
  modele: string | null;
  os: string | null;
  os_version: string | null;
  navigateur: string | null;
  langue: string | null;
  ecran: string | null;
  visitor_id: string | null;
  /** SHA-256 salé. Ne doit JAMAIS être affiché dans l'interface. */
  ip_hash: string;
  est_bot: boolean;
  nom: string | null;
};

export type MessageRow = {
  id: string;
  created_at: string;
  nom: string;
  contact: string;
  projet: string;
  budget: string | null;
  message: string;
  quartier: string | null;
  visitor_id: string | null;
  lu: boolean;
  repondu: boolean;
};

export type AdminLogRow = {
  id: string;
  created_at: string;
  action: string;
  detail: string | null;
  ip_hash: string | null;
  reussite: boolean;
};

export type LoginAttemptRow = {
  id: string;
  created_at: string;
  ip_hash: string;
  reussite: boolean;
};

/** Résultat de public.rate_limit_hit(). */
export type RateLimitEtat = {
  compteur: number;
  autorise: boolean;
  blocage_jusqua: string;
};

// ---------------------------------------------------------------------------
// Contrat de typage pour supabase-js
// ---------------------------------------------------------------------------

type Table<TRow, TInsert> = {
  Row: TRow;
  Insert: TInsert;
  Update: Partial<TRow>;
  Relationships: [];
};

export type ProjectInsert = {
  slug: string;
  nom: string;
  categorie: Categorie;
  statut: StatutProjet;
  role: string;
  resume: string;
  id?: string;
  created_at?: string;
  updated_at?: string;
  annee?: string | null;
  outils?: string[];
  resultat?: string | null;
  image_url?: string | null;
  lien?: string | null;
  ordre?: number;
  publie?: boolean;
};

export type VisitInsert = {
  path: string;
  ip_hash: string;
  id?: string;
  created_at?: string;
  referrer?: string | null;
  pays?: string | null;
  region?: string | null;
  ville?: string | null;
  quartier?: string | null;
  device_type?: TypeAppareil | null;
  marque?: string | null;
  modele?: string | null;
  os?: string | null;
  os_version?: string | null;
  navigateur?: string | null;
  langue?: string | null;
  ecran?: string | null;
  visitor_id?: string | null;
  est_bot?: boolean;
  nom?: string | null;
};

export type MessageInsert = {
  nom: string;
  contact: string;
  projet: string;
  message: string;
  id?: string;
  created_at?: string;
  budget?: string | null;
  quartier?: string | null;
  visitor_id?: string | null;
  lu?: boolean;
  repondu?: boolean;
};

export type AdminLogInsert = {
  action: string;
  id?: string;
  created_at?: string;
  detail?: string | null;
  ip_hash?: string | null;
  reussite?: boolean;
};

export type LoginAttemptInsert = {
  ip_hash: string;
  id?: string;
  created_at?: string;
  reussite?: boolean;
};

export type Database = {
  // Clé "public" en minuscules : supabase-js cherche Database['public'].
  public: {
    Tables: {
      projects: Table<ProjectRow, ProjectInsert>;
      visits: Table<VisitRow, VisitInsert>;
      messages: Table<MessageRow, MessageInsert>;
      admin_logs: Table<AdminLogRow, AdminLogInsert>;
      login_attempts: Table<LoginAttemptRow, LoginAttemptInsert>;
      rate_limits: Table<
        { cle: string; fenetre: string; compteur: number },
        { cle: string; fenetre: string; compteur?: number }
      >;
      app_config: Table<
        { key: string; value: string; updated_at: string },
        { key: string; value: string }
      >;
    };
    Views: Record<string, never>;
    Functions: {
      purge_old_visits: {
        Args: { jours?: number };
        Returns: number;
      };
      rate_limit_hit: {
        Args: { p_cle: string; p_duree: number; p_seuil: number };
        Returns: RateLimitEtat[];
      };
      login_lockout_remaining: {
        Args: { p_ip_hash: string };
        Returns: number;
      };
      is_admin_aal2: { Args: Record<string, never>; Returns: boolean };
      admin_user_id: { Args: Record<string, never>; Returns: string | null };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
