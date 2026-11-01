/**
 * Vérification des primitives de sécurité de l'étape 1.
 *
 * Ces tests tournent sans instance Supabase ni serveur : ils portent sur la
 * logique pure (neutralisation CSV, contrôle d'origine, hachage des données
 * visiteur, cookie d'activité signé, politique de mot de passe, schémas zod)
 * et sur le ré-encodage des images, qui appelle directement sharp. Les tests
 * qui exigent une base vivante (RLS, 401, 429) sont listés dans SECURITY.md et
 * s'exécutent en HTTP.
 *
 * Lancement : npm run test:securite
 * Sortie : 0 si tout passe, 1 au premier échec constaté (tous sont signalés).
 */

import sharp from "sharp";

import {
  construireCsv,
  desinfecterCellule,
  enTetesTelechargementCsv,
} from "../lib/security/csv.ts";
import {
  detecterFormat,
  evaluerImage,
  familleReelle,
  nomImageAleatoire,
  TAILLE_MAX_OCTETS,
} from "../lib/security/image.ts";
import { ErreurImage, preparerImage } from "../lib/security/image-encodage.ts";
import { controleOrigine, origineAcceptable } from "../lib/security/origin.ts";
import {
  INACTIVITE_MAX,
  DUREE_SESSION_MAX,
  NOM_COOKIE_ACTIVITE,
  creerJetonActivite,
  renouvelerJetonActivite,
  verifierJetonActivite,
} from "../lib/security/session.ts";
import {
  schemaCodeMfa,
  schemaConnexion,
  schemaMotDePasseNeuf,
  valider,
  verifierMotDePasse,
} from "../lib/security/validate.ts";
import {
  estUuid,
  hacherIp,
  lireIpBrute,
  nettoyer,
} from "../lib/visitor.ts";
import { afficherDateHeure, afficherJour } from "../lib/affichage.ts";

const ADMIN = "3f2b7a10-6b0c-4d8e-9a11-7c52f0e4d9bb";
const AUTRE_COMPTE = "9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d";
const SEL = "un-sel-de-test-de-32-caracteres-ou-plus";

let echecs = 0;
let reussis = 0;

function verifie(nom: string, condition: boolean): void {
  if (condition) {
    reussis += 1;
    console.log(`  OK   ${nom}`);
  } else {
    echecs += 1;
    console.log(`  ECHEC ${nom}`);
  }
}

function titre(section: string): void {
  console.log(`\n${section}`);
}

// ---------------------------------------------------------------------------
// 1. Export CSV — injection de formules (test 8 du cahier des charges)
// ---------------------------------------------------------------------------

titre("CSV : neutralisation des formules");

verifie("« =1+1 » reçoit une apostrophe", desinfecterCellule("=1+1") === "'=1+1");
verifie("« +2 » est neutralisé", desinfecterCellule("+2") === "'+2");
verifie("« -2 » est neutralisé", desinfecterCellule("-2") === "'-2");
verifie("« @SUM(A1) » est neutralisé", desinfecterCellule("@SUM(A1)") === "'@SUM(A1)");
verifie(
  "« \\t=cmd » (préfixe tabulation) est neutralisé",
  desinfecterCellule("\t=cmd|x") === "'=cmd|x",
);
verifie(
  "« =HYPERLINK(...) » du formulaire de contact est neutralisé",
  desinfecterCellule('=HYPERLINK("http://evil","clique")').startsWith("'=HYPERLINK"),
);
verifie("texte ordinaire inchangé", desinfecterCellule("Poto-Poto") === "Poto-Poto");
verifie("nombre converti", desinfecterCellule(42) === "42");
verifie("booléen converti", desinfecterCellule(true) === "true");
verifie("null devient vide", desinfecterCellule(null) === "");
verifie("undefined devient vide", desinfecterCellule(undefined) === "");

const csv = construireCsv(
  ["Nom", "Message"],
  [
    ["=1+1", 'il dit "bonjour"; à tous'],
    [null, "ligne\ndeux"],
  ],
);

verifie("séparateur point-virgule", csv.includes("Nom;Message"));
verifie("fins de ligne CRLF", csv.includes("\r\n"));
verifie("guillemets doublés et cellule protégée", csv.includes('"il dit ""bonjour""; à tous"'));
verifie(
  "saut de ligne interne : retiré, donc aucune ligne du document ne peut être forgée",
  csv.includes(";ligne deux") && csv.split("\r\n").length === 4,
);
verifie(
  "formule neutralisée y compris dans le document complet",
  csv.includes("'=1+1"),
);

const enTetes = enTetesTelechargementCsv('visites";../../etc/passwd'.toString());
verifie(
  "nom de fichier nettoyé pour Content-Disposition",
  !enTetes["Content-Disposition"].includes('"..') &&
    enTetes["Content-Disposition"].includes("attachment"),
);
verifie("export en no-store", enTetes["Cache-Control"] === "no-store");

// ---------------------------------------------------------------------------
// 2. Contrôle d'origine (test 7 du cahier des charges)
// ---------------------------------------------------------------------------

titre("Origine : refus des requêtes venues d'ailleurs");

function entetes(valeurs: Record<string, string>): Headers {
  return new Headers(valeurs);
}

verifie(
  "POST depuis mon propre domaine accepté",
  origineAcceptable(
    entetes({ host: "konigdev.vercel.app", origin: "https://konigdev.vercel.app" }),
    "POST",
  ),
);
verifie(
  "POST depuis un domaine étranger refusé",
  controleOrigine(
    entetes({ host: "konigdev.vercel.app", origin: "https://evil.example" }),
    "POST",
  ).autorise === false,
);
verifie(
  "POST sans en-tête Origin refusé",
  controleOrigine(entetes({ host: "konigdev.vercel.app" }), "POST").autorise === false,
);
verifie(
  "GET sans Origin autorisé (navigation normale)",
  origineAcceptable(entetes({ host: "konigdev.vercel.app" }), "GET"),
);
verifie(
  "sec-fetch-site=cross-site refusé même avec Origin collant",
  controleOrigine(
    entetes({
      host: "konigdev.vercel.app",
      origin: "https://konigdev.vercel.app",
      "sec-fetch-site": "cross-site",
    }),
    "POST",
  ).autorise === false,
);
verifie(
  "origine en http non-localhost refusée",
  controleOrigine(
    entetes({ host: "mondomaine.dev", origin: "http://mondomaine.dev" }),
    "POST",
  ).autorise === false,
);
verifie(
  "localhost en http accepté (développement)",
  origineAcceptable(
    entetes({ host: "localhost:3000", origin: "http://localhost:3000" }),
    "POST",
  ),
);
verifie(
  "Origin invalide (pas une URL) refusée sans jeter",
  controleOrigine(entetes({ host: "a.dev", origin: "pas-une-url" }), "POST")
    .autorise === false,
);
verifie(
  "hôte absent refusé",
  controleOrigine(entetes({ origin: "https://a.dev" }), "POST").autorise === false,
);
verifie(
  "sous-domaine trompeur refusé",
  controleOrigine(
    entetes({ host: "konigdev.vercel.app", origin: "https://konigdev.vercel.app.evil.example" }),
    "POST",
  ).autorise === false,
);

// ---------------------------------------------------------------------------
// 3. Données visiteur : IP hachée, troncature, caractères de contrôle (test 5)
// ---------------------------------------------------------------------------

titre("Visiteur : IP jamais en clair, entrées nettoyées");

const UAGENT_XSS = "<script>alert(document.cookie)</script>";

const hash1 = await hacherIp("102.150.22.8", SEL);
const hash2 = await hacherIp("102.150.22.8", SEL);
const hash3 = await hacherIp("102.150.22.8", "un-autre-sel-de-test-32-caracteres-min");
const hash4 = await hacherIp("102.150.22.9", SEL);

verifie("empreinte produite", typeof hash1 === "string");
verifie("64 caractères hexadécimaux", /^[a-f0-9]{64}$/.test(hash1 ?? ""));
verifie("déterministe pour une même IP et un même sel", hash1 === hash2);
verifie("changer le sel change l'empreinte", hash1 !== hash3);
verifie("changer l'IP change l'empreinte", hash1 !== hash4);
verifie("l'IP en clair n'apparaît jamais dans l'empreinte", !(hash1 ?? "").includes("102"));
verifie("IP vide refusée", (await hacherIp("", SEL)) === null);
verifie("sel vide refusé", (await hacherIp("1.2.3.4", "")) === null);

verifie(
  "x-forwarded-for : première adresse retenue",
  lireIpBrute(entetes({ "x-forwarded-for": " 102.150.22.8 , 10.0.0.1, 10.0.0.2" })) ===
    "102.150.22.8",
);
verifie(
  "x-forwarded-for forgé en script rejeté",
  lireIpBrute(entetes({ "x-forwarded-for": UAGENT_XSS })) === null,
);
verifie("x-forwarded-for absent → null", lireIpBrute(new Headers()) === null);
verifie(
  "chaîne trop longue rejetée",
  lireIpBrute(entetes({ "x-forwarded-for": `${"a".repeat(120)}, 1.2.3.4` })) === null,
);

verifie("UUID de visiteur accepté", estUuid("3f2b7a10-6b0c-4d8e-9a11-7c52f0e4d9bb"));
verifie("UUID tronqué refusé", !estUuid("3f2b7a10-6b0c-4d8e-9a11"));
verifie("charge XSS refusée comme UUID", !estUuid(UAGENT_XSS));

verifie(
  "troncature à la longueur maximale",
  nettoyer("B".repeat(200), 60) === "B".repeat(60),
);
verifie(
  "caractères de contrôle retirés",
  nettoyer("a\u0000b\u001Fc\u007Fd", 60) === "abcd",
);
verifie("percent-décodage", nettoyer("Poto%20Poto", 60) === "Poto Poto");
verifie(
  "percent-décodage invalide ne jette pas",
  nettoyer("%zz%41%zz", 60) !== null,
);
verifie("valeur entièrement vide → null", nettoyer("   ", 60) === null);
verifie("null passe null", nettoyer(null, 60) === null);
verifie(
  "charge XSS conservée telle quelle (elle sera échappée à l'affichage, jamais exécutée)",
  nettoyer(UAGENT_XSS, 200) === UAGENT_XSS,
);

// ---------------------------------------------------------------------------
// 4. Cookie d'activité signé (session 30 min / 8 h)
// ---------------------------------------------------------------------------

titre("Session admin : cookie d'activité signé");

const horlogeReelle = Date.now;
function decaleDe(secondes: number): void {
  Date.now = () => horlogeReelle() + secondes * 1000;
}
function horlogeNormale(): void {
  Date.now = horlogeReelle;
}

const jeton = await creerJetonActivite(ADMIN, SEL);

verifie("deux champs séparés par un point", jeton.split(".").length === 2);
verifie("cookie nommé et non générique", NOM_COOKIE_ACTIVITE === "konig_activite");

const ok = await verifierJetonActivite(jeton, ADMIN, SEL);
verifie("jeton frais accepté", ok.valide === true && ok.motif === null);

const [corps, signature] = jeton.split(".");
// Corps légitime mais destinataire modifié : c'est bien une falsification, la
// signature ne le couvre plus. (Recopier le même contenu avec la même signature
// ne prouverait rien : le jeton resterait valide.)
const corpsVol = btoa(
  `${Math.floor(Date.now() / 1000)}.${Math.floor(Date.now() / 1000)}.${AUTRE_COMPTE}`,
);

verifie(
  "signature altérée refusée",
  (await verifierJetonActivite(`${corps}.${signature.slice(0, -2)}AA`, ADMIN, SEL))
    .motif === "signature",
);
verifie(
  "contenu modifié sans la bonne signature refusé",
  (await verifierJetonActivite(`${corpsVol}.${signature}`, ADMIN, SEL)).motif ===
    "signature",
);
verifie(
  "jeton d'un autre titulaire refusé",
  (await verifierJetonActivite(jeton, AUTRE_COMPTE, SEL)).motif === "utilisateur",
);
verifie("jeton absent refusé", (await verifierJetonActivite(null, ADMIN, SEL)).motif === "absent");
verifie(
  "forme invalide (trois champs) refusée",
  (await verifierJetonActivite("a.b.c", ADMIN, SEL)).motif === "forme",
);
verifie(
  "base64 cassé refusé sans jeter",
  (await verifierJetonActivite("!!!!.****", ADMIN, SEL)).motif === "forme",
);
verifie(
  "clé secrète différente → refus par la signature",
  (await verifierJetonActivite(jeton, ADMIN, "un-troisieme-sel-de-test-32-caracteres")).motif ===
    "signature",
);

decaleDe(INACTIVITE_MAX + 1);
const inactive = await verifierJetonActivite(jeton, ADMIN, SEL);
verifie("inactivité de 30 min + 1 s → refus", inactive.motif === "inactif");
horlogeNormale();

// Le plafond de 8 heures ne peut être testé qu'en maintenant la dernière
// activité à jour : sinon c'est l'inactivité qui parle en premier.
decaleDe(DUREE_SESSION_MAX + 1);
const renouveleeTard = await renouvelerJetonActivite(jeton, ADMIN, SEL);
const expiree = await verifierJetonActivite(renouveleeTard, ADMIN, SEL);
verifie("session de 8 h + 1 s → refus malgré une activité récente", expiree.motif === "expire");
horlogeNormale();

const renouvelee = await renouvelerJetonActivite(jeton, ADMIN, SEL);
const corpsRenouvele = atob((renouvelee.split(".")[0] ?? "").replace(/-/g, "+").replace(/_/g, "/"));
const corpsOriginal = atob(corps ?? "");
verifie(
  "le renouvellement conserve l'heure de début (plafond de 8 h intact)",
  corpsRenouvele.split(".")[0] === corpsOriginal.split(".")[0],
);

decaleDe(30);
const renouveleeApresTrenteSecondes = await renouvelerJetonActivite(jeton, ADMIN, SEL);
horlogeNormale();
verifie(
  "renouvellement : la dernière activité est rajeunie et le jeton reste recevable",
  (await verifierJetonActivite(renouveleeApresTrenteSecondes, ADMIN, SEL)).valide === true &&
    atob(renouveleeApresTrenteSecondes.split(".")[0] ?? "").split(".")[1] !==
      corpsOriginal.split(".")[1],
);

decaleDe(INACTIVITE_MAX * 4);
const jetonFutur = await creerJetonActivite(ADMIN, SEL);
horlogeNormale();
verifie(
  "horodatage en avance sur l'horloge du serveur → refus",
  (await verifierJetonActivite(jetonFutur, ADMIN, SEL)).motif === "future",
);

// ---------------------------------------------------------------------------
// 5. Politique de mot de passe et schémas zod stricts
// ---------------------------------------------------------------------------

titre("Validation : mots de passe et rejet des champs inconnus");

verifie("13 caractères refusés", verifierMotDePasse("Abcdef123456\u0040").acceptable === false);
verifie(
  "mot de passe courant refusé",
  verifierMotDePasse("Motdepasse123456") !== null &&
    verifierMotDePasse("azerty").acceptable === false,
);
verifie(
  "suite clavier refusée",
  verifierMotDePasse("Azertyuiop123456!").acceptable === false,
);
verifie(
  "sans chiffres, refusé",
  verifierMotDePasse("TresLongSansChiffres!").acceptable === false,
);
verifie(
  "email local contenu dans le mot de passe, refusé",
  verifierMotDePasse("Bonjour2286konigdev!", "konigdev@example.com").acceptable === false,
);
verifie(
  "mot de passe solide accepté",
  verifierMotDePasse("Grive-Comate-Butoir-72").acceptable === true,
);
verifie("trop long refusé", verifierMotDePasse("Aa1" + "x".repeat(300)).acceptable === false);

// Schéma de connexion : un champ en trop doit être refusé, pas ignoré.
const connexionAvecChampEnTrop = valider(schemaConnexion, {
  email: "admin@example.com",
  motDePasse: "un-mot-de-passe",
  role: "super",
});
verifie("champ inconnu rejeté à la connexion", connexionAvecChampEnTrop.ok === false);

const connexionValide = valider(schemaConnexion, {
  email: " admin@example.com ",
  motDePasse: "un-mot-de-passe",
});
verifie(
  "email tronqué des espaces accepté",
  connexionValide.ok === true && connexionValide.data.email === "admin@example.com",
);

verifie(
  "email sans arobase refusé",
  valider(schemaConnexion, { email: "pas-d-arobase", motDePasse: "x" }).ok === false,
);

/** Identifiant technique d'un facteur : un UUID, jamais une valeur inventée. */
const FACTEUR = "0f9c2b1a-4d3e-4c5b-8a7f-1e2d3c4b5a69";

for (const code of ["123456", "000000"]) {
  verifie(
    `code valide accepté : ${code}`,
    valider(schemaCodeMfa, { code, factorId: FACTEUR }).ok === true,
  );
}
for (const code of ["12345", "1234567", "abcdef", "", " 12 345 ", "12.345"]) {
  verifie(
    `code refusé : « ${code} »`,
    valider(schemaCodeMfa, { code, factorId: FACTEUR }).ok === false,
  );
}

verifie(
  "facteur absent ou mal formé refusé",
  valider(schemaCodeMfa, { code: "123456" }).ok === false &&
    valider(schemaCodeMfa, { code: "123456", factorId: "tout-venant" }).ok === false,
);

verifie(
  "un champ inconnu dans le formulaire MFA est refusé",
  valider(schemaCodeMfa, { code: "123456", factorId: FACTEUR, admin: "oui" }).ok === false,
);

const resultatCode = valider(schemaCodeMfa, { code: "abc", factorId: FACTEUR });
verifie(
  "message d'erreur français sous le champ concerné",
  resultatCode.ok === false &&
    Object.prototype.hasOwnProperty.call(resultatCode.champs, "code") &&
    resultatCode.champs["code"] === "Code à 6 chiffres attendu.",
);

const deuxSaisies = valider(schemaMotDePasseNeuf, {
  email: "admin@example.com",
  motDePasse: "Grive-Comate-Butoir-72",
  confirmation: "Grive-Comate-Butoir-73",
});
verifie(
  "les deux saisies doivent coïncider",
  deuxSaisies.ok === false && deuxSaisies.champs["confirmation"] !== undefined,
);

const tropCourt = valider(schemaMotDePasseNeuf, {
  email: "admin@example.com",
  motDePasse: "Courti1",
  confirmation: "Courti1",
});
verifie("14 caractères exigés à la création", tropCourt.ok === false);

// ---------------------------------------------------------------------------
// 6. Images : signature binaire, ré-encodage, métadonnées (test 4)
// ---------------------------------------------------------------------------

titre("Images : ce que dit l'extension ne compte pas");

const CODAGE = new TextEncoder();

/** En-tête d'un exécutable Windows, suivi de remplissage. Renommé en .jpg, il
 *  doit être refusé : c'est précisément le cas imposé par le cahier des charges. */
const EXE_REVETU_JPG = Uint8Array.from([0x4d, 0x5a, 0x90, 0x00, ...CODAGE.encode("This program cannot be run in DOS mode.")]);

const SVG_AVEC_SCRIPT = CODAGE.encode(
  '<?xml version="1.0"?><svg xmlns="http://www.w3.org/2000/svg" onload="alert(document.cookie)"><script>alert(1)</script></svg>',
);

const PDF = Uint8Array.from([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x37, ...CODAGE.encode("\n%/Catalog")]);

const GIF = Uint8Array.from([0x47, 0x49, 0x46, 0x38, 0x39, 0x61, ...CODAGE.encode("\x01\x00\x01\x00")]);

verifie(
  "exécutable renommé en .jpg refusé",
  evaluerImage("facture.jpg", EXE_REVETU_JPG).ok === false,
);
verifie(
  "SVG portant un script refusé, même avec une extension autorisée",
  evaluerImage("dessin.svg", SVG_AVEC_SCRIPT).ok === false &&
    evaluerImage("dessin.png", SVG_AVEC_SCRIPT).ok === false,
);
verifie("PDF renommé en .jpg refusé", evaluerImage("brochure.jpg", PDF).ok === false);
verifie(
  "GIF renommé en .png refusé",
  evaluerImage("animation.png", GIF).ok === false,
);
verifie(
  "fichier tronqué refusé",
  evaluerImage("moitie.png", Uint8Array.from([0x89, 0x50, 0x4e])).ok === false,
);
verifie("fichier vide refusé", evaluerImage("rien.jpg", new Uint8Array(0)).ok === false);

const TROP_LOURD = new Uint8Array(TAILLE_MAX_OCTETS + 1);
TROP_LOURD[0] = 0xff;
TROP_LOURD[1] = 0xd8;
TROP_LOURD[2] = 0xff;
verifie(
  "au-delà de 3 Mo, refusé",
  evaluerImage("grande.jpg", TROP_LOURD).ok === false &&
    (evaluerImage("grande.jpg", TROP_LOURD) as { raison?: string }).raison ===
      "Image trop lourde : 3 Mo maximum.",
);

verifie(
  "extension non listée refusée d'emblée",
  evaluerImage("script.exe", EXE_REVETU_JPG).ok === false,
);

/** Les familles sont nommées d'après les octets, jamais d'après le nom du fichier. */
verifie(
  "famille réelle lue dans les octets",
  familleReelle(EXE_REVETU_JPG) === "executable" &&
    familleReelle(SVG_AVEC_SCRIPT) === "marquage" &&
    familleReelle(PDF) === "pdf" &&
    familleReelle(GIF) === "gif",
);

verifie(
  "nom de fichier regeneré en UUID",
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.jpg$/.test(
    nomImageAleatoire("jpeg"),
  ) &&
    nomImageAleatoire("png").endsWith(".png") &&
    nomImageAleatoire("jpeg") !== nomImageAleatoire("jpeg"),
);

/**
 * Trois vraies images, fabriquées à la taille d'une photo de téléphone, portent
 * une métadonnée canari. Après ré-encodage : largeur réduite, canari disparu,
 * bloc EXIF absent.
 */
async function photo(format: "jpeg" | "png" | "webp", largeur: number, hauteur: number): Promise<Uint8Array> {
  const rendu = await sharp({
    create: { width: largeur, height: hauteur, channels: 3, background: { r: 34, g: 37, b: 42 } },
  })
    .withExif({ IFD0: { ImageDescription: "CANARI-GPS-48-51-S", Make: "peut-importe" } })
    .toFormat(format, { quality: 90 })
    .toBuffer();
  return new Uint8Array(rendu);
}

for (const format of ["jpeg", "png", "webp"] as const) {
  const originale = await photo(format, 3200, 1800);
  const ext = format === "jpeg" ? "jpg" : format;
  const nom = `photo-de-telephone.${ext}`;

  verifie(
    `vraie image ${format} acceptée`,
    evaluerImage(nom, originale).ok === true &&
      (evaluerImage(nom, originale) as { format?: string }).format === format,
  );

  const preparee = await preparerImage(nom, originale);

  verifie(
    `ré-encodage ${format} ramené à 1600 px de large`,
    preparee.largeur === 1600 && preparee.hauteur === 900 && preparee.format === format,
  );
  verifie(
    `métadonnée canari supprimée de la sortie ${format}`,
    !Buffer.from(preparee.octets).includes("CANARI-GPS") &&
      (await sharp(preparee.octets).metadata()).exif === undefined,
  );
  verifie(
    `sortie ${format} toujours reconnue par ses octets`,
    detecterFormat(preparee.octets) === format,
  );
}

const petite = await photo("jpeg", 800, 600);
const petitePreparee = await preparerImage("logo.jpg", petite);
verifie(
  "une image déjà plus petite que 1600 px n'est pas agrandie",
  petitePreparee.largeur === 800 && petitePreparee.hauteur === 600,
);

const motifRefus = await preparerImage("virus.jpg", EXE_REVETU_JPG).then(
  () => null,
  (erreur: unknown) => (erreur instanceof ErreurImage ? erreur.message : "autre erreur"),
);
verifie(
  "le ré-encodage d'un faux .jpg échoue sur un motif français",
  motifRefus === "Ce fichier n'est pas une image.",
);

const motifCorrompu = await preparerImage(
  "moitie.jpg",
  Uint8Array.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00]),
).then(() => null, (erreur: unknown) => (erreur instanceof ErreurImage ? erreur.message : "autre erreur"));
verifie(
  "un fichier incomplet est refusé sans laisser filer une erreur de librairie",
  motifCorrompu === "Image illisible ou corrompue.",
);

// ---------------------------------------------------------------------------
// Fuseau d'affichage
// ---------------------------------------------------------------------------

// 23:30 UTC est 00:30 à Brazzaville (UTC+1) : le jour affiché change. Un admin
// qui lit « hier » doit lire le même jour que celui de son téléphone.
verifie(
  "une heure UTC proche de minuit bascule au jour suivant à Brazzaville",
  afficherDateHeure("2026-11-01T23:30:00.000Z").startsWith("2 novembre 2026") &&
    afficherJour("2026-11-01T23:30:00.000Z") === "2 novembre 2026",
);

verifie(
  "une date invalide n'affiche ni plantage ni valeur inventée",
  afficherJour(null) === "date indisponible" &&
    afficherDateHeure("pas-une-date") === "date indisponible",
);

// ---------------------------------------------------------------------------

console.log(
  `\n${reussis} vérification(s) réussie(s), ${echecs} échec(s).`,
);
process.exit(echecs > 0 ? 1 : 0);
