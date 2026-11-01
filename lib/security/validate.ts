import { z } from "zod";

/**
 * Validation des entrées. Toute donnée venant d'un formulaire, d'une route API
 * ou d'une URL passe par un schéma strict avant d'atteindre la base : les
 * champs inconnus sont rejetés, pas ignorés — un champ en trop est souvent une
 * tentative de faire passer une colonne qu'on n'aurait pas due.
 */

// ---------------------------------------------------------------------------
// Aides
// ---------------------------------------------------------------------------

const FORME_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Résultat normalisé d'une validation, prêt à afficher sous les champs. */
export type ResultatValidation<T> =
  | { ok: true; data: T }
  | { ok: false; champs: Record<string, string>; global: string | null };

/** Erreur réduite à ce que l'afficheurs utilisent : des messages et le chemin
 *  du champ concerné. Décrit structurellement pour ne pas dépendre du nom du
 *  type d'erreur, qui change entre les versions de zod. */
type ErreurValidation = {
  issues: readonly {
    message: string;
    path: readonly (string | number | symbol)[];
  }[];
};

/** Forme minimale d'un schéma zod, écrite structurellement pour ne pas dépendre
 *  du nombre de paramètres génériques de ZodType selon la version. */
export interface Schema<T> {
  safeParse(entre: unknown):
    | { success: true; data: T }
    | { success: false; error: ErreurValidation };
}

export function valider<T>(
  schema: Schema<T>,
  entre: unknown,
): ResultatValidation<T> {
  const resultat = schema.safeParse(entre);
  if (resultat.success) {
    return { ok: true, data: resultat.data };
  }
  const champs: Record<string, string> = {};
  let global: string | null = null;
  for (const probleme of resultat.error.issues) {
    const cle = probleme.path.join(".");
    const message = problemeMessage(cle);
    if (cle === "") global = message;
    else if (!champs[cle]) champs[cle] = message;
  }
  return { ok: false, champs, global };
}

/** Message d'erreur générique : on ne renvoie jamais la syntaxe interne de zod
 *  ni un fragment de la valeur soumise. */
function problemeMessage(champ: string): string {
  switch (champ) {
    case "email":
      return "Adresse email invalide.";
    case "motDePasse":
      return "Mot de passe invalide.";
    case "code":
      return "Code à 6 chiffres attendu.";
    case "nom":
      return "Nom invalide.";
    case "contact":
      return "Email ou numéro de téléphone invalide.";
    case "message":
      return "Message invalide.";
    default:
      return "Valeur invalide.";
  }
}

// ---------------------------------------------------------------------------
// Mots de passe
// ---------------------------------------------------------------------------

/**
 * Liste de mots de passe refusés. Ce n'est pas une base exhaustive : elle
 * couvre les fautes prévisibles dans un contexte francophone. La vraie
 * barrière est la longueur minimale de 14 caractères combinée à la diversité
 * des classes.
 */
const MOTS_DE_PASSE_COMMUNS: readonly string[] = [
  "azerty", "azertyuiop", "qwerty", "qwertyuiop", "azerty123", "qwerty123",
  "123456", "12345678", "123456789", "1234567890", "000000", "111111",
  "motdepasse", "mot de passe", "passepartout", "bonjour", "admin",
  "administrateur", "supabase", "konigdev", "konig", "password",
  "password1", "password123", "iloveyou", "letmein", "welcome", "monkey",
  "soleil", "azertyuiop123", "abc123", "a123456", "1q2w3e4r", "qazwsx",
  "iloveyou1", "sunshine", "princess", "football", "baseball", "trustno1",
  "dragon", "shadow", "master", "login", "starwars", "classeur",
  "0612345678", "brazzaville", "pointenoire", "congo1234", "africa2024",
];

export interface VerdictMotDePasse {
  acceptable: boolean;
  raison: string | null;
}

/** Règle appliquée à la CRÉATION ou au changement de mot de passe. */
export function verifierMotDePasse(
  valeur: string,
  email?: string | null,
): VerdictMotDePasse {
  if (valeur.length < 14) {
    return {
      acceptable: false,
      raison: "14 caractères minimum.",
    };
  }
  if (valeur.length > 200) {
    return { acceptable: false, raison: "Mot de passe trop long." };
  }

  const normalise = valeur.toLowerCase();
  if (MOTS_DE_PASSE_COMMUNS.includes(normalise)) {
    return { acceptable: false, raison: "Mot de passe trop courant." };
  }
  // Suite de clavier ou de chiffres : azertyuiop, 1234567890123, abcdefghijklmn
  const SUITES = [
    "azertyuiop", "qsdfghjklm", "wxcvbn", "qwertyuiop", "asdfghjkl",
    "0123456789", "abcdefghijkl",
  ];
  if (SUITES.some((suite) => normalise.includes(suite))) {
    return { acceptable: false, raison: "Contient une suite trop prévisible." };
  }
  if (!/[A-Z]/.test(valeur) || !/[a-z]/.test(valeur) || !/[0-9]/.test(valeur)) {
    return {
      acceptable: false,
      raison: "Doit mélanger majuscules, minuscules et chiffres.",
    };
  }
  const local = email?.split("@")[0]?.toLowerCase();
  if (local && local.length >= 4 && normalise.includes(local)) {
    return {
      acceptable: false,
      raison: "Ne doit pas contenir votre adresse email.",
    };
  }
  return { acceptable: true, raison: null };
}

// ---------------------------------------------------------------------------
// Schémas de l'étape 1
// ---------------------------------------------------------------------------

export function extraireFormulaire(formulaire: FormData): Record<string, string> | null {
  const valeurs: Record<string, string> = Object.create(null);
  const entrees = Array.from(formulaire.entries());
  for (const [cle, valeur] of entrees) {
    if (typeof valeur !== "string" || Object.hasOwn(valeurs, cle)) return null;
    valeurs[cle] = valeur;
  }
  return valeurs;
}

export function motDePasseRecent(amr: unknown): boolean {
  if (!Array.isArray(amr)) return false;
  const maintenant = Math.floor(Date.now() / 1000);
  return amr.some((entree: unknown) => {
    if (typeof entree !== "object" || entree === null) return false;
    const methode = "method" in entree ? entree.method : null;
    const date = "timestamp" in entree ? entree.timestamp : null;
    return methode === "password" && typeof date === "number" &&
      Number.isInteger(date) && date <= maintenant + 60 && maintenant - date <= 600;
  });
}

export const schemaConnexion = z.strictObject({
  email: z
    .string()
    .trim()
    .min(3)
    .max(254)
    .refine((v) => FORME_EMAIL.test(v), "email invalide"),
  motDePasse: z.string().min(14).max(200)
    .refine((v) => !MOTS_DE_PASSE_COMMUNS.includes(v.toLowerCase())),
  site_web: z.string().max(200).optional().default(""),
  jeton_turnstile: z.string().max(4096).optional().default(""),
});

export const schemaCodeMfa = z.strictObject({
  code: z.string().regex(/^[0-9]{6}$/, "code à 6 chiffres"),
  factorId: z.uuid(),
});

export const schemaEnrolementMfa = z.strictObject({
  remplacer: z.uuid().optional(),
});

export const schemaDeconnexion = z.discriminatedUnion("portee", [
  z.strictObject({ portee: z.literal("local") }),
  z.strictObject({ portee: z.literal("global"), confirmation: z.literal("oui") }),
]);

export const schemaMotDePasseNeuf = z.strictObject({
  email: z.string().trim().min(3).max(254),
  motDePasse: z.string().min(14).max(200),
  confirmation: z.string().min(14).max(200),
}).refine((v) => v.motDePasse === v.confirmation, {
  message: "Les deux saisies diffèrent.",
  path: ["confirmation"],
});

/** Réauthentification demandée avant toute action destructive. */
export const schemaReauthentification = z.strictObject({
  email: z.string().trim().min(3).max(254),
  motDePasse: z.string().min(1).max(200),
  code: z.string().trim().regex(/^[0-9]{6}$/, "code à 6 chiffres"),
});

export type EntreeConnexion = z.infer<typeof schemaConnexion>;
export type EntreeCodeMfa = z.infer<typeof schemaCodeMfa>;
export type EntreeReauthentification = z.infer<
  typeof schemaReauthentification
>;

/** Tronque et nettoie une chaîne destinée à être stockée puis réaffichée. */
export function texteSur(valeur: unknown, max: number): string {
  const brut = typeof valeur === "string" ? valeur : "";
  const controle = new RegExp("[\\u0000-\\u001F\\u007F]", "g");
  return brut.replace(controle, " ").trim().slice(0, max);
}
