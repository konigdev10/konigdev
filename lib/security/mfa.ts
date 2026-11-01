/**
 * Constantes partagées du second facteur.
 *
 * Un fichier à part, et non les actions : un module « use server » ne peut
 * exporter que des fonctions asynchrones. Ces valeurs sont lues aussi bien par
 * le rendu de la page que par les actions et par l'interface.
 */

/**
 * Deux appareils, pas un de plus. Assez pour ne pas être enfermé dehors quand
 * on change de téléphone, trop peu pour multiplier les portes. La limite est
 * aussi ce qui rend inutile un système de codes de secours.
 */
export const MAX_APPAREILS = 2;

/** Fenêtre et seuil de saisie des codes : 10 codes par quart d'heure et par compte. */
export const FENETRE_CODE = 900;
export const SEUIL_CODE = 10;

/** Fenêtre et seuil des enregistrements d'appareil : 8 par heure et par compte. */
export const FENETRE_ENROLEMENT = 3600;
export const SEUIL_ENROLEMENT = 8;
