import "server-only";

import { getServerEnv } from "@/lib/env";

/**
 * Alertes vers n8n, qui les relaye par email.
 *
 * Trois règles :
 *  - l'appel part toujours du serveur, jamais du navigateur ;
 *  - l'en-tête N8N_WEBHOOK_SECRET accompagne chaque requête ;
 *  - une alerte qui échoue ne doit jamais bloquer l'action de l'admin :
 *    on consigne un log serveur sans détail et on continue.
 *
 * La charge utile ne contient ni mot de passe, ni clé, ni adresse IP en clair :
 * uniquement des identifiants techniques tronqués et des compteurs.
 */

export type NiveauAlerte = "info" | "avertissement" | "critique";

const TIMEOUT_MS = 8000;

/**
 * URL du webhook acceptée seulement si elle est en https (ou en http sur
 * localhost, pour un n8n auto-hébergé en développement). Une secrète ne part
 * pas vers un endpoint en clair.
 */
function urlAcceptable(url: string): boolean {
  try {
    const analyse = new URL(url);
    return (
      analyse.protocol === "https:" ||
      (analyse.protocol === "http:" &&
        (analyse.hostname === "localhost" || analyse.hostname === "127.0.0.1"))
    );
  } catch {
    return false;
  }
}

export async function envoyerAlerte(
  sujet: string,
  niveau: NiveauAlerte,
  details: Record<string, string | number | boolean | null> = {},
): Promise<void> {
  const { n8nWebhookUrl, n8nWebhookSecret } = getServerEnv();
  if (!n8nWebhookUrl) return;

  if (!urlAcceptable(n8nWebhookUrl)) {
    console.warn("alerte_url_rejetee");
    return;
  }

  const enTetes: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (n8nWebhookSecret) enTetes["x-webhook-secret"] = n8nWebhookSecret;

  try {
    const reponse = await fetch(n8nWebhookUrl, {
      method: "POST",
      headers: enTetes,
      body: JSON.stringify({
        source: "admin-konigdev",
        sujet,
        niveau,
        horodatage: new Date().toISOString(),
        ...details,
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: "no-store",
    });

    if (!reponse.ok) console.warn("alerte_webhook_" + niveau);
  } catch {
    console.warn("alerte_echouee");
  }
}

/** Empreinte tronquée : đủ pour correler deux événements, inutile pour pister. */
export function empreinteCourte(empreinte: string | null): string | null {
  return empreinte ? empreinte.slice(0, 12) : null;
}
