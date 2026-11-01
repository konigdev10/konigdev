/**
 * Contrôle d'origine (CSRF) pour les routes qui modifient des données.
 *
 * Les actions serveur Next sont déjà protégées par next.config.mjs
 * (experimental.serverActions.allowedOrigins, liste vide = même origine
 * uniquement). Ce module couvre les app/api/*, que Next ne protège pas.
 *
 * Règle : sur une requête qui écrit, une origine absente ou différente est
 * refusée. Les navigateurs modernes envoient toujours Origin sur POST ; une
 * requête sans Origin est soit un outil en ligne de commande, soit un client
 * ancien — dans les deux cas elle n'a rien à faire ici.
 */

const METHODES_SURES = new Set(["GET", "HEAD", "OPTIONS"]);

export interface ResultatOrigine {
  autorise: boolean;
  motif: string | null;
}

export function controleOrigine(
  enTetes: Headers,
  methode: string,
): ResultatOrigine {
  const hote = enTetes.get("host");
  const origine = enTetes.get("origin");
  const secFetchSite = enTetes.get("sec-fetch-site");

  if (!hote) {
    return { autorise: false, motif: "hote absent" };
  }

  // Un navigateur qui déclare une provenance cross-site est refusé sans plus
  // de discussion, même si Origin a été manipulé pour coller.
  if (secFetchSite && secFetchSite !== "same-origin" && secFetchSite !== "none") {
    return { autorise: false, motif: `sec-fetch-site=${secFetchSite}` };
  }

  if (!origine) {
    return METHODES_SURES.has(methode.toUpperCase())
      ? { autorise: true, motif: null }
      : { autorise: false, motif: "origine absente" };
  }  let urlOrigine: URL;
  try {
    urlOrigine = new URL(origine);
  } catch {
    return { autorise: false, motif: "origine invalide" };
  }

  const enHttps = urlOrigine.protocol === "https:";
  const enLocalhost =
    urlOrigine.protocol === "http:" &&
    (urlOrigine.hostname === "localhost" || urlOrigine.hostname === "127.0.0.1");

  if (!enHttps && !enLocalhost) {
    return { autorise: false, motif: "protocole non autorisé" };
  }
  if (urlOrigine.host !== hote) {
    return { autorise: false, motif: "origine différente de l'hôte" };
  }

  return { autorise: true, motif: null };
}

/** Version courte pour les garde-fous en tête de route. */
export function origineAcceptable(
  enTetes: Headers,
  methode: string,
): boolean {
  return controleOrigine(enTetes, methode).autorise;
}
