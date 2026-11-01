import "server-only";

import { creerClientAdmin } from "@/lib/supabase/admin";

/**
 * Journal d'audit (table admin_logs).
 *
 * Ajout seul : la migration ne déclare aucune policy d'update ni de delete, et
 * l'écriture se fait avec la clé service role. Personne — pas même l'admin
 * connecté — ne peut réécrire une ligne déjà posée.
 *
 * Le contenu est volontairement parcimonieux : aucun mot de passe, aucune clé,
 * aucune adresse IP en clair. On consigne un hash et un identifiant technique.
 */

export type ActionAudit =
  | "connexion_reussie"
  | "connexion_echouee"
  | "mfa_echouee"
  | "mfa_verifiee"
  | "mfa_appareil_ajoute"
  | "mfa_appareil_retire"
  | "deconnexion_globale"
  | "projet_cree"
  | "projet_modifie"
  | "projet_supprime"
  | "projet_publie"
  | "projet_depublie"
  | "projet_reordonne"
  | "export_csv"
  | "export_complet"
  | "visites_supprimees"
  | "message_marque"
  | "message_supprime"
  | "mot_de_passe_change"
  | "acces_refuse";

export interface EntreeAudit {
  action: ActionAudit;
  detail?: string | null;
  ipHash?: string | null;
  reussite?: boolean;
}

/**
 * Écrit une ligne et n'échoue jamais : un journal indisponible ne doit pas
 * empêcher une connexion légitime ni la suppression d'un projet. L'échec est
 * remonté dans les logs serveur, sans donnée personnelle.
 */
export async function journaliser(entree: EntreeAudit): Promise<void> {
  const client = creerClientAdmin();
  const { error } = await client.from("admin_logs").insert({
    action: entree.action,
    detail: entree.detail ?? null,
    ip_hash: entree.ipHash ?? null,
    reussite: entree.reussite ?? true,
  });

  if (error) {
    // Ni le détail de l'erreur ni la charge utile : le message de Supabase
    // peut contenir des fragments de requête.
    console.error("journal_audit_ecriture_echouee");
  }
}
