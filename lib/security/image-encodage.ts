/**
 * Ré-encodage des images de l'administration avec sharp.
 *
 * Un fichier déposé n'est jamais stocké tel quel. Le ré-encodage sert trois
 * choses : la largeur est ramenée à 1600 px (un visuel plus grand ne sert à
 * rien sur le site et coûte du trafic), les métadonnées disparaissent (EXIF,
 * XMP, ICC non déclaré, et surtout le GPS de la photo prise au téléphone), et
 * le fichier ressort dans le format annoncé par ses octets.
 *
 * sharp retire toute métadonnée tant que withMetadata() n'est pas appelé :
 * c'est le comportement par défaut, et il n'y a aucun endroit où l'on peut
 * l'activer par accident ici. rotate() sans argument applique l'orientation
 * inscrite dans l'EXIF puis l'efface, ce qui évite les images pivotées sans
 * conserver le tag d'origine.
 *
 * Pas de marque « server-only » : le harnais Node (npm run test:securite) doit
 * importer ce module pour prouver que les métadonnées sortent bien effacées,
 * et l'alias webpack de Next n'existe pas hors du build. Les seuls appelants
 * sont des actions serveur, et sharp est un binaire Node impossible à bundler
 * côté client de toute façon.
 */

import sharp from "sharp";

// L'extension « .ts » est écrite en toutes lettres : le harnais Node
// (npm run test:securite) résout les chemins sans l'alias webpack de Next, et
// le projet ne produit aucun JS compilé (d'où allowImportingTsExtensions).
import {
  detecterFormat,
  evaluerImage,
  LARGEUR_CIBLE,
  TAILLE_MAX_OCTETS,
  type FormatImage,
} from "./image.ts";

/** Garde-fou contre une image « décompression bomb » : 24 mégapixels suffisent
 *  largement, et au-delà sharp refuse de décoder. */
const PIXELS_MAX = 24_000_000;

export class ErreurImage extends Error {}

export interface ImagePrete {
  octets: Uint8Array;
  format: FormatImage;
  largeur: number;
  hauteur: number;
}

/**
 * Contrôle puis ré-encode. Toute exception de sharp est convertie en
 * ErreurImage : l'appelant n'a jamais à connaître le vocabulaire de la
 * librairie, et le message renvoyé à l'écran reste français et général.
 */
export async function preparerImage(
  nom: string,
  contenu: Uint8Array,
): Promise<ImagePrete> {
  const verdict = evaluerImage(nom, contenu);
  if (!verdict.ok) throw new ErreurImage(verdict.raison);

  const { format } = verdict;
  try {
    const pipeline = sharp(contenu, {
      failOn: "error",
      // Option et non méthode : sharp 0.35 expose la borne à l'ouverture du
      // fichier. Sans elle, une image de 0x3FFF × 0x3FFF serait décodée.
      limitInputPixels: PIXELS_MAX,
    })
      .rotate()
      .resize({
        width: LARGEUR_CIBLE,
        height: LARGEUR_CIBLE,
        fit: "inside",
        withoutEnlargement: true,
      });

    const octets =
      format === "png"
        ? await pipeline.png({ compressionLevel: 9, effort: 6 }).toBuffer()
        : format === "webp"
          ? await pipeline.webp({ quality: 82, effort: 6 }).toBuffer()
          : await pipeline.jpeg({ quality: 82, mozjpeg: true }).toBuffer();

    // Le produit fini doit rester une image des trois familles autorisées :
    // une sortie inattendue est un refus, pas un fichier à stocker.
    if (detecterFormat(octets) !== format) {
      throw new ErreurImage("Ré-encodage impossible.");
    }
    if (octets.length > TAILLE_MAX_OCTETS) {
      throw new ErreurImage("Image trop lourde après ré-encodage : 3 Mo maximum.");
    }

    const informations = await sharp(octets).metadata();
    return {
      octets,
      format,
      largeur: informations.width ?? 0,
      hauteur: informations.height ?? 0,
    };
  } catch (erreur) {
    if (erreur instanceof ErreurImage) throw erreur;
    throw new ErreurImage("Image illisible ou corrompue.");
  }
}
