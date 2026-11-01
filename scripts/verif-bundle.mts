/**
 * Test 9 du cahier des charges : la clé service role ne doit jamais atteindre un
 * fichier servi au navigateur.
 *
 * Méthode : on remplace SUPABASE_SERVICE_ROLE_KEY par une valeur canari avant le
 * build, puis on traque cette valeur dans .next/static — le seul répertoire que
 * le navigateur télécharge. Si Next l'avait inlinée dans un bundle client, ou
 * qu'un module « use client » importait lib/supabase/admin.ts, la traque la
 * trouverait.
 *
 * Le build est relancé ici avec l'environnement modifié : c'est lent, mais c'est
 * la seule façon de vérifier le produit fini plutôt que le code source.
 */

import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const RACINE = process.cwd();
const CANARI = `SRK_CANARI_${"0123456789abcdef".repeat(4)}`;

/** Fichiers servis au navigateur, par opposition à .next/server. */
const REPERTOIRE_CLIENT = join(RACINE, ".next", "static");

function parcourir(dossier: string, sortie: string[]): void {
  for (const entree of readdirSync(dossier)) {
    const chemin = join(dossier, entree);
    if (statSync(chemin).isDirectory()) parcourir(chemin, sortie);
    else sortie.push(chemin);
  }
}

const binaireNext = join(RACINE, "node_modules", "next", "dist", "bin", "next");
if (!existsSync(binaireNext)) {
  console.error("ECHEC : next est absent (node_modules/next/dist/bin/next introuvable).");
  process.exit(1);
}

// La valeur réelle ne doit pas traîner dans l'environnement du build.
process.env.SUPABASE_SERVICE_ROLE_KEY = CANARI;
delete process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;

const build = spawnSync(process.execPath, [binaireNext, "build"], {
  cwd: RACINE,
  env: process.env,
  stdio: "inherit",
});

if (build.status !== 0) {
  console.error("ECHEC build de production (le test de fuite n'a pas pu courir).");
  process.exit(1);
}

if (!existsSync(REPERTOIRE_CLIENT)) {
  console.error("ECHEC .next/static introuvable après le build.");
  process.exit(1);
}

const fichiers: string[] = [];
parcourir(REPERTOIRE_CLIENT, fichiers);

const fautifs: string[] = [];
for (const chemin of fichiers) {
  const contenu = readFileSync(chemin, "utf8");
  if (contenu.includes(CANARI) || contenu.includes("SUPABASE_SERVICE_ROLE_KEY")) {
    fautifs.push(chemin.slice(REPERTOIRE_CLIENT.length + 1));
  }
}

if (fautifs.length > 0) {
  console.error(`ECHEC clé service role détectée dans ${fautifs.length} fichier(s) client(s) :`);
  for (const nom of fautifs) console.error(`  ${nom}`);
  process.exit(1);
}

console.log(
  `OK   bundle client inspecté (${fichiers.length} fichier(s)) : aucune trace de la clé service role.`,
);
