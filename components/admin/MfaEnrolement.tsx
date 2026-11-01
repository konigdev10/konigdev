"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";

import {
  abandonnerEnrolement,
  enregistrerAppareil,
  type ResultatEnrolement,
} from "@/app/admin/mfa/actions";
import { MfaForm } from "./MfaForm";
import { QrCode } from "./QrCode";

interface Props {
  /** Nombre d'appareils déjà comptés : sert au texte, jamais à une décision. */
  dejaEnregistres: number;
  max: number;
}

/**
 * Enrôlement d'un appareil : le serveur crée un facteur en attente, on affiche
 * le QR et le secret, et le premier code valide le tout.
 *
 * Le QR n'est généré qu'au clic : recharger la page ne crée pas un facteur
 * orphelin, ce qui saturerait la limite de deux appareils.
 */
export function MfaEnrolement({ dejaEnregistres, max }: Props) {
  const routeur = useRouter();
  const [enCours, setEnCours] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [enrolement, setEnrolement] = useState<ResultatEnrolement | null>(null);

  const demarrer = useCallback(async () => {
    setEnCours(true);
    setMessage(null);
    try {
      const issue = await enregistrerAppareil();
      if (!issue.ok) {
        setMessage(issue.global);
      } else {
        setEnrolement(issue);
      }
    } catch {
      setMessage("Enregistrement impossible pour le moment.");
    } finally {
      setEnCours(false);
    }
  }, []);

  const annuler = useCallback(async () => {
    if (enrolement?.facteur) {
      const formulaire = new FormData();
      formulaire.set("factorId", enrolement.facteur);
      await abandonnerEnrolement(formulaire).catch(() => null);
    }
    setEnrolement(null);
    routeur.refresh();
  }, [enrolement?.facteur, routeur]);

  if (!enrolement?.facteur || !enrolement.uri || !enrolement.secret) {
    return (
      <div className="flex flex-col gap-4">
        <p className="font-text text-sm leading-relaxed text-text-body">
          {dejaEnregistres === 0
            ? "Aucun appareil n'est encore enregistré. Le second facteur est obligatoire : sans lui, l'administration reste fermée."
            : `Un appareil peut être ajouté (${dejaEnregistres} sur ${max} utilisés).`}
        </p>

        <button
          type="button"
          onClick={demarrer}
          disabled={enCours || dejaEnregistres >= max}
          className="h-[52px] rounded-[16px] bg-accent font-display text-[15px] font-extrabold text-white shadow-btn-submit transition-colors duration-200 hover:bg-accent-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-text-title disabled:opacity-60"
        >
          {enCours ? "Préparation…" : "Afficher le code QR"}
        </button>

        {message ? (
          <p
            role="alert"
            className="rounded-[14px] bg-bg-page px-4 py-3 font-text text-sm text-error shadow-inset-field"
          >
            {message}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <ol className="flex flex-col gap-2 font-text text-sm leading-relaxed text-text-body">
        <li>1. Dans votre application d&apos;authentification, choisissez « Ajouter un compte » puis « Saisir une clé ».</li>
        <li>2. Scannez le code ci-dessous, ou recopiez la clé.</li>
        <li>3. Saisissez aussitôt le code à 6 chiffres : l&apos;appareil reste en attente tant que le code n&apos;a pas été vérifié.</li>
      </ol>

      <div className="flex justify-center rounded-[18px] bg-white p-4 shadow-inset-field">
        <QrCode uri={enrolement.uri} legende="Code QR de l'appareil à enregistrer" />
      </div>

      <div className="flex flex-col gap-2">
        <label
          htmlFor="secret-mfa"
          className="font-text text-xs font-semibold tracking-wide text-text-title"
        >
          Clé manuelle
        </label>
        <input
          id="secret-mfa"
          readOnly
          value={enrolement.secret}
          onFocus={(evenement) => evenement.currentTarget.select()}
          className="w-full rounded-[14px] bg-bg-page px-4 py-3 font-mono text-sm uppercase tracking-[0.18em] text-text-title shadow-inset-field focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-text-title"
        />
        <p className="font-text text-xs leading-relaxed text-text-muted">
          Cette clé n&apos;est affichée qu&apos;une fois : le serveur ne la
          renvoie plus ensuite. Elle reste dans cette page jusqu&apos;à la
          validation ou l&apos;annulation.
        </p>
      </div>

      <MfaForm
        facteurs={[{ id: enrolement.facteur, nom: "Nouvel appareil" }]}
        libelle="Valider l'appareil"
        surTermine={() => routeur.refresh()}
      />

      <button
        type="button"
        onClick={annuler}
        className="self-start font-text text-xs text-text-muted underline underline-offset-4 hover:text-text-title focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-text-title"
      >
        Annuler cet enregistrement
      </button>
    </div>
  );
}
