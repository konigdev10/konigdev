/**
 * Cookie d'activité de la session admin.
 *
 * Supabase gère la durée de vie du jeton, mais pas « 30 minutes d'inactivité »
 * ni « 8 heures maximum » côté application. Ces deux bornes vivent ici, dans un
 * cookie signé HMAC-SHA256 avec SESSION_SIGNING_SECRET : sans la signature, le
 * navigateur pourrait écrire son propre horodatage et rester connecté
 * indéfiniment.
 *
 * Le module est utilisé par le middleware (runtime Edge) et par les actions
 * serveur (Node) : uniquement Web Crypto et aucun module Node, pour que le même
 * code tourne dans les deux.
 */

export const NOM_COOKIE_ACTIVITE = "konig_activite";

/** Secondes sans interaction avant déconnexion. */
export const INACTIVITE_MAX = 30 * 60;
/** Durée totale de la session, interaction ou non. */
export const DUREE_SESSION_MAX = 8 * 60 * 60;

/** Tolérance d'horloge, en secondes, entre deux invocations sans état partagé. */
export const MARGE_HORLOGE = 60;

const CODEUR = new TextEncoder();

function versBase64Url(donnees: ArrayBuffer): string {
  const octets = new Uint8Array(donnees);
  let binaire = "";
  for (let index = 0; index < octets.length; index += 1) {
    binaire += String.fromCharCode(octets[index] as number);
  }
  return btoa(binaire).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function cleHmac(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    CODEUR.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

/** Comparaison qui ne dépend pas du moment où les chaînes divergent. */
function comparaisonConstante(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let delta = 0;
  for (let i = 0; i < a.length; i += 1) {
    delta |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return delta === 0;
}

/** Émis après une double authentification réussie. */
export async function creerJetonActivite(
  adminUserId: string,
  secret: string,
): Promise<string> {
  const maintenant = Math.floor(Date.now() / 1000);
  const corps = `${maintenant}.${maintenant}.${adminUserId}`;
  const signature = await crypto.subtle.sign(
    "HMAC",
    await cleHmac(secret),
    CODEUR.encode(corps),
  );
  return `${btoa(corps)}.${versBase64Url(signature)}`;
}

export type MotifRefus =
  | "absent"
  | "forme"
  | "signature"
  | "utilisateur"
  | "inactif"
  | "expire"
  | "future";

export interface ResultatVerif {
  valide: boolean;
  motif: MotifRefus | null;
}

/** Vérifie signature, titulaire et les deux bornes de durée. */
export async function verifierJetonActivite(
  valeur: string | null,
  adminUserId: string,
  secret: string,
): Promise<ResultatVerif> {
  if (!valeur) return { valide: false, motif: "absent" };

  const [corpsEncode, signature, ...reste] = valeur.split(".");
  if (!corpsEncode || !signature || reste.length > 0) {
    return { valide: false, motif: "forme" };
  }

  let corps: string;
  try {
    corps = atob(corpsEncode);
  } catch {
    return { valide: false, motif: "forme" };
  }

  const attendu = await crypto.subtle.sign(
    "HMAC",
    await cleHmac(secret),
    CODEUR.encode(corps),
  );
  if (!comparaisonConstante(signature, versBase64Url(attendu))) {
    return { valide: false, motif: "signature" };
  }

  const [debut, derniere, titulaire] = corps.split(".");
  const maintenant = Math.floor(Date.now() / 1000);
  const tDebut = Number(debut);
  const tDerniere = Number(derniere);

  if (!Number.isInteger(tDebut) || !Number.isInteger(tDerniere)) {
    return { valide: false, motif: "forme" };
  }
  // Un horodatage dans le futur rendrait les deux soustractions négatives :
  // ni l'inactivité ni la durée maximale ne se déclencheraient plus jamais.
  // Une marge d'une minute absorbe le décalage d'horloge entre deux
  // invocations Vercel, rien de plus.
  if (tDebut > maintenant + MARGE_HORLOGE || tDerniere > maintenant + MARGE_HORLOGE) {
    return { valide: false, motif: "future" };
  }
  if (titulaire !== adminUserId) {
    return { valide: false, motif: "utilisateur" };
  }
  if (maintenant - tDerniere > INACTIVITE_MAX) {
    return { valide: false, motif: "inactif" };
  }
  if (maintenant - tDebut > DUREE_SESSION_MAX) {
    return { valide: false, motif: "expire" };
  }

  return { valide: true, motif: null };
}

/** Valeur du cookie à réécrire à chaque requête admin valide. */
export async function renouvelerJetonActivite(
  valeur: string,
  adminUserId: string,
  secret: string,
): Promise<string> {
  const [corpsEncode] = valeur.split(".");
  const corps = atob(corpsEncode ?? "");
  const [debut] = corps.split(".");
  const maintenant = Math.floor(Date.now() / 1000);
  const nouveauCorps = `${debut}.${maintenant}.${adminUserId}`;
  const signature = await crypto.subtle.sign(
    "HMAC",
    await cleHmac(secret),
    CODEUR.encode(nouveauCorps),
  );
  return `${btoa(nouveauCorps)}.${versBase64Url(signature)}`;
}

/** Options de pose du cookie, identiques partout. L'attribut Secure dépend de
 *  l'hôte : sur http://localhost il est impossible, et le cookie d'activité
 *  signerait une session pourtant bien réelle. */
export function optionsCookieActivite(securise: boolean) {
  return {
    httpOnly: true,
    secure: securise,
    sameSite: "lax",
    path: "/",
    maxAge: DUREE_SESSION_MAX,
  } as const;
}
