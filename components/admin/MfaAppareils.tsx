"use client";

import { useCallback, useId, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import {
  abandonnerEnrolement,
  deconnecter,
  retirerAppareil,
  type ResultatMfa,
} from "@/app/admin/mfa/actions";
import { CHAMP_MFA } from "./MfaForm";

export interface Appareil {
  id: string;
  nom: string;
  verifie: boolean;
  /** Date déjà composée côté serveur, dans le fuseau d'affichage. */
  ajoute: string;
}

interface Props {
  appareils: Appareil[];
  /** Un retrait n'est possible que si un autre appareil peut prouver le code. */
  peutRetirer: boolean;
}

function Ligne({ appareil, peutRetirer }: { appareil: Appareil; peutRetirer: boolean }) {
  const routeur = useRouter();
  const id = useId();
  const [enCours, setEnCours] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const retirer = useCallback(
    async (evenement: FormEvent<HTMLFormElement>) => {
      evenement.preventDefault();
      setEnCours(true);
      setMessage(null);
      try {
        const formulaire = new FormData(evenement.currentTarget);
        formulaire.set("factorId", appareil.id);
        const issue = appareil.verifie
          ? await retirerAppareil(formulaire)
          : await abandonnerEnrolement(formulaire);
        setMessage(issue.ok ? null : issue.global);
        if (issue.ok) routeur.refresh();
      } catch {
        setMessage("Opération impossible pour le moment.");
      } finally {
        setEnCours(false);
      }
    },
    [appareil.id, appareil.verifie, routeur],
  );

  return (
    <li className="flex flex-col gap-3 rounded-[18px] bg-bg-page px-4 py-4 shadow-inset-field">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="font-display text-[15px] font-extrabold text-text-title">
          {appareil.nom}
        </p>
        <p className="font-text text-xs text-text-muted">
          {appareil.verifie ? `Ajouté le ${appareil.ajoute}` : "En attente de validation"}
        </p>
      </div>

      {appareil.verifie ? (
        peutRetirer ? (
          <details className="group font-text text-xs text-text-body">
            <summary className="cursor-pointer select-none underline underline-offset-4 hover:text-text-title focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-text-title">
              Retirer cet appareil
            </summary>
            <form onSubmit={retirer} className="mt-3 flex flex-col gap-3">
              <label htmlFor={`${id}-preuve`} className="font-text text-xs font-semibold text-text-title">
                Code de l&apos;AUTRE appareil
              </label>
              <input
                id={`${id}-preuve`}
                name="code"
                type="text"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                required
                autoComplete="off"
                className={`${CHAMP_MFA} tracking-[0.3em] text-center font-semibold`}
              />
              <button
                type="submit"
                disabled={enCours}
                className="h-11 rounded-[14px] border border-error/30 bg-white font-display text-sm font-extrabold text-error transition-colors duration-200 hover:bg-bg-card-end focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-text-title disabled:opacity-60"
              >
                {enCours ? "Traitement…" : "Confirmer le retrait"}
              </button>
            </form>
          </details>
        ) : (
          <p className="font-text text-xs leading-relaxed text-text-muted">
            Enregistrez un second appareil avant de pouvoir retirer celui-ci : le
            compte doit toujours pouvoir prouver un code.
          </p>
        )
      ) : (
        <form onSubmit={retirer} className="flex items-center gap-3">
          <button
            type="submit"
            disabled={enCours}
            className="h-11 rounded-[14px] border border-text-muted/30 bg-white px-4 font-display text-sm font-extrabold text-text-body transition-colors duration-200 hover:bg-bg-card-end focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-text-title disabled:opacity-60"
          >
            {enCours ? "Traitement…" : "Annuler l'attente"}
          </button>
        </form>
      )}

      {message ? (
        <p role="alert" className="font-text text-xs text-error">
          {message}
        </p>
      ) : null}
    </li>
  );
}

export function MfaAppareils({ appareils, peutRetirer }: Props) {
  const routeur = useRouter();
  const [enCours, setEnCours] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const deconnecterDe = useCallback(
    async (evenement: FormEvent<HTMLFormElement>) => {
      evenement.preventDefault();
      setEnCours(true);
      setMessage(null);
      try {
        const issue: ResultatMfa = await deconnecter(new FormData(evenement.currentTarget));
        setMessage(issue.global);
        if (issue.ok && issue.suite) {
          routeur.push(issue.suite);
          routeur.refresh();
          return;
        }
      } catch {
        setMessage("Déconnexion impossible pour le moment.");
      } finally {
        setEnCours(false);
      }
    },
    [routeur],
  );

  return (
    <div className="flex flex-col gap-6">
      <ul className="flex flex-col gap-3">
        {appareils.map((appareil) => (
          <Ligne key={appareil.id} appareil={appareil} peutRetirer={peutRetirer} />
        ))}
      </ul>

      <div className="flex flex-col gap-3 rounded-[18px] border border-text-muted/20 px-4 py-4">
        <p className="font-display text-[15px] font-extrabold text-text-title">
          Sortir des sessions
        </p>
        <p className="font-text text-xs leading-relaxed text-text-muted">
          La déconnexion globale révoque les jetons de tous les navigateurs, y
          compris celui-ci. Elle exige de nouveau le mot de passe et un code.
        </p>
        <form onSubmit={deconnecterDe} className="flex flex-col gap-3">
          <input type="hidden" name="portee" value="global" />
          <input type="hidden" name="confirmation" value="oui" />
          <button
            type="submit"
            disabled={enCours}
            className="h-11 rounded-[14px] bg-accent font-display text-sm font-extrabold text-white transition-colors duration-200 hover:bg-accent-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-text-title disabled:opacity-60"
          >
            {enCours ? "Traitement…" : "Me déconnecter de tous les appareils"}
          </button>
        </form>
        {message ? (
          <p role="alert" className="font-text text-xs text-error">
            {message}
          </p>
        ) : null}
      </div>
    </div>
  );
}
