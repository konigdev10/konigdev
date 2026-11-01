import "server-only";

import { creerClientAdmin } from "@/lib/supabase/admin";
import type { RateLimitEtat } from "@/lib/supabase/database.types";

/**
 * Limitation de débit persistante.
 *
 * Vercel exécute le code dans des fonctions sans état partagé : un compteur en
 * mémoire ne survivrait ni à deux invocations, ni à deux régions. Le compteur
 * vit donc dans la table rate_limits, incrémenté par la fonction SQL
 * public.rate_limit_hit() en un seul aller-retour, sous verrou de ligne — deux
 * requêtes simultanées ne peuvent pas toutes deux passer sous le seuil.
 */

export interface ResultatLimiteur {
  autorise: boolean;
  compteur: number;
  /** Échéance du blocage en secondes POSIX, ou null si non bloqué. */
  bloqueJusqua: number | null;
}

/**
 * @param cle        identifiant de la fenêtre, ex. `track:ip:<hash>` ou
 *                   `login:ip:<hash>`. Ne jamais y mettre une IP en clair.
 * @param dureeSeconde taille du fenêtrage en secondes.
 * @param seuil      nombre de hits autorisé par fenêtre.
 * @param tolererPanne comportement si la base est injoignable :
 *   false (défaut) = refus, pour tout ce qui touche à l'authentification et à
 *   l'écriture de données ; true = acceptation, réservé à la mesure d'audience,
 *   qui ne doit jamais casser le site.
 */
export async function limiter(
  cle: string,
  dureeSeconde: number,
  seuil: number,
  tolererPanne = false,
): Promise<ResultatLimiteur> {
  const client = creerClientAdmin();
  const { data, error } = await client.rpc("rate_limit_hit", {
    p_cle: cle,
    p_duree: dureeSeconde,
    p_seuil: seuil,
  });

  if (error || !Array.isArray(data) || data.length === 0) {
    return {
      autorise: tolererPanne,
      compteur: 0,
      bloqueJusqua: tolererPanne ? null : Math.ceil(Date.now() / 1000) + dureeSeconde,
    };
  }

  const etat = data[0] as RateLimitEtat;
  const echeance = Math.floor(new Date(etat.blocage_jusqua).getTime() / 1000);
  return {
    autorise: etat.autorise,
    compteur: etat.compteur,
    bloqueJusqua: etat.autorise ? null : echeance,
  };
}

/** En-têtes à renvoyer avec une réponse 429. */
export function enTetesLimiteur(resultat: ResultatLimiteur): Record<string, string> {
  const seconde = Math.max(0, (resultat.bloqueJusqua ?? 0) - Math.floor(Date.now() / 1000));
  return {
    "Retry-After": String(seconde || 1),
    "X-RateLimit-Limit": "0",
    "X-RateLimit-Remaining": "0",
  };
}
