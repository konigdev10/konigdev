/**
 * Middleware d'entrée : en-têtes de sécurité et porte d'accès à l'administration.
 *
 * Runtime Edge : uniquement Web Crypto, aucun module Node, aucun import de
 * lib/supabase/server.ts (qui dépend de next/headers et du runtime Node).
 *
 * Deux responsabilités, volontairement séparées :
 *  1. Toutes les requêtes : un nonce Content-Security-Policy différent à chaque
 *     passage, posé sur l'en-tête de réponse et transmis au rendu par
 *     l'en-tête de requête x-nextjs-csp-nonce. Next lit ce nonce dans l'en-tête
 *     CSP et le reporte sur ses propres scripts inline.
 *  2. /admin et /api/admin : rafraîchissement de la session Supabase, puis
 *     triple vérification (titulaire = ADMIN_USER_ID, niveau aal2, cookie
 *     d'activité signé). Les pages répondent par une redirection, les API par
 *     un 401 : une API n'a rien à faire d'un HTML de connexion.
 *
 * Ce fichier n'est JAMAIS la seule défense. Chaque page, chaque action serveur
 * et chaque route API de l'admin revérifie pour son propre compte (voir
 * lib/security/guard.ts), et la RLS exige elle aussi admin + aal2.
 */

import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { cookieSecurise, envMiddleware, nomCookieAuth } from "@/lib/env";
import {
  NOM_COOKIE_ACTIVITE,
  optionsCookieActivite,
  renouvelerJetonActivite,
  verifierJetonActivite,
} from "@/lib/security/session";

const EN_TETE_NONCE = "x-nextjs-csp-nonce";

const PAGE_CONNEXION = "/admin/login";
const PAGE_MFA = "/admin/mfa";
const TABLEAU_DE_BORD = "/admin";

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|_next/data|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:ico|png|jpe?g|webp|avif|svg|gif|css|js|woff2?|ttf|otf|mp4|webm)$).*)",
  ],
};

// ---------------------------------------------------------------------------
// Nonce et Content-Security-Policy
// ---------------------------------------------------------------------------

/** 16 octets aléatoires en hexadécimal : ni tiret, rien à deviner. */
function creerNonce(): string {
  const octets = new Uint8Array(16);
  crypto.getRandomValues(octets);
  return Array.from(octets, (octet) => octet.toString(16).padStart(2, "0")).join("");
}

function origineSupabase(url: string | null): string | null {
  if (!url) return null;
  try {
    return new URL(url).origin;
  } catch {
    return null;
  }
}

/**
 * 'self' partout, aucune connexion vers un tiers autre que mon instance
 * Supabase (et Cloudflare Turnstile quand il est activé). Pas d''unsafe-inline'
 * pour les scripts : c'est le nonce qui autorise ceux injectés par Next.
 *
 * En développement, Next charge son overlay et le rechargement à chaud avec
 * des scripts inline et des websockets. Les assouplissements sont conditionnés
 * à NODE_ENV, constante remplacée au build : la branche développement
 * disparaît du bundle de production.
 */
function construireCsp(
  nonce: string,
  avecTurnstile: boolean,
  urlSupabase: string | null,
): string {
  const enDeveloppement = process.env.NODE_ENV === "development";
  const hote = origineSupabase(urlSupabase);
  const cloudflare = "https://challenges.cloudflare.com";

  const scriptSrc = [
    "'self'",
    `'nonce-${nonce}'`,
    avecTurnstile ? cloudflare : null,
    ...(enDeveloppement ? ["'unsafe-inline'", "'unsafe-eval'"] : []),
  ].join(" ");

  const connectSrc = [
    "'self'",
    hote,
    ...(enDeveloppement ? ["ws:", "wss:"] : []),
  ].join(" ");

  return [
    "default-src 'self'",
    `script-src ${scriptSrc}`,
    // React pose des styles inline (attribut style). Sans 'unsafe-inline' ici
    // l'interface se déforme ; les styles ne peuvent pas exécuter de code, la
    // stricte restriction reste sur script-src.
    "style-src 'self' 'unsafe-inline'",
    // blob: sert à l'aperçu local d'une image avant son envoi au serveur.
    `img-src 'self' data: blob:${hote ? ` ${hote}` : ""}`,
    "font-src 'self' data:",
    `connect-src ${connectSrc}`,
    `frame-src ${avecTurnstile ? cloudflare : "'none'"}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join("; ");
}

// ---------------------------------------------------------------------------
// Réponses
// ---------------------------------------------------------------------------

interface OperationCookie {
  name: string;
  value: string;
  options: CookieOptions;
}

interface Contexte {
  csp: string;
  nonce: string;
  cookiesSecure: boolean;
  cookiesAFixer: OperationCookie[];
  /** En-têtes anti-cache fournis par @supabase/ssr dès qu'un cookie de session
   *  est écrit : sans eux, un CDN pourrait servir une session à un autre visiteur. */
  enTetesSession: Record<string, string>;
}

function finaliser(response: NextResponse, contexte: Contexte): NextResponse {
  response.headers.set("Content-Security-Policy", contexte.csp);

  if (contexte.cookiesAFixer.length > 0) {
    for (const { name, value, options } of contexte.cookiesAFixer) {
      response.cookies.set(name, value, { ...options, secure: contexte.cookiesSecure });
    }
    for (const [cle, valeur] of Object.entries(contexte.enTetesSession)) {
      response.headers.set(cle, valeur);
    }
  }
  return response;
}

/** Poursuit le rendu en transmettant le nonce à l'application. */
function passer(contexte: Contexte, request: NextRequest): NextResponse {
  const enTetes = new Headers(request.headers);
  enTetes.set(EN_TETE_NONCE, contexte.nonce);
  // Next ne reporte le nonce sur ses scripts inline que s'il lit l'en-tête CSP
  // sur la REQUÊTE ; l'en-tête de réponse seul ne suffit pas.
  enTetes.set("Content-Security-Policy", contexte.csp);
  return finaliser(NextResponse.next({ request: { headers: enTetes } }), contexte);
}

function redirection(
  request: NextRequest,
  chemin: string,
  raison?: string,
): NextResponse {
  const url = request.nextUrl.clone();
  url.pathname = chemin;
  url.search = raison ? `?raison=${encodeURIComponent(raison)}` : "";
  return NextResponse.redirect(url);
}

/** 401 générique : ni le motif, ni la cible, ni pourquoi. */
function refusApi(contexte: Contexte): NextResponse {
  const response = NextResponse.json({ erreur: "Accès refusé." }, { status: 401 });
  response.headers.set("Cache-Control", "no-store");
  return finaliser(response, contexte);
}

// ---------------------------------------------------------------------------
// Corps du middleware
// ---------------------------------------------------------------------------

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const chemin = request.nextUrl.pathname;
  const hote = request.headers.get("host") ?? request.nextUrl.host;
  const env = envMiddleware();

  const nonce = creerNonce();
  const contexte: Contexte = {
    csp: construireCsp(nonce, Boolean(env.turnstileSiteKey), env.supabaseUrl),
    nonce,
    cookiesSecure: cookieSecurise(hote),
    cookiesAFixer: [],
    enTetesSession: {},
  };

  const estPageAdmin = chemin === TABLEAU_DE_BORD || chemin.startsWith("/admin/");
  const estApiAdmin = chemin.startsWith("/api/admin");

  // Les pages publiques ne touchent pas à la session : pas d'aller-retour
  // réseau inutile à chaque visite du portfolio.
  if (!estPageAdmin && !estApiAdmin) {
    return passer(contexte, request);
  }

  // Configuration incomplète : refus, jamais ouverture par défaut.
  if (!env.supabaseUrl || !env.supabaseAnonKey || !env.adminUserId) {
    if (estApiAdmin) return refusApi(contexte);
    // La page de connexion explique elle-même le défaut ; la y renvoyer
    // encore produirait une boucle de redirections.
    if (chemin === PAGE_CONNEXION) return passer(contexte, request);
    return finaliser(redirection(request, PAGE_CONNEXION, "config"), contexte);
  }

  // ----- 1. Rafraîchir la session et lire les revendications -----
  const supabase = createServerClient(env.supabaseUrl, env.supabaseAnonKey, {
    cookieOptions: {
      name: nomCookieAuth(hote),
      httpOnly: true,
      secure: contexte.cookiesSecure,
      sameSite: "lax",
      path: "/",
    },
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(liste, enTetes) {
        for (const cookie of liste) {
          contexte.cookiesAFixer.push(cookie);
        }
        Object.assign(contexte.enTetesSession, enTetes);
      },
    },
  });

  const { data, error } = await supabase.auth.getClaims();
  const revendications = data?.claims as Record<string, unknown> | undefined;
  const sous = typeof revendications?.sub === "string" ? revendications.sub : null;
  const aal = typeof revendications?.aal === "string" ? revendications.aal : null;

  const connecte = !error && sous !== null;
  // Le titulaire doit être l'UUID administrateur : un autre compte, même
  // authentifié à un niveau aal2, ne doit rien pouvoir lire.
  const estLeBonUtilisateur = connecte && sous === env.adminUserId;
  const aal2 = aal === "aal2";

  // ----- 2. Cookie d'activité : 30 minutes d'inactivité, 8 heures maximum -----
  let activiteValide = false;
  let motifActivite: string | null = "absente";

  if (estLeBonUtilisateur && aal2 && env.sessionSigningSecret) {
    const valeur = request.cookies.get(NOM_COOKIE_ACTIVITE)?.value ?? null;
    const resultat = await verifierJetonActivite(
      valeur,
      env.adminUserId,
      env.sessionSigningSecret,
    );
    activiteValide = resultat.valide;
    motifActivite = resultat.motif;

    if (resultat.valide && valeur) {
      contexte.cookiesAFixer.push({
        name: NOM_COOKIE_ACTIVITE,
        value: await renouvelerJetonActivite(
          valeur,
          env.adminUserId,
          env.sessionSigningSecret,
        ),
        options: optionsCookieActivite(contexte.cookiesSecure),
      });
    }
  }

  const autorise = estLeBonUtilisateur && aal2 && activiteValide;

  // ----- 3. Décision -----
  if (chemin === PAGE_CONNEXION) {
    if (autorise) {
      return finaliser(redirection(request, TABLEAU_DE_BORD), contexte);
    }
    // Mot de passe validé, second facteur manquant : direction le MFA.
    if (estLeBonUtilisateur && !aal2) {
      return finaliser(redirection(request, PAGE_MFA), contexte);
    }
    return passer(contexte, request);
  }

  if (chemin === PAGE_MFA) {
    // Cette page sert deux états : aal1, il faut poser le second facteur pour
    // entrer ; aal2, elle gère les appareils enregistrés. Dans les deux cas le
    // titulaire doit être l'administrateur, sinon rien n'est affichable.
    if (!estLeBonUtilisateur) {
      return finaliser(redirection(request, PAGE_CONNEXION), contexte);
    }
    return passer(contexte, request);
  }

  if (autorise) {
    return passer(contexte, request);
  }

  // Refus : on retire le cookie d'activité pour qu'un jeton périmé ne reste
  // pas dans le navigateur et ne resserve plus tard.
  contexte.cookiesAFixer.push({
    name: NOM_COOKIE_ACTIVITE,
    value: "",
    options: { ...optionsCookieActivite(contexte.cookiesSecure), maxAge: 0 },
  });

  if (estApiAdmin) {
    return refusApi(contexte);
  }

  const raison =
    motifActivite === "inactif"
      ? "inactive"
      : motifActivite === "expire"
        ? "expiree"
        : estLeBonUtilisateur && !aal2
          ? "mfa"
          : "connexion";

  return finaliser(redirection(request, PAGE_CONNEXION, raison), contexte);
}
