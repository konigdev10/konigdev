/**
 * Convention d'affichage des dates.
 *
 * La base stocke en UTC — c'est la seule représentation sans ambiguïté. À
 * l'écran, tout ce que voit l'administrateur est composé dans le fuseau
 * Africa/Brazzaville (UTC+1, sans changement d'heure), comme l'impose le cahier
 * des charges. Ces fonctions sont appelées côté serveur : les chaînes arrivent
 * déjà correctes dans le HTML, ce qui évite un écart entre le rendu et
 * l'hydratation du navigateur.
 */

export const FUSEAU_AFFICHAGE = "Africa/Brazzaville";

const AVEC_HEURE = new Intl.DateTimeFormat("fr-FR", {
  timeZone: FUSEAU_AFFICHAGE,
  dateStyle: "long",
  timeStyle: "short",
});

const SANS_HEURE = new Intl.DateTimeFormat("fr-FR", {
  timeZone: FUSEAU_AFFICHAGE,
  dateStyle: "long",
});

const INCONNU = "date indisponible";

function compose(formateur: Intl.DateTimeFormat, horodatage: string | null | undefined): string {
  if (typeof horodatage !== "string" || horodatage === "") return INCONNU;
  const date = new Date(horodatage);
  if (Number.isNaN(date.getTime())) return INCONNU;
  return formateur.format(date);
}

/** « 1er novembre 2026 à 14:05 » */
export function afficherDateHeure(horodatage: string | null | undefined): string {
  return compose(AVEC_HEURE, horodatage);
}

/** « 1er novembre 2026 » */
export function afficherJour(horodatage: string | null | undefined): string {
  return compose(SANS_HEURE, horodatage);
}
