import "server-only";

import { getServerEnv } from "@/lib/env";

/**
 * Cloudflare Turnstile, côté serveur.
 *
 * Optionnel : si TURNSTILE_SECRET_KEY n'est pas définie, la page de connexion
 * fonctionne sans widget et ce module renvoie vrai. Dès qu'elle est définie,
 * l'absence de jeton ou une vérification qui échoue refuse la connexion :
 * c'est un second facteur humain, pas un ornement.
 *
 * Le secret ne quitte jamais le serveur ; seul le site key est exposé au
 * navigateur.
 */

const URL_VERIFICATION =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";

const TIMEOUT_MS = 5000;

/** Vrai si le widget doit être servi (donc si la page doit l'afficher). */
export function turnstileActive(): boolean {
  const { turnstileSecretKey } = getServerEnv();
  return turnstileSecretKey !== null;
}

export type VerdictTurnstile =
  | { ok: true }
  | { ok: false; motif: "absent" | "refuse" | "panne" };

export async function verifierTurnstile(
  jeton: string | null,
  ip: string | null,
): Promise<VerdictTurnstile> {
  const { turnstileSecretKey } = getServerEnv();
  if (!turnstileSecretKey) return { ok: true };

  if (!jeton || jeton.length < 8 || jeton.length > 4096) {
    return { ok: false, motif: "absent" };
  }

  const corps = new URLSearchParams({
    secret: turnstileSecretKey,
    response: jeton,
  });
  if (ip) corps.set("remoteip", ip);

  try {
    const reponse = await fetch(URL_VERIFICATION, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: corps.toString(),
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: "no-store",
    });

    if (!reponse.ok) return { ok: false, motif: "panne" };

    const contenu: unknown = await reponse.json();
    const succes =
      typeof contenu === "object" &&
      contenu !== null &&
      (contenu as { success?: unknown }).success === true;

    // Les codes-motifs de Cloudflare vont dans les logs serveur, jamais à
    // l'écran : ils n'apprennent rien au visiteur et renseigneraient un attaquant.
    if (!succes) console.warn("turnstile_refuse");
    return succes ? { ok: true } : { ok: false, motif: "refuse" };
  } catch {
    // Cloudflare injoignable : refus, la connexion n'est pas essentielle.
    console.warn("turnstile_panne");
    return { ok: false, motif: "panne" };
  }
}
