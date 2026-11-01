/**
 * Hachage et lecture des données visiteur.
 *
 * Règle centrale : l'adresse IP brute n'est JAMAIS persistée ni transmise. On
 * ne conserve qu'un SHA-256 salé, utilisé uniquement pour compter des visiteurs
 * uniques. Changer IP_HASH_SALT rend tous les hash déjà enregistrés
 * impossibles à relier aux nouveaux — c'est le comportement attendu.
 */

const FORME_ADRESSE = /^[0-9a-f:.]+$/i;
const CONTROLE = new RegExp("[\\u0000-\\u001F\\u007F]", "g");

/** Première adresse de la chaîne x-forwarded-for posée par l'edge Vercel. */
export function lireIpBrute(enTetes: Headers): string | null {
  const entete = enTetes.get("x-forwarded-for");
  if (!entete) return null;
  const premiere = entete.split(",")[0]?.trim();
  if (!premiere || premiere.length > 100 || !FORME_ADRESSE.test(premiere)) {
    return null;
  }
  return premiere;
}

/**
 * SHA-256(valeur + sel) en hexadécimal minuscule sur 64 caractères.
 * Web Crypto : présent à la fois dans le runtime Edge du middleware et dans
 * Node, donc un seul chemin de code pour les deux.
 */
export async function hacherEmpreinte(
  valeur: string,
  sel: string,
): Promise<string | null> {
  if (!valeur || !sel) return null;
  const octets = new TextEncoder().encode(`${valeur}:${sel}`);
  const empreinte = await crypto.subtle.digest("SHA-256", octets);
  return Array.from(new Uint8Array(empreinte))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Adresse IP réduite à une empreinte salée : la valeur brute n'est jamais stockée. */
export async function hacherIp(
  ip: string,
  sel: string,
): Promise<string | null> {
  return hacherEmpreinte(ip, sel);
}

/** Empreinte d'une adresse email, pour limiter les tentatives par compte. */
export async function hacherEmail(email: string, sel: string): Promise<string | null> {
  return hacherEmpreinte(email.trim().toLowerCase(), sel);
}

/** UUID de visiteur, accepté uniquement après consentement explicite. */
export function estUuid(valeur: unknown): valeur is string {
  return (
    typeof valeur === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      valeur,
    )
  );
}

export interface LocalisationServeur {
  pays: string | null;
  region: string | null;
  ville: string | null;
}

/**
 * En-têtes géographiques ajoutés par l'edge Vercel. Un visiteur ne peut pas les
 * forge : ils sont posés par l'infrastructure. On les lit donc exclusivement
 * côté serveur, et on décode leur valeur percent-encodée avec la dernière
 * précaution (le décodage peut échouer sur une entrée malformée).
 */
export function lireLocalisation(enTetes: Headers): LocalisationServeur {
  return {
    pays: nettoyer(enTetes.get("x-vercel-ip-country"), 60),
    region: nettoyer(enTetes.get("x-vercel-ip-country-region"), 60),
    ville: nettoyer(enTetes.get("x-vercel-ip-city"), 60),
  };
}

/** Tronque, décode et retire les caractères de contrôle d'une donnée externe. */
export function nettoyer(valeur: string | null, max: number): string | null {
  if (valeur === null) return null;
  let texte = valeur;
  try {
    texte = decodeURIComponent(valeur);
  } catch {
    // Percent-encodage invalide : on garde la valeur brute, tronquée.
  }
  texte = texte
    .replace(CONTROLE, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
  return texte.length > 0 ? texte : null;
}
