/**
 * Export CSV — protection contre l'injection de formules.
 *
 * Une cellule qui commence par = + - @ (ou tabulation/retour chariot, autres
 * préfixes reconnus des tableurs) est interprétée comme une formule par Excel,
 * LibreOffice et Google Sheets. Une visiteuse peut placer un nom de famille en
 * `=cmd|...` ou `=HYPERLINK(...)` depuis le formulaire de contact : l'export
 * le recrachera tel quel, et la formule s'exécutera à l'ouverture.
 *
 * Parade : préfixer d'une apostrophe (ignorée à l'affichage par le tableur, qui
 * traite alors la cellule comme du texte) toute cellule dont le premier
 * caractère appartient à cette liste.
 */

const PREFIXE_FORMULE = /^[=+\-@\t\r]/;
const CONTROLE = new RegExp("[\\u0000-\\u001F\\u007F]", "g");

export type Cellule = string | number | boolean | null | undefined;

/** Texte prêt pour une cellule : caractères de contrôle retirés, formule neutralisée. */
export function desinfecterCellule(valeur: Cellule): string {
  if (valeur === null || valeur === undefined) return "";
  const brut = typeof valeur === "string" ? valeur : String(valeur);
  const propre = brut.replace(CONTROLE, " ").trim();
  return PREFIXE_FORMULE.test(propre) ? `'${propre}` : propre;
}

function echapper(valeur: Cellule): string {
  const texte = desinfecterCellule(valeur);
  // Guillemets doublés si la cellule contient un séparateur ou un guillemet.
  return /[";\n]/.test(texte) ? `"${texte.replace(/"/g, '""')}"` : texte;
}

/**
 * Construit un document CSV.
 * Séparateur `;` (usage des tableurs francophones), fins de ligne CRLF, et BOM
 * UTF-8 pour que les accents ne soient pas mutilés à l'ouverture sous Excel.
 */
export function construireCsv(
  entetes: readonly string[],
  lignes: readonly (readonly Cellule[])[],
): string {
  const lignesTexte = [entetes, ...lignes].map((ligne) =>
    ligne.map(echapper).join(";"),
  );
  return `${lignesTexte.join("\r\n")}\r\n`;
}

/** En-têtes de réponse pour forcer le téléchargement d'un CSV. */
export function enTetesTelechargementCsv(nomFichier: string): Record<string, string> {
  const sur = nomFichier.replace(/[^a-z0-9._-]/gi, "_");
  return {
    "Content-Type": "text/csv; charset=utf-8",
    "Content-Disposition": `attachment; filename="${sur}"`,
    "Cache-Control": "no-store",
  };
}
