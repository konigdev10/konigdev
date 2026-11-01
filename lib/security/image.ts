/**
 * Vérification d'une image avant toute écriture dans Storage.
 *
 * Le cahier des charges impose jpg, png et webp uniquement, et le type réel
 * vérifié par les premiers octets. Une extension ne prouve rien : un exécutable
 * renommé en .jpg reste un exécutable. Ce module lit donc la signature binaire,
 * et refuse tout ce qui n'est pas une des trois familles attendues — SVG (qui
 * peut porter un script), PDF, ZIP, GIF, BMP, HEIF/AVIF, PE (Windows).
 *
 * Module volontairement sans dépendance : ni sharp, ni « server-only », pour
 * que le harnais Node (npm run test:securite) teste exactement ce code-ci.
 */

/** 3 Mo, comme l'indique la section 7 du cahier des charges. */
export const TAILLE_MAX_OCTETS = 3 * 1024 * 1024;

/** Largeur maximale après ré-encodage : rien n'a besoin de plus grand sur le site. */
export const LARGEUR_CIBLE = 1600;

export type FormatImage = "jpeg" | "png" | "webp";

const EXTENSION_PAR_FORMAT: Record<FormatImage, string> = {
  jpeg: "jpg",
  png: "png",
  webp: "webp",
};

/** Extensions acceptées dans un formulaire. Le nom n'a aucune valeur de preuve,
 *  il ne sert qu'à refuser tout de suite un fichier dont l'extension n'est pas
 *  dans la liste, avant même de lire sa signature. */
const EXTENSIONS_AUTORISEES: readonly string[] = ["jpg", "jpeg", "png", "webp"];

function octetsIdentiques(
  contenu: Uint8Array,
  decalage: number,
  signature: readonly number[],
): boolean {
  if (contenu.length < decalage + signature.length) return false;
  return signature.every(
    (octete, index) => contenu[decalage + index] === octete,
  );
}

const SIGNATURE_PNG = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
const SIGNATURE_JPEG = [0xff, 0xd8, 0xff];
const SIGNATURE_RIFF = [0x52, 0x49, 0x46, 0x46];
const MARQUE_WEBP = [0x57, 0x45, 0x42, 0x50];
const MARQUE_FTYP = [0x66, 0x74, 0x79, 0x70];

/** Texte : SVG et XHTML commencent toujours par une balise ou une déclaration,
 *  éventuellement précédés d'un BOM UTF-8 ou d'espaces. */
function estDuMarquage(contenu: Uint8Array): boolean {
  let index = 0;
  if (contenu.length >= 3 && contenu[0] === 0xef && contenu[1] === 0xbb && contenu[2] === 0xbf) {
    index = 3;
  }
  while (index < contenu.length && (contenu[index] === 0x20 || contenu[index] === 0x0a || contenu[index] === 0x09 || contenu[index] === 0x0d)) {
    index += 1;
  }
  const queue = contenu.slice(index, index + 10);
  const texte = new TextDecoder("utf-8", { fatal: false }).decode(queue).toLowerCase();
  return texte.startsWith("<svg") || texte.startsWith("<?xml") || texte.startsWith("<!doctype") || texte.startsWith("<html");
}

/**
 * Famille réellement contenue dans les premiers octets, y compris pour les
 * formats refusés : cela permet d'écrire un motif précis plutôt qu'un message
 * vide qui n'aide pas l'administrateur à comprendre son erreur.
 */
export function familleReelle(contenu: Uint8Array): string {
  if (octetsIdentiques(contenu, 0, SIGNATURE_PNG)) return "png";
  if (octetsIdentiques(contenu, 0, SIGNATURE_JPEG)) return "jpeg";
  if (octetsIdentiques(contenu, 0, SIGNATURE_RIFF) && octetsIdentiques(contenu, 8, MARQUE_WEBP)) return "webp";
  if (octetsIdentiques(contenu, 8, MARQUE_FTYP)) return "heif";
  if (octetsIdentiques(contenu, 0, [0x47, 0x49, 0x46, 0x38])) return "gif";
  if (octetsIdentiques(contenu, 0, [0x42, 0x4d])) return "bmp";
  if (octetsIdentiques(contenu, 0, [0x25, 0x50, 0x44, 0x46])) return "pdf";
  if (octetsIdentiques(contenu, 0, [0x50, 0x4b, 0x03, 0x04])) return "archive";
  if (octetsIdentiques(contenu, 0, [0x4d, 0x5a])) return "executable";
  if (estDuMarquage(contenu)) return "marquage";
  return "inconnu";
}

/** Le format accepté déduit des octets, ou null si le fichier n'est pas une
 *  image des trois familles autorisées. */
export function detecterFormat(contenu: Uint8Array): FormatImage | null {
  const famille = familleReelle(contenu);
  if (famille === "jpeg") return "jpeg";
  if (famille === "png") return "png";
  if (famille === "webp") return "webp";
  return null;
}

export type VerdictImage =
  | { ok: true; format: FormatImage }
  | { ok: false; raison: string };

/**
 * Contrôle complet d'un fichier déposé : extension, taille, puis signature
 * binaire. La signature est l'autorité — une extension fausse ne fait que
 * devancer le refus.
 */
export function evaluerImage(nom: string, contenu: Uint8Array): VerdictImage {
  if (contenu.length === 0) {
    return { ok: false, raison: "Fichier vide." };
  }
  const extension = nom.toLowerCase().split(".").pop() ?? "";
  if (!EXTENSIONS_AUTORISEES.includes(extension)) {
    return {
      ok: false,
      raison: "Extension non acceptée : utilisez .jpg, .jpeg, .png ou .webp.",
    };
  }
  if (contenu.length > TAILLE_MAX_OCTETS) {
    return { ok: false, raison: "Image trop lourde : 3 Mo maximum." };
  }
  const format = detecterFormat(contenu);
  if (!format) {
    const famille = familleReelle(contenu);
    if (famille === "marquage") {
      return {
        ok: false,
        raison:
          "Fichier de marquage refusé (svg, html, xml) : seuls jpg, png et webp sont acceptés.",
      };
    }
    if (famille === "pdf" || famille === "archive" || famille === "executable") {
      return { ok: false, raison: "Ce fichier n'est pas une image." };
    }
    if (famille === "gif" || famille === "bmp" || famille === "heif") {
      return {
        ok: false,
        raison: `Format « ${famille} » non accepté : convertissez en jpg, png ou webp.`,
      };
    }
    return { ok: false, raison: "Fichier illisible ou tronqué." };
  }
  return { ok: true, format };
}

/**
 * Nom du futur objet Storage. Tiré d'un UUID : le nom saisi par l'administrateur
 * ne atteint jamais le chemin, ce qui écarte les traversées de répertoire et les
 * collisions entre deux projets.
 */
export function nomImageAleatoire(format: FormatImage): string {
  return `${crypto.randomUUID()}.${EXTENSION_PAR_FORMAT[format]}`;
}
