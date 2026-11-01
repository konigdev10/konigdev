/**
 * Widget Cloudflare Turnstile.
 *
 * Chargé uniquement quand les deux clés sont définies. Le script vient de
 * challenges.cloudflare.com, origine que la Content-Security-Policy n'autorise
 * que lorsque turnstileSiteKey existe (voir middleware.ts) : sans configuration,
 * rien de Cloudflare ne peut se charger.
 *
 * Le jeton obtenu est remis au formulaire parent ; c'est le serveur qui le
 * vérifie, jamais le navigateur.
 */

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Script from "next/script";

interface OptionsWidget {
  sitekey: string;
  theme?: "light" | "dark" | "auto";
  size?: "normal" | "flexible" | "compact";
  callback?: (jeton: string) => void;
  "error-callback"?: () => void;
  "expired-callback"?: () => void;
}

interface TurnstileGlobal {
  render(cible: HTMLElement, options: OptionsWidget): string;
  remove(identifiant: string): void;
}

declare global {
  interface Window {
    turnstile?: TurnstileGlobal;
  }
}

const URL_API = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

export function Turnstile({
  siteKey,
  surJeton,
}: {
  siteKey: string;
  surJeton: (jeton: string) => void;
}) {
  const conteneur = useRef<HTMLDivElement | null>(null);
  const identifiant = useRef<string | null>(null);
  const [etat, setEtat] = useState<"en_attente" | "pret" | "erreur">("en_attente");

  const monter = useCallback(() => {
    const objet = window.turnstile;
    const cible = conteneur.current;
    if (!objet || !cible || identifiant.current !== null) return;

    identifiant.current = objet.render(cible, {
      sitekey: siteKey,
      theme: "light",
      size: "flexible",
      callback: (jeton: string) => {
        surJeton(jeton);
        setEtat("pret");
      },
      "error-callback": () => setEtat("erreur"),
      "expired-callback": () => {
        surJeton("");
        setEtat("en_attente");
      },
    });
  }, [siteKey, surJeton]);

  // Le script peut déjà être chargé (navigation interne) : on retente.
  useEffect(() => {
    monter();
    return () => {
      if (identifiant.current !== null) {
        window.turnstile?.remove(identifiant.current);
        identifiant.current = null;
      }
    };
  }, [monter]);

  return (
    <div className="flex flex-col gap-2">
      <Script src={URL_API} strategy="afterInteractive" onLoad={monter} />
      <div
        ref={conteneur}
        className="min-h-[65px] rounded-[14px] bg-bg-card-start shadow-inset-field"
      />
      {etat === "erreur" ? (
        <p className="font-text text-xs text-error" role="alert">
          Vérification humaine impossible. Rechargez la page.
        </p>
      ) : null}
      {etat === "en_attente" ? (
        <p className="font-text text-xs text-text-muted">
          Décochez la case de vérification avant d&apos;envoyer.
        </p>
      ) : null}
    </div>
  );
}
