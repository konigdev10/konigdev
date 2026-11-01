/**
 * Formulaire de connexion à l'administration.
 *
 * Un seul message pour tous les échecs de credentials : l'existence d'une
 * adresse email n'est jamais révélée. Le mot de passe est effacé après chaque
 * tentative ratée, pour ne pas le laisser traîner dans le DOM ni dans un
 * gestionnaire de mots de passe en mode « mis à jour ? ».
 *
 * Le champ « site_web » est un piège à robots : invisible, sans autocomplete,
 * et un humain ne peut pas le remplir.
 */

"use client";

import { useCallback, useId, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { connexion, type ResultatConnexion } from "@/app/admin/login/actions";
import { Turnstile } from "./Turnstile";

const CHAMP_INPUT =
  "w-full h-12 px-4 rounded-[14px] bg-bg-page text-text-title font-text text-sm shadow-inset-field border border-transparent appearance-none transition-colors duration-200 focus:bg-white focus:outline-none focus:border-text-title focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2";

const CHAMP_LABEL = "font-text text-xs font-semibold text-text-title tracking-wide";

export function ConnexionForm({
  siteKeyTurnstile,
  avis,
}: {
  siteKeyTurnstile: string | null;
  avis: string | null;
}) {
  const routeur = useRouter();
  const [enCours, setEnCours] = useState(false);
  const [resultat, setResultat] = useState<ResultatConnexion | null>(null);
  const [jeton, setJeton] = useState("");
  const [motDePasseVisible, setMotDePasseVisible] = useState(false);
  const champMotDePasse = useRef<HTMLInputElement | null>(null);

  const identifiant = useId();
  const email = `${identifiant}-email`;
  const motDePasse = `${identifiant}-mdp`;

  const surJeton = useCallback((valeur: string) => setJeton(valeur), []);

  // React 18 : startTransition n'attend pas la fin d'une fonction asynchrone,
  // l'indicateur d'envoi retomberait trop tôt. Un état explicite est plus honnête.
  async function surSoumission(evenement: FormEvent<HTMLFormElement>) {
    evenement.preventDefault();
    const champ = evenement.currentTarget;
    const formulaire = new FormData(champ);

    setEnCours(true);
    try {
      const issue = await connexion(formulaire);
      setResultat(issue);

      if (issue.ok && issue.suite) {
        window.location.href = issue.suite;
        return;
      }

      // Échec : on repart d'une feuille blanche côté secret.
      setJeton("");
      if (champMotDePasse.current) champMotDePasse.current.value = "";
    } catch {
      setResultat({
        ok: false,
        suite: null,
        champs: {},
        global: "Connexion impossible pour le moment. Réessayez.",
        attente: null,
      });
    } finally {
      setEnCours(false);
    }
  }

  const erreurs = resultat?.champs ?? {};
  const messageGlobal = resultat?.global ?? avis;

  return (
    <form
      onSubmit={surSoumission}
      noValidate
      className="flex flex-col gap-6"
      aria-labelledby="connexion-titre"
    >
      {/* Piège à robots : jamais visible, jamais complété par un humain. */}
      <div className="sr-only" aria-hidden="true">
        <label htmlFor={`${identifiant}-piege`}>Site web</label>
        <input
          id={`${identifiant}-piege`}
          name="site_web"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className={CHAMP_LABEL} htmlFor={email}>
          Adresse email <span className="text-error">*</span>
        </label>
        <input
          id={email}
          name="email"
          type="email"
          required
          autoComplete="username"
          spellCheck={false}
          className={CHAMP_INPUT}
          aria-required="true"
          aria-invalid={erreurs["email"] ? "true" : "false"}
          aria-describedby={erreurs["email"] ? `${email}-erreur` : undefined}
        />
        {erreurs["email"] ? (
          <span id={`${email}-erreur`} className="font-text text-xs text-error">
            {erreurs["email"]}
          </span>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between gap-3">
          <label className={CHAMP_LABEL} htmlFor={motDePasse}>
            Mot de passe <span className="text-error">*</span>
          </label>
          <button
            type="button"
            onClick={() => setMotDePasseVisible((valeur) => !valeur)}
            className="font-text text-xs text-text-muted underline underline-offset-4 hover:text-text-title focus-visible:outline focus-visible:outline-2 focus-visible:outline-text-title focus-visible:outline-offset-2"
            aria-pressed={motDePasseVisible}
          >
            {motDePasseVisible ? "Masquer" : "Afficher"}
          </button>
        </div>
        <input
          ref={champMotDePasse}
          id={motDePasse}
          name="motDePasse"
          type={motDePasseVisible ? "text" : "password"}
          required
          autoComplete="current-password"
          className={CHAMP_INPUT}
          aria-required="true"
          aria-invalid={erreurs["motDePasse"] ? "true" : "false"}
          aria-describedby={erreurs["motDePasse"] ? `${motDePasse}-erreur` : undefined}
        />
        {erreurs["motDePasse"] ? (
          <span id={`${motDePasse}-erreur`} className="font-text text-xs text-error">
            {erreurs["motDePasse"]}
          </span>
        ) : null}
      </div>

      {siteKeyTurnstile ? (
        <>
          <Turnstile siteKey={siteKeyTurnstile} surJeton={surJeton} />
          <input type="hidden" name="jeton_turnstile" value={jeton} readOnly />
        </>
      ) : null}

      {messageGlobal ? (
        <p
          role="alert"
          className="rounded-[14px] bg-bg-card-end px-4 py-3 font-text text-sm text-error shadow-inset-field"
        >
          {messageGlobal}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={enCours}
        className="h-[52px] rounded-[16px] bg-accent font-display text-[15px] font-extrabold text-white shadow-btn-submit transition-opacity duration-200 hover:bg-accent-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-text-title disabled:opacity-60"
      >
        {enCours ? "Vérification…" : "Se connecter"}
      </button>

      <p className="font-text text-xs leading-relaxed text-text-muted">
        Les inscriptions sont fermées : un seul compte administrateur existe,
        créé depuis le tableau de bord Supabase. Après le mot de passe, un code
        à 6 chiffres est exigé.
      </p>
    </form>
  );
}
