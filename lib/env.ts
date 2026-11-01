/**
 * Lecture centralisée des variables d'environnement.
 *
 * Deux mondes étanches :
 *  - getPublicEnv() : appelable partout, y compris dans le navigateur.
 *  - getServerEnv() : appelable uniquement côté serveur (routes, actions,
 *    middleware, modules marqués import "server-only"). Next n'inline que les
 *    variables NEXT_PUBLIC_ dans le bundle client : lire une variable privée
 *    depuis un "use client" renverrait undefined, ou ferait échouer
 *    « process is not defined ». D'où la séparation et les contrôles ci-dessous.
 *
 * Aucune valeur par défaut pour les secrets : un déploiement mal configuré doit
 * échouer au premier appel, pas tourner en mode dégradé en silence.
 */

const URL_PUBLIQUE = "NEXT_PUBLIC_SUPABASE_URL";
const CLE_ANONYME = "NEXT_PUBLIC_SUPABASE_ANON_KEY";

function lire(nom: string): string | null {
  const valeur = process.env[nom];
  return typeof valeur === "string" && valeur.length > 0 ? valeur : null;
}

export interface EnvPublic {
  supabaseUrl: string;
  supabaseAnonKey: string;
  whatsapp: string | null;
  emailContact: string | null;
  turnstileSiteKey: string | null;
}

/** Variables destinées au navigateur. La clé anonyme n'est pas un secret : la
 *  RLS ne lui autorise que la lecture des projets publiés. */
export function getPublicEnv(): EnvPublic {
  const url = lire(URL_PUBLIQUE);
  const cle = lire(CLE_ANONYME);
  if (!url || !cle) {
    throw new Error(
      "Configuration incomplète : NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY sont requises.",
    );
  }
  return {
    supabaseUrl: url,
    supabaseAnonKey: cle,
    whatsapp: lire("NEXT_PUBLIC_WHATSAPP_NUMBER"),
    emailContact: lire("CONTACT_EMAIL"),
    turnstileSiteKey: lire("NEXT_PUBLIC_TURNSTILE_SITE_KEY"),
  };
}

export interface EnvServeur {
  supabaseUrl: string;
  supabaseAnonKey: string;
  serviceRoleKey: string;
  adminUserId: string | null;
  ipHashSalt: string;
  sessionSigningSecret: string;
  cronSecret: string;
  n8nWebhookUrl: string | null;
  n8nWebhookSecret: string | null;
  turnstileSecretKey: string | null;
}

/** Serveur uniquement. Échoue si un secret manque, sans jamais l'afficher. */
export function getServerEnv(): EnvServeur {
  if (typeof window !== "undefined") {
    throw new Error("getServerEnv() est réservé au serveur.");
  }

  const url = lire(URL_PUBLIQUE);
  const anon = lire(CLE_ANONYME);
  const service = lire("SUPABASE_SERVICE_ROLE_KEY");
  const sel = lire("IP_HASH_SALT");
  const signature = lire("SESSION_SIGNING_SECRET");
  const cron = lire("CRON_SECRET");

  const manquantes: string[] = [];
  if (!url) manquantes.push(URL_PUBLIQUE);
  if (!anon) manquantes.push(CLE_ANONYME);
  if (!service) manquantes.push("SUPABASE_SERVICE_ROLE_KEY");
  if (!sel || sel.length < 32) manquantes.push("IP_HASH_SALT (32 caractères minimum)");
  if (!signature || signature.length < 32)
    manquantes.push("SESSION_SIGNING_SECRET (32 caractères minimum)");
  if (!cron || cron.length < 32) manquantes.push("CRON_SECRET (32 caractères minimum)");

  if (manquantes.length > 0) {
    throw new Error(
      `Variables d'environnement manquantes ou trop courtes : ${manquantes.join(", ")}.`,
    );
  }

  return {
    supabaseUrl: url as string,
    supabaseAnonKey: anon as string,
    serviceRoleKey: service as string,
    adminUserId: lire("ADMIN_USER_ID"),
    ipHashSalt: sel as string,
    sessionSigningSecret: signature as string,
    cronSecret: cron as string,
    n8nWebhookUrl: lire("N8N_WEBHOOK_URL"),
    n8nWebhookSecret: lire("N8N_WEBHOOK_SECRET"),
    turnstileSecretKey: lire("TURNSTILE_SECRET_KEY"),
  };
}

// ---------------------------------------------------------------------------
// Lecture réservée au middleware
// ---------------------------------------------------------------------------
// Le middleware s'exécute sur TOUTES les requêtes, y compris celles des pages
// publiques. Faire échouer getServerEnv() ici couperait le site entier à la
// première variable manquante. Cette lecture renvoie donc null plutôt que de
// jeter — mais le middleware, lui, refuse systématiquement l'administration
// dès qu'une pièce manque : l'échec est fermé là où ça compte.

export interface EnvMiddleware {
  supabaseUrl: string | null;
  supabaseAnonKey: string | null;
  adminUserId: string | null;
  sessionSigningSecret: string | null;
  turnstileSiteKey: string | null;
}

function lireLong(valeur: string | null): string | null {
  return valeur && valeur.length >= 32 ? valeur : null;
}

export function envMiddleware(): EnvMiddleware {
  return {
    supabaseUrl: lire(URL_PUBLIQUE),
    supabaseAnonKey: lire(CLE_ANONYME),
    adminUserId: lire("ADMIN_USER_ID"),
    sessionSigningSecret: lireLong(lire("SESSION_SIGNING_SECRET")),
    turnstileSiteKey: lire("NEXT_PUBLIC_TURNSTILE_SITE_KEY"),
  };
}

// ---------------------------------------------------------------------------
// Cookie de session Supabase
// ---------------------------------------------------------------------------
// __Host- impose Secure + Path=/ + absence d'attribut Domain : le cookie ne
// peut être lu par une sous-domaine voisine ni posé par un tiers. __Secure-
// exige déjà Secure mais autorise un domaine. En développement sur
// http://localhost, aucun des deux préfixes n'est possible : le navigateur
// rejetterait le cookie et la connexion ne fonctionnerait jamais.

const SANS_TLS = /^(localhost|127\.0\.0\.1|0\.0\.0\.0|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+)(:\d+)?$/;

function hoteDe(hote: string | null | undefined): string {
  if (hote) return hote;
  if (typeof window !== "undefined") return window.location.host;
  return "";
}

export function nomCookieAuth(hote?: string | null): string {
  const domaine = hoteDe(hote);
  if (domaine === "" || SANS_TLS.test(domaine)) return "sb-konig-auth";
  if (/\.vercel\.app$/.test(domaine)) return "__Secure-sb-konig-auth";
  return "__Host-sb-konig-auth";
}

/** Attribut Secure du cookie de session : impossible sans HTTPS. */
export function cookieSecurise(hote?: string | null): boolean {
  const domaine = hoteDe(hote);
  if (domaine === "") return false;
  return !SANS_TLS.test(domaine);
}
