"use client";

import { useCallback, useId, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import { verifierCode, type ResultatMfa } from "@/app/admin/mfa/actions";

export const CHAMP_MFA =
  "w-full h-12 px-4 rounded-[14px] bg-bg-page text-text-title font-text text-sm shadow-inset-field border border-transparent appearance-none transition-colors duration-200 focus:bg-white focus:outline-none focus:border-text-title focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2";

const CHAMP_CODE = `${CHAMP_MFA} tracking-[0.3em] text-center text-lg font-semibold`;

interface Props {
  /**
   * Facteurs TOTP du compte, choisis par le serveur. Le navigateur n'envoie
   * qu'un identifiant parmi cette liste ; l'action le recontrôle de toute façon.
   */
  facteurs: { id: string; nom: string }[];
  libelle?: string;
  surTermine?: () => void;
}

/**
 * Saisie du code à 6 chiffres. Un seul champ, une seule phrase d'erreur : le
 * serveur ne dit jamais si le facteur existe, s'il est déjà validé ou si le
 * code est simplement périmé.
 */
export function MfaForm({ facteurs, libelle = "Confirmer", surTermine }: Props) {
  const routeur = useRouter();
  const id = useId();
  const [enCours, setEnCours] = useState(false);
  const [resultat, setResultat] = useState<ResultatMfa | null>(null);

  const surSoumission = useCallback(
    async (evenement: FormEvent<HTMLFormElement>) => {
      evenement.preventDefault();
      setEnCours(true);
      try {
        const issue = await verifierCode(new FormData(evenement.currentTarget));
        setResultat(issue);
        if (issue.ok && issue.suite) {
          routeur.push(issue.suite);
          routeur.refresh();
          return;
        }
        if (issue.ok) surTermine?.();
      } catch {
        setResultat({ ok: false, suite: null, global: "Erreur réseau. Réessayez." });
      } finally {
        setEnCours(false);
      }
    },
    [routeur, surTermine],
  );

  return (
    <form onSubmit={surSoumission} noValidate className="flex flex-col gap-5">
      {facteurs.length > 1 ? (
        <div className="flex flex-col gap-2">
          <label
            htmlFor={`${id}-facteur`}
            className="font-text text-xs font-semibold tracking-wide text-text-title"
          >
            Appareil utilisé
          </label>
          <select
            id={`${id}-facteur`}
            name="factorId"
            defaultValue={facteurs[0]!.id}
            className={CHAMP_MFA}
          >
            {facteurs.map((facteur) => (
              <option key={facteur.id} value={facteur.id}>
                {facteur.nom}
              </option>
            ))}
          </select>
        </div>
      ) : (
        <input type="hidden" name="factorId" value={facteurs[0]?.id ?? ""} />
      )}

      <div className="flex flex-col gap-2">
        <label
          htmlFor={`${id}-code`}
          className="font-text text-xs font-semibold tracking-wide text-text-title"
        >
          Code à 6 chiffres <span className="text-error">*</span>
        </label>
        <input
          id={`${id}-code`}
          name="code"
          type="text"
          inputMode="numeric"
          pattern="[0-9]{6}"
          maxLength={6}
          required
          autoComplete="one-time-code"
          autoFocus
          placeholder="000000"
          className={CHAMP_CODE}
          aria-required="true"
        />
        <p className="font-text text-xs leading-relaxed text-text-muted">
          Ouvrez votre application d&apos;authentification et saisissez le code
          affiché. Il change toutes les 30 secondes.
        </p>
      </div>

      {resultat?.global ? (
        <p
          role="alert"
          className="rounded-[14px] bg-bg-page px-4 py-3 font-text text-sm text-error shadow-inset-field"
        >
          {resultat.global}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={enCours}
        className="h-[52px] rounded-[16px] bg-accent font-display text-[15px] font-extrabold text-white shadow-btn-submit transition-colors duration-200 hover:bg-accent-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-text-title disabled:opacity-60"
      >
        {enCours ? "Vérification…" : libelle}
      </button>
    </form>
  );
}
