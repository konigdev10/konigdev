/**
 * Vérification de lib/security/qr.ts.
 *
 * Cinq niveaux, du moins coûteux au plus probant :
 *  1. les nombres de la table des blocs, croisés avec ceux de zxing
 *     (EC_CODEWORDS_PER_BLOCK et NUM_ERROR_CORRECTION_BLOCKS, ISO/IEC 18004) ;
 *  2. la géométrie : le compte de modules disponibles, Independant de la table,
 *     doit redonner ces mêmes nombres de codewords, avec les bits restants
 *     publiés par la norme ;
 *  3. la matrice finale, comparée pixel à pixel à une implémentation de
 *     référence (qrcode-generator, MIT) installée JAMAIS EN PRODUCTION dans
 *     scripts/.cache. La comparaison se fait MASQUE IMPOSÉ : la bibliothèque
 *     note les 8 masques avec une zone de format vidée, ce qui peut la conduire
 *     à un autre choix que la norme. Le choix du masque est donc vérifié à part,
 *     par une implémentation indépendante de la pénalité (Annexe A).
 *  4. les bits de contrôle : format (deux copies) et version (deux copies),
 *     comparés aux mots BCH publiés par la norme ;
 *  5. la relecture intégrale : zigzag, dé-masquage et dé-interleavage refaits
 *     ici, sans rien importer de l'encodeur, doivent rendre le texte d'origine.
 *
 * Aucun de ces fichiers n'entre dans le bundle du site : scripts/ n'est pas
 * importé par app/ ni components/.
 */

import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { Script } from "node:vm";

import {
  capacite,
  codewordsCorrection,
  codewordsDonnees,
  detailBlocs,
  encoderQR,
  bitsRestants,
  modulesDisponibles,
  positionsAlignement,
  type MatriceQR,
} from "../lib/security/qr.ts";

const ici = dirname(fileURLToPath(import.meta.url));

let reussis = 0;
let echecs = 0;

function vérifier(nom: string, condition: boolean): void {
  if (condition) {
    reussis += 1;
    console.log(`  OK   ${nom}`);
  } else {
    echecs += 1;
    console.log(`  ECHEC ${nom}`);
  }
}

function egal(nom: string, brut: unknown, attendu: unknown): void {
  vérifier(`${nom} = ${String(attendu)}`, brut === attendu);
}

// ---------------------------------------------------------------------------
// 1 et 2 — tables et géométrie
// ---------------------------------------------------------------------------

/** Version 1 à 13, niveau M, relevés dans zxing (Source : Version.java). */
const ATTENDU: ReadonlyArray<{
  version: number;
  donnees: number;
  correction: number;
  alignements: readonly number[];
  bitsRestants: number;
}> = [
  { version: 1, donnees: 16, correction: 10, alignements: [], bitsRestants: 0 },
  { version: 2, donnees: 28, correction: 16, alignements: [6, 18], bitsRestants: 7 },
  { version: 3, donnees: 44, correction: 26, alignements: [6, 22], bitsRestants: 7 },
  { version: 4, donnees: 64, correction: 36, alignements: [6, 26], bitsRestants: 7 },
  { version: 5, donnees: 86, correction: 48, alignements: [6, 30], bitsRestants: 7 },
  { version: 6, donnees: 108, correction: 64, alignements: [6, 34], bitsRestants: 7 },
  { version: 7, donnees: 124, correction: 72, alignements: [6, 22, 38], bitsRestants: 0 },
  { version: 8, donnees: 154, correction: 88, alignements: [6, 24, 42], bitsRestants: 0 },
  { version: 9, donnees: 182, correction: 110, alignements: [6, 26, 46], bitsRestants: 0 },
  { version: 10, donnees: 216, correction: 130, alignements: [6, 28, 50], bitsRestants: 0 },
  { version: 11, donnees: 254, correction: 150, alignements: [6, 30, 54], bitsRestants: 0 },
  { version: 12, donnees: 290, correction: 176, alignements: [6, 32, 58], bitsRestants: 0 },
];

/**
 * Compte de modules disponibles attendu en version 13 à 20 — hors du support de
 * l'encodeur, mais la géométrie doit rester juste. Nombres recalculés à partir
 * de la table zxing : 8 × (données + correction) + bits restants publiés.
 */
const GEOMETRIE: ReadonlyArray<{
  version: number;
  modules: number;
  alignements: readonly number[];
}> = [
  { version: 13, modules: 4256, alignements: [6, 34, 62] },
  { version: 14, modules: 4651, alignements: [6, 26, 46, 66] },
  { version: 15, modules: 5243, alignements: [6, 26, 48, 70] },
  { version: 16, modules: 5867, alignements: [6, 26, 50, 74] },
  { version: 17, modules: 6523, alignements: [6, 30, 54, 78] },
  { version: 18, modules: 7211, alignements: [6, 30, 56, 82] },
  { version: 19, modules: 7931, alignements: [6, 30, 58, 86] },
  { version: 20, modules: 8683, alignements: [6, 34, 62, 90] },
];

console.log("Tables et géométrie du QR");
for (const ligne of ATTENDU) {
  egal(`v${ligne.version} codewords de données`, codewordsDonnees(ligne.version), ligne.donnees);
  egal(
    `v${ligne.version} codewords de correction`,
    codewordsCorrection(ligne.version),
    ligne.correction,
  );
  egal(`v${ligne.version} bits restants`, bitsRestants(ligne.version), ligne.bitsRestants);
  vérifier(
    `v${ligne.version} positions d'alignement`,
    positionsAlignement(ligne.version).join(",") === ligne.alignements.join(","),
  );
}

for (const ligne of GEOMETRIE) {
  egal(
    `v${ligne.version} modules disponibles`,
    modulesDisponibles(ligne.version),
    ligne.modules,
  );
  vérifier(
    `v${ligne.version} positions d'alignement`,
    positionsAlignement(ligne.version).join(",") === ligne.alignements.join(","),
  );
}

/** Capabilités publiées par l'ANSI, mode octet, niveau M. */
const CAPACITES: readonly number[] = [14, 26, 42, 62, 84, 106, 122, 152, 180, 213, 251, 287];
for (let index = 0; index < CAPACITES.length; index += 1) {
  egal(`v${index + 1} capacité`, capacite(index + 1), CAPACITES[index]!);
}

// ---------------------------------------------------------------------------
// 3 — comparaison à l'implémentation de référence
// ---------------------------------------------------------------------------

const CACHE = join(ici, ".cache", "node_modules", "qrcode-generator", "qrcode.js");

interface FabriqueReference {
  (version: number, niveau: "M"): Reference;
  stringToBytes(texte: string): number[];
}

function obtenirLaReference(): FabriqueReference[] {
  if (!existsSync(CACHE)) {
    throw new Error(`Référence absente : ${CACHE}. Installer explicitement qrcode-generator@1.4.4 dans scripts/.cache avant de relancer.`);
  }
  const paquet = JSON.parse(readFileSync(join(dirname(CACHE), "package.json"), "utf8")) as { version?: unknown };
  if (paquet.version !== "1.4.4") throw new Error("Référence attendue : qrcode-generator@1.4.4.");
  const source = readFileSync(CACHE, "utf8");
  const appel = "makeImpl(false, getBestMaskPattern() );";
  if (source.split(appel).length !== 2) throw new Error("Appel de sélection du masque absent ou non unique dans la référence.");
  return Array.from({ length: 8 }, (_, masque) => {
    const module: { exports: unknown } = { exports: {} };
    const script = new Script(source.replace(appel, `makeImpl(false, ${masque});`), { filename: CACHE });
    script.runInNewContext({ module, exports: module.exports }, { timeout: 2000 });
    if (typeof module.exports !== "function") throw new Error("Fabrique QR de référence absente.");
    const reference = module.exports as FabriqueReference;
    reference.stringToBytes = (texte) => Array.from(new TextEncoder().encode(texte));
    return reference;
  });
}

interface Reference {
  addData(texte: string, mode: "Byte"): void;
  make(): void;
  getModuleCount(): number;
  isDark(ligne: number, colonne: number): boolean;
}

const FORMATS_M = [0x5412, 0x5125, 0x5e7c, 0x5b4b, 0x45f9, 0x40ce, 0x4f97, 0x4aa0];
const VERSIONS_BCH = [0x07c94, 0x085bc, 0x09a99, 0x0a4d3, 0x0bbf6, 0x0c762];

function verifierBCH({ modules, taille, masque, version }: MatriceQR): void {
  const mot = (bits: boolean[]): number => bits.reduce((valeur, noir) => (valeur << 1) | Number(noir), 0);
  const copies = [
    [0, 1, 2, 3, 4, 5, 7, 8].map((colonne) => modules[8]![colonne]!)
      .concat([7, 5, 4, 3, 2, 1, 0].map((ligne) => modules[ligne]![8]!)),
    Array.from({ length: 7 }, (_, i) => modules[taille - 1 - i]![8]!)
      .concat(Array.from({ length: 8 }, (_, i) => modules[8]![taille - 8 + i]!)),
  ];
  for (const [index, bits] of copies.entries()) {
    const format = mot(bits);
    egal(`v${version} format M copie ${index + 1}, masque ${masque}`, format, FORMATS_M[masque]);
    egal(`masque décodé copie ${index + 1}`, ((format ^ 0x5412) >>> 10) & 7, masque);
  }
  if (version >= 7) {
    const haut: boolean[] = [];
    const bas: boolean[] = [];
    for (let ligne = 5; ligne >= 0; ligne -= 1) {
      for (let colonne = taille - 9; colonne >= taille - 11; colonne -= 1) {
        haut.push(modules[ligne]![colonne]!);
        bas.push(modules[colonne]![ligne]!);
      }
    }
    egal(`v${version} BCH copie haute`, mot(haut), VERSIONS_BCH[version - 7]);
    egal(`v${version} BCH copie basse`, mot(bas), VERSIONS_BCH[version - 7]);
  }
}

function scoreIndependant(modules: boolean[][]): { total: number; n3: number; n4: number } {
  const taille = modules.length;
  const lignes = modules.map((ligne) => ligne.map(Number).join(""));
  const colonnes = Array.from({ length: taille }, (_, colonne) => modules.map((ligne) => Number(ligne[colonne])).join(""));
  let total = 0;
  let n3 = 0;
  for (const ligne of [...lignes, ...colonnes]) {
    for (const suite of ligne.match(/0{5,}|1{5,}/g) ?? []) total += suite.length - 2;
    for (let debut = 0; debut <= taille - 11; debut += 1) {
      const motif = ligne.slice(debut, debut + 11);
      if (motif === "00001011101" || motif === "10111010000") n3 += 40;
    }
  }
  for (let ligne = 1; ligne < taille; ligne += 1) {
    for (let colonne = 1; colonne < taille; colonne += 1) {
      const carre = [modules[ligne - 1]![colonne - 1], modules[ligne - 1]![colonne], modules[ligne]![colonne - 1], modules[ligne]![colonne]];
      if (carre.every((noir) => noir === carre[0])) total += 3;
    }
  }
  const noirs = modules.reduce((somme, ligne) => somme + ligne.filter(Boolean).length, 0);
  const n4 = Math.floor(Math.abs(2 * noirs - taille * taille) * 10 / (taille * taille)) * 10;
  return { total: total + n3 + n4, n3, n4 };
}

const EXEMPLES: string[] = [
  "A",
  "1234567",
  "otpauth://totp/KoniG.dev:admin?secret=A",
  "otpauth://totp/KoniG.dev%20Admin:admin@konig.dev?secret=JBSWY3DPEHPK3PXP&issuer=KoniG.dev&algorithm=SHA1&digits=6&period=30",
  "https://example.com/",
  "x".repeat(14),
  "x".repeat(15),
  "x".repeat(26),
  "x".repeat(27),
  "x".repeat(42),
  "x".repeat(62),
  "x".repeat(84),
  "x".repeat(106),
  "x".repeat(122),
  "x".repeat(123),
  "x".repeat(152),
  "x".repeat(180),
  "x".repeat(181),
  "x".repeat(213),
  "x".repeat(251),
  "x".repeat(287),
  "Le Viceto — Neodomotique : deux noms, deux projets, un seul texte.",
  "a".repeat(200),
  "otpauth://totp/KoniG:esdras@konig.dev?secret=ABCDEFGHIJKLMNOPQRSTUVWXYZ234567&issuer=KoniG&period=30&digits=6",
];

/**
 * Le module de fonction, reconstruit ICI et non importé de qr.ts : la relecture
 * ne doit rien à l'encodeur. Annexe A + Figures 1 à 5 de la norme.
 */
function carteFonction(taille: number, version: number): boolean[][] {
  const reserve: boolean[][] = Array.from({ length: taille }, () =>
    Array.from({ length: taille }, () => false),
  );
  const marquer = (ligne: number, colonne: number): void => {
    if (ligne >= 0 && ligne < taille && colonne >= 0 && colonne < taille) {
      reserve[ligne]![colonne] = true;
    }
  };
  for (let i = 0; i < 9; i += 1) {
    for (let j = 0; j < 9; j += 1) marquer(i, j);
  }
  // Les deux autres coins : 8 modules de côté seulement (le séparateur), pas 9 —
  // la 9e rangée appartiendrait aux modules de données.
  for (let i = 0; i < 9; i += 1) {
    for (let j = 0; j < 8; j += 1) {
      marquer(i, taille - 1 - j);
      marquer(taille - 1 - j, i);
    }
  }
  for (let i = 0; i < taille; i += 1) {
    marquer(6, i);
    marquer(i, 6);
  }
  const positions = positionsAlignement(version);
  for (const ligne of positions) {
    for (const colonne of positions) {
      const dansUnDetecteur =
        (ligne === 6 && colonne === 6) ||
        (ligne === 6 && colonne === taille - 7) ||
        (ligne === taille - 7 && colonne === 6);
      if (dansUnDetecteur) continue;
      for (let r = -2; r <= 2; r += 1) {
        for (let c = -2; c <= 2; c += 1) marquer(ligne + r, colonne + c);
      }
    }
  }
  marquer(taille - 8, 8);
  if (version >= 7) {
    for (let i = 0; i < 18; i += 1) {
      marquer(Math.floor(i / 3), (i % 3) + taille - 11);
      marquer((i % 3) + taille - 11, Math.floor(i / 3));
    }
  }
  return reserve;
}

/** Les huit fonctions de masque de l'Annexe A, réécrites sans référence à qr.ts. */
function masqueApplique(masque: number, ligne: number, colonne: number): boolean {
  switch (masque) {
    case 0:
      return (ligne + colonne) % 2 === 0;
    case 1:
      return ligne % 2 === 0;
    case 2:
      return colonne % 3 === 0;
    case 3:
      return (ligne + colonne) % 3 === 0;
    case 4:
      return (Math.floor(ligne / 2) + Math.floor(colonne / 3)) % 2 === 0;
    case 5:
      return ((ligne * colonne) % 2) + ((ligne * colonne) % 3) === 0;
    case 6:
      return (((ligne * colonne) % 2) + ((ligne * colonne) % 3)) % 2 === 0;
    default:
      return (((ligne + colonne) % 2) + ((ligne * colonne) % 3)) % 2 === 0;
  }
}

/**
 * Relecture complète : zigzag, dé-masquage, dé-interleavage des blocs, puis
 * en-tête du mode octet. C'est la seule preuve que le secret encodé est
 * réellement récupérable par un lecteur.
 */
function relire({ modules, taille, masque, version }: MatriceQR): string | null {
  const reserve = carteFonction(taille, version);
  const bits: number[] = [];
  for (let droite = taille - 1; droite >= 1; droite -= 2) {
    if (droite === 6) droite = 5;
    const montant = ((droite + 1) & 2) === 0;
    for (let pas = 0; pas < taille; pas += 1) {
      const ligne = montant ? taille - 1 - pas : pas;
      for (const colonne of [droite, droite - 1]) {
        if (reserve[ligne]![colonne]) continue;
        bits.push(Number(modules[ligne]![colonne]! !== masqueApplique(masque, ligne, colonne)));
      }
    }
  }
  const octets: number[] = [];
  for (let index = 0; index + 8 <= bits.length; index += 8) {
    octets.push(bits.slice(index, index + 8).reduce((valeur, bit) => (valeur << 1) | bit, 0));
  }

  const blocs = detailBlocs(version);
  const attendus = codewordsDonnees(version) + codewordsCorrection(version);
  if (octets.length !== attendus) return null;

  const longueurs = blocs.donnees;
  const totalDonnees = longueurs.reduce((somme, n) => somme + n, 0);
  if (totalDonnees !== codewordsDonnees(version)) return null;

  const flus: number[][] = longueurs.map((n) => new Array<number>(n).fill(0));
  let index = 0;
  for (let rang = 0; rang < Math.max(...longueurs); rang += 1) {
    for (let bloc = 0; bloc < longueurs.length; bloc += 1) {
      // Les blocs courts n'ont pas d'emplacement vide : on n'avance que quand
      // un codeword existe réellement.
      if (rang < longueurs[bloc]!) flus[bloc]![rang] = octets[index++]!;
    }
  }
  if (index !== totalDonnees) return null;
  const donnees = flus.flat();

  const suite = donnees.reduce<string>((accum, octet) => accum + octet.toString(2).padStart(8, "0"), "");
  if (suite.slice(0, 4) !== "0100") return null;
  const sauts = version >= 10 ? 16 : 8;
  const longueur = Number.parseInt(suite.slice(4, 4 + sauts), 2);
  const octetDeTexte = new Uint8Array(longueur);
  for (let i = 0; i < longueur; i += 1) {
    const depart = 4 + sauts + i * 8;
    octetDeTexte[i] = Number.parseInt(suite.slice(depart, depart + 8), 2);
  }
  return new TextDecoder().decode(octetDeTexte);
}

const FABRIQUES = obtenirLaReference();

console.log("\nMatrices comparées à qrcode-generator 1.4.4, bits de contrôle et relecture");
for (const texte of EXEMPLES) {
  let issu: MatriceQR | null = null;
  try {
    issu = encoderQR(texte);
  } catch (erreur) {
    vérifier(`encodage de ${texte.length} octets`, false);
    console.log(`       ${erreur instanceof Error ? erreur.message : "erreur inconnue"}`);
    continue;
  }

  const libelle = `${texte.length} octets (version ${issu.version}, masque ${issu.masque})`;

  // Comparaison pixel à pixel, masque imposé à la référence.
  const modele = FABRIQUES[issu.masque]!(0, "M");
  modele.addData(texte);
  modele.make();

  const memeTaille = modele.getModuleCount() === issu.taille;
  vérifier(`même taille pour ${libelle}`, memeTaille);
  if (!memeTaille) continue;

  let identiques = true;
  for (let ligne = 0; ligne < issu.taille && identiques; ligne += 1) {
    for (let colonne = 0; colonne < issu.taille; colonne += 1) {
      if (modele.isDark(ligne, colonne) !== issu.modules[ligne]![colonne]) {
        identiques = false;
        break;
      }
    }
  }
  vérifier(`matrice identique à la référence pour ${libelle}`, identiques);

  verifierBCH(issu);

  // Le choix du masque est vérifié par une pénalité indépendante de celle de
  // qr.ts : la norme impose le minimum, premier index en cas d'égalité.
  const scores = FABRIQUES.map((fabrique) => {
    const candidat = fabrique(0, "M");
    candidat.addData(texte);
    candidat.make();
    const carte: boolean[][] = [];
    for (let ligne = 0; ligne < candidat.getModuleCount(); ligne += 1) {
      carte.push(Array.from({ length: candidat.getModuleCount() }, (_, colonne) => candidat.isDark(ligne, colonne)));
    }
    return scoreIndependant(carte).total;
  });
  const meilleur = scores.reduce((index, score, courant) => (score < scores[index]! ? courant : index), 0);
  vérifier(
    `masque choisi par la pénalité indépendante pour ${libelle} [${scores.join(",")}]`,
    meilleur === issu.masque,
  );

  vérifier(`relecture du texte encodé pour ${libelle}`, relire(issu) === texte);
}

// ---------------------------------------------------------------------------
// Bornes et refus
// ---------------------------------------------------------------------------

console.log("\nBornes et refus");

vérifier(
  "288 octets refusés plutôt que tronqués",
  (() => {
    try {
      encoderQR("x".repeat(288));
      return false;
    } catch {
      return true;
    }
  })(),
);

vérifier(
  "caractère de contrôle refusé",
  (() => {
    try {
      encoderQR("a\u0000b");
      return false;
    } catch {
      return true;
    }
  })(),
);

vérifier(
  "texte vide refusé",
  (() => {
    try {
      encoderQR("");
      return false;
    } catch {
      return true;
    }
  })(),
);

{
  const matrice = encoderQR("otpauth://totp/KoniG.dev:admin@konig.dev?secret=JBSWY3DPEHPK3PXP");
  egal("version choisie pour 68 octets", matrice.version, 5);
  egal("taille de la matrice", matrice.taille, 37);
  vérifier(
    "les trois détecteurs sont en place",
    matrice.modules[0]![0] === true &&
      matrice.modules[0]![6] === true &&
      matrice.modules[0]![7] === false &&
      matrice.modules[37 - 8]![0] === false &&
      matrice.modules[0]![37 - 8] === false,
  );
  vérifier(
    "minuteur alterné",
    matrice.modules[6]![8] === true &&
      matrice.modules[6]![9] === false &&
      matrice.modules[6]![10] === true,
  );
  vérifier(
    "module permanent noir",
    matrice.modules[matrice.taille - 8]![8] === true,
  );
}

console.log(`\n${reussis} vérification(s) réussie(s), ${echecs} échec(s).`);
process.exit(echecs > 0 ? 1 : 0);
