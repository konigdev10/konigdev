"use server";

/**
 * Second facteur : enregistrement d'un appareil, vérification du code, gestion
 * des appareils.
 *
 * Ce fichier applique la règle du cahier des charges : la MFA est obligatoire,
 * deux appareils au maximum, et AUCUN code de secours maison. Pas de « bouton
 * j'ai perdu mon téléphone » : la seule porte de sortie est le mot de passe
 * combiné à un autre appareil déjà enregistré. C'est volontaire — une porte
 * dérobate ouverte au confort serait ouverte à un attaquant.
 *
 * Chaque action revérifie pour son propre compte (origine, titulaire, niveau
 * d'assurance, débit) : le middleware n'est jamais la seule défense.
 */

import { cookies, headers } from "next/headers";

import { creerClientSupabase, type ClientSupabase } from "@/lib/supabase/server";
import { cookieSecurise, getServerEnv } from "@/lib/env";
import { controleOrigine } from "@/lib/security/origin";
import { journaliser } from "@/lib/security/audit";
import { envoyerAlerte, empreinteCourte } from "@/lib/security/alerte";
import { limiter } from "@/lib/security/rate-limit";
import { sessionMfa } from "@/lib/security/guard";
import {
  creerJetonActivite,
  NOM_COOKIE_ACTIVITE,
  optionsCookieActivite,
} from "@/lib/security/session";
import {
  extraireFormulaire,
  schemaCodeMfa,
  schemaDeconnexion,
  valider,
} from "@/lib/security/validate";
import { hacherIp, lireIpBrute } from "@/lib/visitor";
import {
  FENETRE_CODE,
  FENETRE_ENROLEMENT,
  MAX_APPAREILS,
  SEUIL_CODE,
  SEUIL_ENROLEMENT,
} from "@/lib/security/mfa";

/** Même phrase pour tous les codes refusés : rien ne dit si le facteur existe. */
const MESSAGE_CODE = "Code incorrect.";

export interface ResultatMfa {
  ok: boolean;
  /** Cible de navigation quand le second facteur est acquis. */
  suite: string | null;
  global: string | null;
}

export interface ResultatEnrolement extends ResultatMfa {
  /** Identifiant technique du facteur en attente — pas un secret. */
  facteur: string | null;
  /** URI otpauth:// à encoder en QR. Contient le secret, comme l'affichage. */
  uri: string | null;
  /** Secret en Base32, pour la saisie manuelle dans l'application. */
  secret: string | null;
}

function refus(global: string): ResultatMfa {
  return { ok: false, suite: null, global };
}

function refusEnrolement(global: string): ResultatEnrolement {
  return { ok: false, suite: null, global, facteur: null, uri: null, secret: null };
}

interface Acces {
  supabase: ClientSupabase;
  adminUserId: string;
  etat: "initiale" | "complete";
  ipHash: string | null;
  hote: string | null;
}

type VerdictAcces = { ok: true; acces: Acces } | { ok: false; message: string };

/**
 * Contrôle commun à toutes les actions : origine, session, niveau d'assurance,
 * et empreinte d'IP pour le journal. `exigerAal2` ferme les actions qui
 * modifient l'état du compte aux seules sessions complètes.
 */
async function ouvrirAcces(exigerAal2: boolean): Promise<VerdictAcces> {
  const enTetes = headers();
  if (!controleOrigine(enTetes, "POST").autorise) {
    return { ok: false, message: "Requête refusée." };
  }

  let adminUserId: string | null = null;
  let sessionSigningSecret: string | null = null;
  let ipHashSalt: string | null = null;
  try {
    const env = getServerEnv();
    adminUserId = env.adminUserId;
    sessionSigningSecret = env.sessionSigningSecret;
    ipHashSalt = env.ipHashSalt;
  } catch {
    return { ok: false, message: "Configuration incomplète." };
  }
  if (!adminUserId || !sessionSigningSecret) {
    return { ok: false, message: "Configuration incomplète." };
  }

  const supabase = creerClientSupabase();
  const etat = await sessionMfa(supabase);
  if (!etat) return { ok: false, message: "Session invalide. Reconnectez-vous." };
  if (exigerAal2 && etat !== "complete") {
    return { ok: false, message: "Second facteur requis pour cette opération." };
  }

  const ipHash = await hacherIp(lireIpBrute(enTetes) ?? "inconnue", ipHashSalt);
  return {
    ok: true,
    acces: {
      supabase,
      adminUserId,
      etat,
      ipHash,
      hote: enTetes.get("host"),
    },
  };
}

/** Pose le cookie d'activité signé : sans lui, le middleware refermerait la porte. */
async function ouvrirSession(adminUserId: string, hote: string | null): Promise<void> {
  const { sessionSigningSecret } = getServerEnv();
  const jeton = await creerJetonActivite(adminUserId, sessionSigningSecret);
  cookies().set(NOM_COOKIE_ACTIVITE, jeton, {
    ...optionsCookieActivite(cookieSecurise(hote)),
  });
}

/** Liste des facteurs TOTP, triée entre ce qui authentifie et ce qui attend. */
async function etatFacteurs(supabase: ClientSupabase) {
  const { data, error } = await supabase.auth.mfa.listFactors();
  if (error || !data) return null;
  return {
    tous: data.all,
    verifies: data.all.filter((facteur) => facteur.status === "verified"),
    enAttente: data.all.filter((facteur) => facteur.status !== "verified"),
  };
}

/**
 * Défi + vérification chez GoTrue. Renvoie le motif technique pour le journal,
 * jamais pour l'écran : à l'écran, une seule phrase.
 */
async function testerCode(
  supabase: ClientSupabase,
  factorId: string,
  code: string,
): Promise<{ valide: boolean; motif: string }> {
  const { data: defi, error: erreurDefi } = await supabase.auth.mfa.challenge({
    factorId,
  });
  if (erreurDefi || !defi) return { valide: false, motif: "defi_impossible" };

  const { error: erreurVerif } = await supabase.auth.mfa.verify({
    factorId,
    challengeId: defi.id,
    code,
  });
  return erreurVerif
    ? { valide: false, motif: "code_refuse" }
    : { valide: true, motif: "code_accepte" };
}

// ---------------------------------------------------------------------------
// Enrôlement
// ---------------------------------------------------------------------------

/**
 * Crée un facteur en attente et renvoie de quoi le scanner. Le secret ne
 * transite qu'ici, une seule fois : GoTrue ne le redonne jamais, et c'est ce
 * qui rend l'affichage du QR irremplaçable.
 */
export async function enregistrerAppareil(): Promise<ResultatEnrolement> {
  const acces = await ouvrirAcces(false);
  if (!acces.ok) return refusEnrolement(acces.message);
  const { supabase, adminUserId, ipHash } = acces.acces;

  const debit = await limiter(`mfa:enrolement:${adminUserId}`, FENETRE_ENROLEMENT, SEUIL_ENROLEMENT);
  if (!debit.autorise) {
    await journaliser({ action: "acces_refuse", detail: "debit_enrolement", ipHash, reussite: false });
    return refusEnrolement("Trop d'enregistrements. Réessayez plus tard.");
  }

  const facteurs = await etatFacteurs(supabase);
  if (!facteurs) return refusEnrolement("Liste des appareils indisponible.");
  if (facteurs.tous.length >= MAX_APPAREILS) {
    return refusEnrolement(
      `Deux appareils au maximum. Retirez-en un avant d'en enregistrer un autre.`,
    );
  }

  const { data, error } = await supabase.auth.mfa.enroll({
    factorType: "totp",
    friendlyName: `Appareil ${facteurs.tous.length + 1}`,
    issuer: "KoniG.dev",
  });
  if (error || !data || !("totp" in data) || !data.totp) {
    await journaliser({ action: "mfa_appareil_ajoute", detail: "enrolement_refuse", ipHash, reussite: false });
    return refusEnrolement("Enregistrement impossible pour le moment.");
  }

  // L'URI fourni par le serveur est celui qui a été enregistré : on l'encode
  // tel quel plutôt que d'en reconstruire un qui pourrait diverger.
  await journaliser({ action: "mfa_appareil_ajoute", detail: "enrolement_demande", ipHash, reussite: true });

  return {
    ok: true,
    suite: null,
    global: null,
    facteur: data.id,
    uri: data.totp.uri,
    secret: data.totp.secret,
  };
}

/** Abandon d'un facteur en attente : il ne peut rien authentifier, pas de code. */
export async function abandonnerEnrolement(
  formulaire: FormData,
): Promise<ResultatMfa> {
  const acces = await ouvrirAcces(false);
  if (!acces.ok) return refus(acces.message);
  const { supabase, ipHash } = acces.acces;

  const saisie = extraireFormulaire(formulaire);
  if (saisie === null) return refus("Formulaire invalide.");
  const identifiant = saisie.factorId ?? "";
  if (!/^[0-9a-f-]{36}$/.test(identifiant)) return refus("Facteur inconnu.");

  const facteurs = await etatFacteurs(supabase);
  const cible = facteurs?.enAttente.find((facteur) => facteur.id === identifiant);
  if (!cible) return refus("Facteur inconnu.");

  const { error } = await supabase.auth.mfa.unenroll({ factorId: cible.id });
  if (error) return refus("Suppression impossible.");

  await journaliser({ action: "mfa_appareil_retire", detail: "enrolement_abandonne", ipHash, reussite: true });
  return { ok: true, suite: null, global: null };
}

// ---------------------------------------------------------------------------
// Vérification du code
// ---------------------------------------------------------------------------

/**
 * Sert aux deux moments : le premier code qui validera l'appareil fraichement
 * enregistré, et le code demandé après un mot de passe (aal1 → aal2).
 * L'identifiant du facteur vient du navigateur : il est contrôlé dans la liste
 * du compte, jamais utilisé tel quel.
 */
export async function verifierCode(formulaire: FormData): Promise<ResultatMfa> {
  const acces = await ouvrirAcces(false);
  if (!acces.ok) return refus(acces.message);
  const { supabase, adminUserId, ipHash, etat, hote } = acces.acces;

  const saisie = valider(schemaCodeMfa, extraireFormulaire(formulaire));
  if (!saisie.ok) return refus(saisie.global ?? MESSAGE_CODE);

  const debit = await limiter(`mfa:code:${adminUserId}`, FENETRE_CODE, SEUIL_CODE);
  if (!debit.autorise) {
    await journaliser({ action: "mfa_echouee", detail: "debit_code", ipHash, reussite: false });
    return refus("Trop de codes saisis. Réessayez dans quelques minutes.");
  }

  const facteurs = await etatFacteurs(supabase);
  if (!facteurs) return refus("Aucun appareil ne peut valider un code pour ce compte.");
  if (etat === "complete" && facteurs.verifies.length === 0) {
    return refus("Aucun appareil ne peut valider un code pour ce compte.");
  }
  if (!facteurs.tous.some((facteur) => facteur.id === saisie.data.factorId)) {
    await journaliser({ action: "acces_refuse", detail: "facteur_hors_compte", ipHash, reussite: false });
    return refus(MESSAGE_CODE);
  }

  const verdict = await testerCode(supabase, saisie.data.factorId, saisie.data.code);
  if (!verdict.valide) {
    await journaliser({ action: "mfa_echouee", detail: verdict.motif, ipHash, reussite: false });
    await envoyerAlerte("Échec du second facteur", "avertissement", {
      empreinte: empreinteCourte(ipHash),
      tentatives: debit.compteur,
    });
    return refus(MESSAGE_CODE);
  }

  const { data: revendications, error: erreurClaims } = await supabase.auth.getClaims();
  if (erreurClaims || revendications?.claims.aal !== "aal2") {
    await journaliser({ action: "mfa_echouee", detail: "aal_non_monte", ipHash, reussite: false });
    return refus("Le second facteur n'a pas été reconnu par le serveur.");
  }

  await ouvrirSession(adminUserId, hote);

  const etaitEnAttente = facteurs?.tous.some(
    (facteur) => facteur.id === saisie.data.factorId && facteur.status !== "verified",
  );
  await journaliser({
    action: etaitEnAttente ? "mfa_appareil_ajoute" : "mfa_verifiee",
    detail: etaitEnAttente ? "appareil_valide" : "palier_aal2",
    ipHash,
    reussite: true,
  });

  return { ok: true, suite: "/admin", global: null };
}

// ---------------------------------------------------------------------------
// Retrait d'un appareil
// ---------------------------------------------------------------------------

/**
 * Action destructive : elle exige une session complète ET un code valide émis
 * par UN AUTRE appareil que celui que l'on retire. Sans cette règle, la
 * suppression du dernier appareil aurait été une porte vers une réinitialisation
 * « à l'arrache » — et donc vers un contournement.
 */
export async function retirerAppareil(formulaire: FormData): Promise<ResultatMfa> {
  const acces = await ouvrirAcces(true);
  if (!acces.ok) return refus(acces.message);
  const { supabase, ipHash } = acces.acces;

  const saisie = valider(schemaCodeMfa, extraireFormulaire(formulaire));
  if (!saisie.ok) return refus(saisie.global ?? MESSAGE_CODE);

  const facteurs = await etatFacteurs(supabase);
  if (!facteurs) return refus("Liste des appareils indisponible.");

  const cible = facteurs.tous.find((facteur) => facteur.id === saisie.data.factorId);
  if (!cible) return refus("Facteur inconnu.");

  const autres = facteurs.verifies.filter((facteur) => facteur.id !== cible.id);

  if (cible.status === "verified") {
    if (autres.length === 0) {
      return refus(
        "Retirez d'abord un appareil, puis enregistrez-en un autre : le compte doit toujours pouvoir valider un code.",
      );
    }
    const preuve = await testerCode(supabase, autres[0]!.id, saisie.data.code);
    if (!preuve.valide) {
      await journaliser({ action: "mfa_echouee", detail: "reauthentification_retrait", ipHash, reussite: false });
      return refus(MESSAGE_CODE);
    }
  }

  const { error } = await supabase.auth.mfa.unenroll({ factorId: cible.id });
  if (error) {
    await journaliser({ action: "mfa_appareil_retire", detail: "echec_suppression", ipHash, reussite: false });
    return refus("Suppression impossible pour le moment.");
  }

  await journaliser({
    action: "mfa_appareil_retire",
    detail: cible.status === "verified" ? "appareil_retire" : "attente_supprimee",
    ipHash,
    reussite: true,
  });
  await envoyerAlerte("Un appareil d'authentification a été retiré", "avertissement", {
    restant: autres.length,
  });

  return { ok: true, suite: null, global: null };
}

// ---------------------------------------------------------------------------
// Déconnexions
// ---------------------------------------------------------------------------

/**
 * « Se déconnecter de tous les appareils » : le scope global chez GoTrue
 * révoque les jetons refresh de tous les navigateurs, y compris celui-ci.
 * Réservé aux sessions complètes : un aal1 ne peut pas donner d'ordre au
 * serveur d'authentification.
 */
export async function deconnecter(formulaire: FormData): Promise<ResultatMfa> {
  const acces = await ouvrirAcces(true);
  if (!acces.ok) return refus(acces.message);
  const { supabase, ipHash, hote } = acces.acces;

  const saisie = valider(schemaDeconnexion, extraireFormulaire(formulaire));
  if (!saisie.ok) return refus(saisie.global ?? "Demande invalide.");

  cookies().set(NOM_COOKIE_ACTIVITE, "", {
    ...optionsCookieActivite(cookieSecurise(hote)),
    maxAge: 0,
  });

  const { error } = await supabase.auth.signOut({ scope: saisie.data.portee });
  if (error) return refus("Déconnexion impossible pour le moment.");

  if (saisie.data.portee === "global") {
    await journaliser({ action: "deconnexion_globale", detail: null, ipHash, reussite: true });
    await envoyerAlerte("Déconnexion de tous les appareils", "info", {});
  }

  return { ok: true, suite: "/admin/login", global: null };
}
