"use server";

import { headers } from "next/headers";
import { creerClientSupabase } from "@/lib/supabase/server";
import { creerClientAdmin } from "@/lib/supabase/admin";
import { getServerEnv } from "@/lib/env";
import { hacherEmail, hacherIp, lireIpBrute } from "@/lib/visitor";
import { controleOrigine } from "@/lib/security/origin";
import { limiter } from "@/lib/security/rate-limit";
import { journaliser } from "@/lib/security/audit";
import { envoyerAlerte, empreinteCourte } from "@/lib/security/alerte";
import { turnstileActive, verifierTurnstile } from "@/lib/security/turnstile";
import { schemaConnexion, texteSur, valider } from "@/lib/security/validate";

/**
 * Connexion à l'administration.
 *
 * Le message affiché est le même pour tous les échecs de credentials : un
 * visiteur ne doit jamais pouvoir deviner si l'adresse email existe. Les
 * motifs réels (compte inconnu, mot de passe faux, piège déclenché) partent
 * dans le journal d'audit, côté serveur.
 *
 * Ordre des vérifications, de la moins coûteuse à la plus coûteuse : origine,
 * blocage progressif déjà en cours, débit, champ piège, forme de la saisie,
 * Turnstile, mot de passe. Un attaquant consomme donc le moins de ressources
 * possibles avant d'arriver à la comparaison de mot de passe.
 */

const MESSAGE_ECHEC = "Identifiants incorrects.";

export interface ResultatConnexion {
  ok: boolean;
  /** Cible de navigation quand la connexion est acceptée. */
  suite: string | null;
  champs: Record<string, string>;
  global: string | null;
  /** Secondes de blocage restantes, si l'IP est en cours de punition. */
  attente: number | null;
}

function refus(
  champs: Record<string, string> = {},
  global: string | null = MESSAGE_ECHEC,
  attente: number | null = null,
): ResultatConnexion {
  return { ok: false, suite: null, champs, global, attente };
}

function acceptation(suite: string): ResultatConnexion {
  return { ok: true, suite, champs: {}, global: null, attente: null };
}

/** « Réessayez dans 5 minutes. » — la durée seule, jamais le mécanisme. */
function messageAttente(secondes: number): string {
  const minutes = Math.max(1, Math.ceil(secondes / 60));
  return `Trop de tentatives. Réessayez dans ${minutes} minute${minutes > 1 ? "s" : ""}.`;
}

/** Fenêtre de comptage des échecs consécutifs, alignée sur celle de la fonction SQL. */
const FENETRE_ECHECS_MS = 30 * 60 * 1000;

export async function connexion(formulaire: FormData): Promise<ResultatConnexion> {
  const enTetes = headers();
  const { ipHashSalt, turnstileSecretKey, adminUserId } = getServerEnv();
  const admin = creerClientAdmin();

  // 1. Origine : une action serveur d'un autre site n'a rien à faire ici.
  const origine = controleOrigine(enTetes, "POST");
  if (!origine.autorise) {
    console.error("REFUS ORIGINE :", origine);
    return refus({}, "Requête refusée.");
  }

  // 2. Empreinte d'IP : tout le suivi de force brute repose dessus, en base,
  //    parce que Vercel ne partage aucun compteur entre ses fonctions.
  const ipBrute = lireIpBrute(enTetes);
  const ipHash = await hacherIp(ipBrute ?? "inconnue", ipHashSalt);

  // 3. Blocage progressif déjà en cours (1 min, puis 5, puis 30).
  const { data: verrou } = await admin.rpc("login_lockout_remaining", {
    p_ip_hash: ipHash ?? "inconnue",
  });
  if (typeof verrou === "number" && verrou > 0) {
    return refus({}, messageAttente(verrou), verrou);
  }

  // 4. Débits par IP et par compte, côté table rate_limits.
  const emailSaisi = String(formulaire.get("email") ?? "")
    .trim()
    .toLowerCase();
  const emailHash = emailSaisi ? await hacherEmail(emailSaisi, ipHashSalt) : null;

  const [parIp, parCompte] = await Promise.all([
    limiter(`connexion:ip:${ipHash ?? "inconnue"}`, 60, 20),
    emailHash
      ? limiter(`connexion:compte:${emailHash}`, 900, 8)
      : Promise.resolve({ autorise: true, compteur: 0, bloqueJusqua: null }),
  ]);

  if (!parIp.autorise || !parCompte.autorise) {
    const attente = Math.max(parIp.bloqueJusqua ?? 0, parCompte.bloqueJusqua ?? 0);
    const secondes = Math.max(1, attente - Math.floor(Date.now() / 1000));
    return refus({}, messageAttente(secondes), secondes);
  }

  // 5. Champ piège : un robot le remplit, un humain ne le voit jamais.
  const piege = texteSur(formulaire.get("site_web"), 40);
  if (piege !== "") {
    await journaliser({
      action: "connexion_echouee",
      detail: "champ_piege",
      ipHash,
      reussite: false,
    });
    return refus();
  }

  // 6. Forme de la saisie.
  const saisie = valider(schemaConnexion, {
    email: formulaire.get("email"),
    motDePasse: formulaire.get("motDePasse"),
  });
  if (!saisie.ok) {
    console.error("REFUS SAISIE FORME :", saisie);
    return refus(saisie.champs, saisie.global);
  }

  // 7. Turnstile, si la clé secrète est configurée.
  if (turnstileSecretKey && turnstileActive()) {
    const verdict = await verifierTurnstile(
      texteSur(formulaire.get("jeton_turnstile"), 4096),
      ipBrute,
    );
    if (!verdict.ok) {
      return refus({}, "Vérification humaine requise.");
    }
  }

  // 8. Comparaison du mot de passe, enfin, chez Supabase.
  const supabase = creerClientSupabase();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: saisie.data.email,
    password: saisie.data.motDePasse,
  });

  await admin.from("login_attempts").insert({
    ip_hash: ipHash ?? "inconnue",
    reussite: !error,
  });

  if (error) {
    console.error("ERREUR DE CONNEXION SUPABASE EXACTE :", error.message, error.status, error.name);

    await journaliser({
      action: "connexion_echouee",
      detail: `ip:${empreinteCourte(ipHash) ?? "inconnue"}`,
      ipHash,
      reussite: false,
    });

    const { count } = await admin
      .from("login_attempts")
      .select("*", { count: "exact", head: true })
      .eq("ip_hash", ipHash ?? "inconnue")
      .eq("reussite", false)
      .gte("created_at", new Date(Date.now() - FENETRE_ECHECS_MS).toISOString());

    if (typeof count === "number" && count >= 3) {
      await envoyerAlerte(
        "Trois échecs de connexion d'affilée",
        "avertissement",
        { empreinte: empreinteCourte(ipHash), total: count },
      );
    }

    return refus();
  }

  // 9. Le mot de passe seul ne vaut rien : le compte qui vient de s'ouvrir doit
  //    être L'UUID administrateur. Sinon la session est détruite dans la foulée
  //    et l'écran affiche la même phrase que pour un mauvais mot de passe.
  if (!adminUserId) {
    await supabase.auth.signOut();
    await journaliser({
      action: "acces_refuse",
      detail: "ADMIN_USER_ID_absent",
      ipHash,
      reussite: false,
    });
    return refus({}, "Configuration incomplète : ADMIN_USER_ID manquant.");
  }

  if (!data.user || data.user.id !== adminUserId) {
    await supabase.auth.signOut();
    await journaliser({
      action: "acces_refuse",
      detail: "compte_non_administrateur",
      ipHash,
      reussite: false,
    });
    await envoyerAlerte("Connexion réussie sur un compte non administrateur", "critique", {
      empreinte: empreinteCourte(ipHash),
    });
    return refus();
  }

  // 10. Réussite : on note un changement d'appareil avant d'actualiser la
  //     référence, pour ne pas alerter deux fois sur le même appareil.
  const { data: derniere } = await admin
    .from("admin_logs")
    .select("ip_hash")
    .eq("action", "connexion_reussie")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const nouvelAppareil = Boolean(ipHash) && derniere !== null && derniere.ip_hash !== ipHash;

  await journaliser({
    action: "connexion_reussie",
    detail: nouvelAppareil ? "nouvel_appareil" : null,
    ipHash,
    reussite: true,
  });

  if (nouvelAppareil) {
    await envoyerAlerte(
      "Connexion réussie depuis un nouvel appareil",
      "avertissement",
      { empreinte: empreinteCourte(ipHash) },
    );
  }

  // Le mot de passe seul ne vaut aal1 : aucune donnée n'est encore lisible.
  // La page /admin/mfa exigera le second facteur, puis posera le cookie
  // d'activité signé (sans quoi le middleware laisserait passer à chaque fois).
  return acceptation("/admin/mfa");
}
