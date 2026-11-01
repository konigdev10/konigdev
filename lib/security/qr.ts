/**
 * Encodeur de QR Code écrit à la main — mode octet, niveau de correction M,
 * versions 1 à 12 (287 octets de texte au maximum).
 *
 * Pourquoi l'écrire : le cahier des charges n'autorise aucune librairie ajoutée
 * hors zod et sharp, et un code qui met en forme un secret d'authentification
 * doit pouvoir être relu en une seule passe.
 *
 * Aucune donnée sensible ne transite ici : l'URI otpauth:// contient le secret
 * que la page affiche déjà en clair pour l'injection manuelle. Ce module ne lit
 * pas l'environnement et n'appelle personne — il transforme une chaîne en
 * matrice de modules, et tourne donc indifféremment côté serveur ou navigateur.
 *
 * Références : ISO/IEC 18004 — Tableau 1 (alignements), Tableau 8 (bits
 * restants), Tableaux 13 à 16 (blocs), 5.5.4 (format), Annexe A (masques).
 */

/** Niveau M : indicateur 00 dans les 5 bits utiles du format. */
const NIVEAU_M = 0b00;
const VERSION_MAX = 12;
/** Masque de XOR appliqué aux 15 bits du format. */
const MASQUE_FORMAT = 0x5412;
/** BCH du format, degré 10 : x^10+x^8+x^5+x^4+x^2+x+1. */
const GENERATEUR_FORMAT = 0b10100110111;
/** BCH de la version, degré 12 : x^12+x^11+x^10+x^9+x^5+x^2+1. */
const GENERATEUR_VERSION = 0b1111100100101;
/** Bourrage alterné des codewords de données. */
const OCTET_REMPLISSAGE = 0xec;
const OCTET_REMPLISSAGE_ALTERNE = 0x11;

interface GroupeDeBlocs {
  nombre: number;
  /** Codewords de DONNÉES par bloc de ce groupe. */
  data: number;
}

/**
 * Table des blocs au niveau M, versions 1 à 12 : [codewords de correction par
 * bloc, groupes]. Un second groupe n'existe que quand les blocs ne tombent pas
 * juste : ses blocs portent un codeword de données de plus.
 */
const BLOCS_M: ReadonlyArray<readonly [number, readonly GroupeDeBlocs[]]> = [
  [10, [{ nombre: 1, data: 16 }]],
  [16, [{ nombre: 1, data: 28 }]],
  [26, [{ nombre: 1, data: 44 }]],
  [18, [{ nombre: 2, data: 32 }]],
  [24, [{ nombre: 2, data: 43 }]],
  [16, [{ nombre: 4, data: 27 }]],
  [18, [{ nombre: 4, data: 31 }]],
  [22, [{ nombre: 2, data: 38 }, { nombre: 2, data: 39 }]],
  [22, [{ nombre: 3, data: 36 }, { nombre: 2, data: 37 }]],
  [26, [{ nombre: 4, data: 43 }, { nombre: 1, data: 44 }]],
  [30, [{ nombre: 1, data: 50 }, { nombre: 4, data: 51 }]],
  [22, [{ nombre: 6, data: 36 }, { nombre: 2, data: 37 }]],
];

function entree(version: number): readonly [number, readonly GroupeDeBlocs[]] {
  const ligne = BLOCS_M[version - 1];
  if (!ligne) throw new ErreurQR(`Version QR hors service : ${version}`);
  return ligne;
}

export function codewordsDonnees(version: number): number {
  return entree(version)[1].reduce((total, groupe) => total + groupe.nombre * groupe.data, 0);
}

export function codewordsCorrection(version: number): number {
  const [parBloc, groupes] = entree(version);
  return parBloc * groupes.reduce((total, groupe) => total + groupe.nombre, 0);
}

/**
 * Taille de chaque bloc de données, dans l'ordre de la table, plus les
 * codewords de correction par bloc. De quoi dé-entrelacer une matrice depuis
 * l'extérieur — seul scripts/verif-qr.mts s'en sert.
 */
export function detailBlocs(version: number): { correction: number; donnees: number[] } {
  const [correction, groupes] = entree(version);
  const donnees: number[] = [];
  for (const groupe of groupes) {
    for (let index = 0; index < groupe.nombre; index += 1) donnees.push(groupe.data);
  }
  return { correction, donnees };
}

/**
 * Positions des motifs d'alignement : la première à 6, la dernière à
 * taille - 7, un pas régulier arrondi à l'entier pair supérieur. L'algorithme
 * reproduit le Tableau 1 de la norme ; la comparaison avec zxing est exécutée
 * par scripts/verif-qr.mts.
 */
export function positionsAlignement(version: number): number[] {
  if (version === 1) return [];
  const taille = 4 * version + 17;
  const nombre = Math.floor(version / 7) + 2;
  const pas = version === 32 ? 26 : Math.ceil((taille - 13) / (nombre * 2 - 2)) * 2;
  const positions: number[] = [];
  for (let index = 0; index < nombre; index += 1) {
    positions.push(index === 0 ? 6 : taille - 7 - pas * (nombre - 1 - index));
  }
  return positions;
}

/**
 * Modules disponibles pour les données : le carré moins chaque zone réservée,
 * motif par motif. Ce calcul, indépendant de la table des blocs, sert de
 * contre-épreuve : modules - bitsRestants doit valoir 8 × (données + correction).
 *
 * Les trois motifs d'alignement qui retomberaient sur un détecteur n'existent
 * pas ; en revanche, ceux qui chevauchent les minuteurs (rangée 6 et colonne 6)
 * absorbent chacun 5 modules de minuteur, d'où la soustraction. La version 1,
 * sans alignement, est traitée à part.
 */
export function modulesDisponibles(version: number): number {
  const taille = 4 * version + 17;
  const alignements = positionsAlignement(version).length;
  const motifsAlign = alignements >= 2 ? alignements * alignements - 3 : 0;
  const minuteurs =
    2 * (taille - 16) - (alignements >= 2 ? 10 * (alignements - 2) : 0);
  const infoVersion = version >= 7 ? 36 : 0;
  return taille * taille - 192 - minuteurs - 25 * motifsAlign - 31 - infoVersion;
}

/** Bits laissés à zéro après le dernier codeword (Tableau 8 de la norme). */
export function bitsRestants(version: number): number {
  return (
    modulesDisponibles(version) -
    8 * (codewordsDonnees(version) + codewordsCorrection(version))
  );
}

/** Octets de texte acceptés par une version, mode octet, niveau M. */
export function capacite(version: number): number {
  const indicateurDeCompte = version <= 9 ? 8 : 16;
  return Math.floor((8 * codewordsDonnees(version) - 4 - indicateurDeCompte) / 8);
}

export class ErreurQR extends Error {}

// ---------------------------------------------------------------------------
// GF(2^8), polynôme premier x^8 + x^4 + x^3 + x^2 + 1 (0x11d)
// ---------------------------------------------------------------------------

const LOGS = new Uint8Array(256);
const EXPONENTIELS = new Uint8Array(512);

{
  let x = 1;
  for (let puissance = 0; puissance < 255; puissance += 1) {
    EXPONENTIELS[puissance] = x;
    LOGS[x] = puissance;
    x <<= 1;
    if ((x & 0x100) !== 0) x ^= 0x11d;
  }
  for (let puissance = 255; puissance < 512; puissance += 1) {
    EXPONENTIELS[puissance] = EXPONENTIELS[puissance - 255] as number;
  }
}

function produit(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return EXPONENTIELS[(LOGS[a] as number) + (LOGS[b] as number)] as number;
}

const GENERATEURS_RS = new Map<number, Uint8Array>();

/** Polynôme générateur de Reed-Solomon de degré `degre`, coefficients décroissants. */
function generateurRS(degre: number): Uint8Array {
  const connu = GENERATEURS_RS.get(degre);
  if (connu) return connu;
  let coefficients = new Uint8Array([1]);
  for (let puissance = 0; puissance < degre; puissance += 1) {
    const suivant = new Uint8Array(coefficients.length + 1);
    const racine = EXPONENTIELS[puissance] as number;
    for (let index = 0; index < coefficients.length; index += 1) {
      const coefficient = coefficients[index] as number;
      suivant[index] = (suivant[index] as number) ^ coefficient;
      suivant[index + 1] = (suivant[index + 1] as number) ^ produit(coefficient, racine);
    }
    coefficients = suivant;
  }
  GENERATEURS_RS.set(degre, coefficients);
  return coefficients;
}

/** Codewords de correction d'un bloc : reste de la division par le générateur. */
export function codewordsRS(bloc: Uint8Array, degre: number): Uint8Array {
  const generateur = generateurRS(degre);
  const reste = new Uint8Array(degre);
  for (let indexBloc = 0; indexBloc < bloc.length; indexBloc += 1) {
    const facteur = (bloc[indexBloc] as number) ^ (reste[0] as number);
    reste.copyWithin(0, 1);
    reste[degre - 1] = 0;
    for (let index = 0; index < degre; index += 1) {
      reste[index] =
        (reste[index] as number) ^ produit(generateur[index + 1] as number, facteur);
    }
  }
  return reste;
}

/** Vrai si tous les syndromes du bloc (données + correction) sont nuls. */
export function blocValide(bloc: Uint8Array, degre: number): boolean {
  for (let puissance = 0; puissance < degre; puissance += 1) {
    const racine = EXPONENTIELS[puissance] as number;
    let somme = 0;
    let courant = 1;
    for (let index = bloc.length - 1; index >= 0; index -= 1) {
      somme ^= produit(courant, bloc[index] as number);
      courant = produit(courant, racine);
    }
    if (somme !== 0) return false;
  }
  return true;
}

// ---------------------------------------------------------------------------
// Bits de contrôle BCH
// ---------------------------------------------------------------------------

/**
 * Reste de la division polynomiale de `valeur` par `generateurBch`, sur `degre`
 * bits. À chaque tour, le bit sortant déclenche un XOR avec le générateur : le
 * générateur porte le bit de poids fort du rang, ce qui aligne la réduction.
 */
function resteBCH(valeur: number, degre: number, generateurBch: number): number {
  let reste = valeur;
  for (let index = 0; index < degre; index += 1) {
    const sortant = (reste >>> (degre - 1)) & 1;
    reste = (reste << 1) ^ (sortant === 1 ? generateurBch : 0);
  }
  return reste & ((1 << degre) - 1);
}

function bitsDeFormat(niveau: number, masque: number): number {
  const utile = (niveau << 3) | masque;
  const controle = resteBCH(utile, 10, GENERATEUR_FORMAT);
  return (((utile << 10) | controle) ^ MASQUE_FORMAT) >>> 0;
}

function bitsDeVersion(version: number): number {
  const controle = resteBCH(version, 12, GENERATEUR_VERSION);
  return ((version << 12) | controle) >>> 0;
}

// ---------------------------------------------------------------------------
// Gabarit : les motifs, puis les données
// ---------------------------------------------------------------------------

export interface MatriceQR {
  version: number;
  taille: number;
  masque: number;
  /** modules[ligne][colonne] : vrai = module noir. */
  modules: boolean[][];
}

interface Gabarit {
  taille: number;
  /** Vrai là où un motif occupe le module : les données n'y passent pas. */
  reserve: boolean[][];
  noire: boolean[][];
}

function creerGabarit(taille: number): Gabarit {
  const grille = (): boolean[][] =>
    Array.from({ length: taille }, () => new Array<boolean>(taille).fill(false));
  return { taille, reserve: grille(), noire: grille() };
}

function poser(gabarit: Gabarit, ligne: number, colonne: number, noir: boolean): void {
  gabarit.reserve[ligne]![colonne] = true;
  gabarit.noire[ligne]![colonne] = noir;
}

function poserDetecteurs(gabarit: Gabarit): void {
  const { taille } = gabarit;
  const coins: ReadonlyArray<readonly [number, number]> = [
    [0, 0],
    [0, taille - 7],
    [taille - 7, 0],
  ];
  for (const [ligneCoin, colonneCoin] of coins) {
    for (let dl = -1; dl <= 7; dl += 1) {
      for (let dc = -1; dc <= 7; dc += 1) {
        const ligne = ligneCoin + dl;
        const colonne = colonneCoin + dc;
        if (ligne < 0 || ligne >= taille || colonne < 0 || colonne >= taille) continue;
        const dansLeDetecteur = dl >= 0 && dl <= 6 && dc >= 0 && dc <= 6;
        const noir =
          dansLeDetecteur &&
          (dl === 0 ||
            dl === 6 ||
            dc === 0 ||
            dc === 6 ||
            (dl >= 2 && dl <= 4 && dc >= 2 && dc <= 4));
        poser(gabarit, ligne, colonne, noir);
      }
    }
  }
}

/** Ligne et colonne 6 alternent noir et clair, en s'arrêtant aux détecteurs. */
function poserMinuteurs(gabarit: Gabarit): void {
  const { taille } = gabarit;
  for (let index = 8; index <= taille - 9; index += 1) {
    const noir = index % 2 === 0;
    if (!gabarit.reserve[6]![index]) poser(gabarit, 6, index, noir);
    if (!gabarit.reserve[index]![6]) poser(gabarit, index, 6, noir);
  }
}

function poserAlignements(gabarit: Gabarit, version: number): void {
  const positions = positionsAlignement(version);
  const { taille } = gabarit;
  for (const ligneCentre of positions) {
    for (const colonneCentre of positions) {
      // Les trois coins qui retomberaient sur un détecteur n'existent pas.
      const chevaucheUnDetecteur =
        (ligneCentre <= 7 && colonneCentre <= 7) ||
        (ligneCentre <= 7 && colonneCentre >= taille - 8) ||
        (ligneCentre >= taille - 8 && colonneCentre <= 7);
      if (chevaucheUnDetecteur) continue;
      for (let dl = -2; dl <= 2; dl += 1) {
        for (let dc = -2; dc <= 2; dc += 1) {
          poser(
            gabarit,
            ligneCentre + dl,
            colonneCentre + dc,
            Math.max(Math.abs(dl), Math.abs(dc)) !== 1,
          );
        }
      }
    }
  }
}

/**
 * Les 31 modules du format : deux copies de 15 bits, plus le module permanent
 * toujours noir. Les deux sauts obligés (rangée 6 et colonne 6, prises par les
 * minuteurs) sont rendus par les formules ci-dessous.
 */
function poserFormat(gabarit: Gabarit, masque: number): void {
  const bits = bitsDeFormat(NIVEAU_M, masque);
  const { taille } = gabarit;
  for (let index = 0; index < 15; index += 1) {
    const noir = ((bits >>> index) & 1) === 1;
    const ligne1 = index <= 5 ? index : index <= 7 ? index + 1 : 8;
    const colonne1 = index <= 7 ? 8 : index === 8 ? 7 : 14 - index;
    poser(gabarit, ligne1, colonne1, noir);
    const ligne2 = index <= 7 ? 8 : taille - 15 + index;
    const colonne2 = index <= 7 ? taille - 1 - index : 8;
    poser(gabarit, ligne2, colonne2, noir);
  }
  poser(gabarit, taille - 8, 8, true);
}

function poserVersion(gabarit: Gabarit, version: number): void {
  if (version < 7) return;
  const bits = bitsDeVersion(version);
  const { taille } = gabarit;
  for (let index = 0; index < 18; index += 1) {
    const noir = ((bits >>> index) & 1) === 1;
    const ligne = Math.floor(index / 3);
    const colonne = taille - 11 + (index % 3);
    poser(gabarit, ligne, colonne, noir);
    poser(gabarit, colonne, ligne, noir);
  }
}

const FONCTIONS_MASQUE: ReadonlyArray<(ligne: number, colonne: number) => boolean> = [
  (ligne, colonne) => (ligne + colonne) % 2 === 0,
  (ligne) => ligne % 2 === 0,
  (_ligne, colonne) => colonne % 3 === 0,
  (ligne, colonne) => (ligne + colonne) % 3 === 0,
  (ligne, colonne) => (Math.floor(ligne / 2) + Math.floor(colonne / 3)) % 2 === 0,
  (ligne, colonne) => ((ligne * colonne) % 2) + ((ligne * colonne) % 3) === 0,
  (ligne, colonne) => (((ligne * colonne) % 2) + ((ligne * colonne) % 3)) % 2 === 0,
  (ligne, colonne) => (((ligne + colonne) % 2) + ((ligne * colonne) % 3)) % 2 === 0,
];

// ---------------------------------------------------------------------------
// Tampon de bits
// ---------------------------------------------------------------------------

class TamponBits {
  private readonly bits: number[] = [];

  ecrire(valeur: number, nombreDeBits: number): void {
    for (let index = nombreDeBits - 1; index >= 0; index -= 1) {
      this.bits.push((valeur >>> index) & 1);
    }
  }

  get longueur(): number {
    return this.bits.length;
  }

  /** Terminateur, alignement sur un octet, puis bourrage 0xEC / 0x11. */
  octets(capaciteEnOctets: number): Uint8Array {
    const bits = this.bits.slice();
    const capaciteEnBits = capaciteEnOctets * 8;
    const terminateur = Math.min(4, capaciteEnBits - bits.length);
    for (let index = 0; index < terminateur; index += 1) bits.push(0);
    while (bits.length % 8 !== 0) bits.push(0);

    const sortie = new Uint8Array(capaciteEnOctets);
    for (let index = 0; index < bits.length; index += 1) {
      if (bits[index] === 1) {
        sortie[Math.floor(index / 8)]! |= 0x80 >>> index % 8;
      }
    }
    const premierOctetLibre = bits.length / 8;
    for (let index = premierOctetLibre; index < capaciteEnOctets; index += 1) {
      sortie[index] =
        (index - premierOctetLibre) % 2 === 0 ? OCTET_REMPLISSAGE : OCTET_REMPLISSAGE_ALTERNE;
    }
    return sortie;
  }
}

// ---------------------------------------------------------------------------
// Pénalité d'un masque (Annexe A)
// ---------------------------------------------------------------------------

const MOTIF_DETECTEUR = [true, false, true, true, true, false, true];

function penalite(
  taille: number,
  lisible: (ligne: number, colonne: number) => boolean,
): number {
  let total = 0;
  let nombresNoirs = 0;

  const suite = (longueur: number): number => (longueur >= 5 ? 3 + (longueur - 5) : 0);

  for (let index = 0; index < taille; index += 1) {
    let enLigne = 1;
    let enColonne = 1;
    for (let autre = 0; autre < taille; autre += 1) {
      if (lisible(index, autre)) nombresNoirs += 1;
      if (autre === 0) continue;
      if (lisible(index, autre) === lisible(index, autre - 1)) enLigne += 1;
      else {
        total += suite(enLigne);
        enLigne = 1;
      }
      if (lisible(autre, index) === lisible(autre - 1, index)) enColonne += 1;
      else {
        total += suite(enColonne);
        enColonne = 1;
      }
    }
    total += suite(enLigne);
    total += suite(enColonne);
  }

  for (let ligne = 0; ligne < taille - 1; ligne += 1) {
    for (let colonne = 0; colonne < taille - 1; colonne += 1) {
      const noir = lisible(ligne, colonne);
      if (
        lisible(ligne, colonne + 1) === noir &&
        lisible(ligne + 1, colonne) === noir &&
        lisible(ligne + 1, colonne + 1) === noir
      ) {
        total += 3;
      }
    }
  }

  const quatreClairs = (
    lecture: (position: number) => boolean,
    debut: number,
  ): boolean => {
    if (debut < 0 || debut + 4 > taille) return false;
    for (let index = 0; index < 4; index += 1) {
      if (lecture(debut + index)) return false;
    }
    return true;
  };

  for (let index = 0; index < taille; index += 1) {
    for (let depart = 0; depart + 7 <= taille; depart += 1) {
      const enLigne = MOTIF_DETECTEUR.every(
        (noir, decalage) => lisible(index, depart + decalage) === noir,
      );
      if (enLigne) {
        total += 40 * (
          Number(quatreClairs((position) => lisible(index, position), depart - 4)) +
          Number(quatreClairs((position) => lisible(index, position), depart + 7))
        );
      }
      const enColonne = MOTIF_DETECTEUR.every(
        (noir, decalage) => lisible(depart + decalage, index) === noir,
      );
      if (enColonne) {
        total += 40 * (
          Number(quatreClairs((position) => lisible(position, index), depart - 4)) +
          Number(quatreClairs((position) => lisible(position, index), depart + 7))
        );
      }
    }
  }

  const totalModules = taille * taille;
  const paliers = Math.floor(
    Math.abs(nombresNoirs * 100 - totalModules * 50) / (totalModules * 5),
  );
  return total + paliers * 10;
}

// ---------------------------------------------------------------------------
// Encodage
// ---------------------------------------------------------------------------

/**
 * Matrice du QR de `texte`. La plus petite version qui tient est choisie. Au
 * delà de 287 octets, ou devant un caractère de contrôle ASCII, un ErreurQR est
 * levé : la page affiche alors le secret en texte, jamais un QR tronqué.
 */
export function encoderQR(texte: string): MatriceQR {
  if (texte.length === 0) throw new ErreurQR("Texte vide : rien à encoder.");
  for (const caractere of texte) {
    const code = caractere.codePointAt(0) as number;
    if (code < 32 || code === 127) {
      throw new ErreurQR("Caractère de contrôle refusé dans le texte du QR.");
    }
  }

  const octetsTexte = new TextEncoder().encode(texte);
  let version = 0;
  for (let candidate = 1; candidate <= VERSION_MAX; candidate += 1) {
    if (capacite(candidate) >= octetsTexte.length) {
      version = candidate;
      break;
    }
  }
  if (version === 0) {
    throw new ErreurQR(
      `Texte trop long pour un QR niveau M : ${octetsTexte.length} octets, maximum ${capacite(VERSION_MAX)}.`,
    );
  }

  const chaine = new TamponBits();
  chaine.ecrire(0b0100, 4); // mode octet
  chaine.ecrire(octetsTexte.length, version <= 9 ? 8 : 16);
  for (let indexOctet = 0; indexOctet < octetsTexte.length; indexOctet += 1) {
    chaine.ecrire(octetsTexte[indexOctet] as number, 8);
  }

  const donneesAttendues = codewordsDonnees(version);
  if (chaine.longueur > donneesAttendues * 8) {
    throw new ErreurQR("Capacité dépassée pendant l'écriture du texte.");
  }
  const fluxDonnees = chaine.octets(donneesAttendues);

  const [correctionParBloc, groupes] = entree(version);
  const blocsDonnees: Uint8Array[] = [];
  const blocsCorrection: Uint8Array[] = [];
  let positionCourante = 0;
  for (const groupe of groupes) {
    for (let index = 0; index < groupe.nombre; index += 1) {
      const bloc = fluxDonnees.subarray(positionCourante, positionCourante + groupe.data);
      positionCourante += groupe.data;
      blocsDonnees.push(bloc);
      blocsCorrection.push(codewordsRS(bloc, correctionParBloc));
    }
  }

  const totalCodewords = donneesAttendues + blocsCorrection.length * correctionParBloc;
  const fluxFinal = new Uint8Array(totalCodewords);
  let indexFlux = 0;
  const plusLongBloc = Math.max(...blocsDonnees.map((bloc) => bloc.length));
  for (let colonne = 0; colonne < plusLongBloc; colonne += 1) {
    for (const bloc of blocsDonnees) {
      if (colonne < bloc.length) fluxFinal[indexFlux++] = bloc[colonne] as number;
    }
  }
  for (let colonne = 0; colonne < correctionParBloc; colonne += 1) {
    for (const bloc of blocsCorrection) {
      fluxFinal[indexFlux++] = bloc[colonne] as number;
    }
  }

  const taille = 4 * version + 17;
  const gabarit = creerGabarit(taille);
  poserDetecteurs(gabarit);
  poserMinuteurs(gabarit);
  poserAlignements(gabarit, version);
  // Réservés maintenant, écrits à la fin : le format dépend du masque choisi.
  poserFormat(gabarit, 0);
  poserVersion(gabarit, version);

  const estDonnee = (ligne: number, colonne: number): boolean =>
    !gabarit.reserve[ligne]![colonne];

  const parcours: Array<[number, number]> = [];
  for (let droite = taille - 1; droite >= 1; droite -= 2) {
    // La colonne 6 est le minuteur vertical : la paire de colonnes se décale.
    if (droite === 6) droite = 5;
    const versLeHaut = ((droite + 1) & 2) === 0;
    for (let etape = 0; etape < taille; etape += 1) {
      const ligne = versLeHaut ? taille - 1 - etape : etape;
      for (let decalage = 0; decalage < 2; decalage += 1) {
        const colonneModule = droite - decalage;
        if (colonneModule >= 0 && estDonnee(ligne, colonneModule)) {
          parcours.push([ligne, colonneModule]);
        }
      }
    }
  }

  const bitsDeLaZone = parcours.length;
  const bitsAttendus = totalCodewords * 8 + bitsRestants(version);
  if (bitsDeLaZone !== bitsAttendus) {
    throw new ErreurQR(
      `Géométrie incohérente en version ${version} : ${bitsDeLaZone} modules de données pour ${bitsAttendus} attendus.`,
    );
  }

  const sansMasque = gabarit.noire.map((ligne) => ligne.slice());
  for (let index = 0; index < bitsDeLaZone; index += 1) {
    const [ligne, colonne] = parcours[index] as [number, number];
    const noir =
      index < totalCodewords * 8 &&
      ((((fluxFinal[Math.floor(index / 8)] as number) >>> (7 - (index % 8))) & 1) === 1);
    sansMasque[ligne]![colonne] = noir;
  }

  const lisibleAvecMasque = (masque: number) => {
    const fonction = FONCTIONS_MASQUE[masque] as (
      ligne: number,
      colonne: number,
    ) => boolean;
    return (ligne: number, colonne: number): boolean => {
      const base = sansMasque[ligne]![colonne] as boolean;
      return estDonnee(ligne, colonne) ? base !== fonction(ligne, colonne) : base;
    };
  };

  let meilleurMasque = 0;
  let meilleurePenalite = Number.POSITIVE_INFINITY;
  for (let masque = 0; masque < 8; masque += 1) {
    poserFormat({ taille, reserve: gabarit.reserve, noire: sansMasque }, masque);
    const score = penalite(taille, lisibleAvecMasque(masque));
    if (score < meilleurePenalite) {
      meilleurePenalite = score;
      meilleurMasque = masque;
    }
  }

  const fonctionChoisie = FONCTIONS_MASQUE[meilleurMasque] as (
    ligne: number,
    colonne: number,
  ) => boolean;
  const finale = sansMasque.map((ligne) => ligne.slice());
  for (const [ligne, colonne] of parcours) {
    finale[ligne]![colonne] =
      (sansMasque[ligne]![colonne] as boolean) !== fonctionChoisie(ligne, colonne);
  }
  // Réécriture des 31 modules du format avec le masque retenu.
  const gabaritFinal: Gabarit = { taille, reserve: gabarit.reserve, noire: finale };
  poserFormat(gabaritFinal, meilleurMasque);

  return { version, taille, masque: meilleurMasque, modules: finale };
}

/**
 * Chemin SVG unique pour toute la matrice : un seul élément à dessiner, donc un
 * DOM minuscule et aucun tableau de div dans le bundle client. `marge` est la
 * zone silencieuse, en modules (4 exigés par la norme).
 */
export function cheminSVG(matrice: MatriceQR, module: number, marge: number): string {
  const pieces: string[] = [];
  for (let ligne = 0; ligne < matrice.taille; ligne += 1) {
    for (let colonne = 0; colonne < matrice.taille; colonne += 1) {
      if (!matrice.modules[ligne]![colonne]) continue;
      const x = (colonne + marge) * module;
      const y = (ligne + marge) * module;
      pieces.push(`M${x} ${y}h${module}v${module}h-${module}z`);
    }
  }
  return pieces.join("");
}

/** Côté du SVG, en unités, zone silencieuse comprise. */
export function tailleSVG(matrice: MatriceQR, module: number, marge: number): number {
  return (matrice.taille + 2 * marge) * module;
}
