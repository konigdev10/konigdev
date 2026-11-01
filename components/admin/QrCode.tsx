"use client";

import { useMemo } from "react";

import { encoderQR, type MatriceQR } from "@/lib/security/qr";

/**
 * Le QR de l'URI otpauth://, dessiné en SVG à partir de lib/security/qr.ts.
 *
 * Aucune librairie : une seule balise <path>, un rectangle par module noir.
 * Le module de silence de 4 est celui de la norme — sans lui, certains
 * lecteurs refusent l'image.
 */

const MARGE = 4;
const TAILLE_AFFICHEE = 216;

function chemin(matrice: MatriceQR): string {
  const morceaux: string[] = [];
  for (let ligne = 0; ligne < matrice.taille; ligne += 1) {
    for (let colonne = 0; colonne < matrice.taille; colonne += 1) {
      if (matrice.modules[ligne]![colonne]) {
        morceaux.push(`M${colonne + MARGE} ${ligne + MARGE}h1v1h-1z`);
      }
    }
  }
  return morceaux.join("");
}

export interface PropsQrCode {
  uri: string;
  /** Lu par les lecteurs d'écran : jamais le contenu du QR, qui est un secret. */
  legende: string;
}

export function QrCode({ uri, legende }: PropsQrCode) {
  const dessin = useMemo(() => {
    try {
      const matrice = encoderQR(uri);
      return { trace: chemin(matrice), cote: matrice.taille + MARGE * 2 };
    } catch {
      // URI trop longue pour nos versions supportées : la saisie manuelle du
      // secret reste disponible, l'écran ne doit pas planter.
      return null;
    }
  }, [uri]);

  if (dessin === null) {
    return (
      <p className="rounded-[14px] bg-bg-page px-4 py-3 font-text text-xs text-error shadow-inset-field">
        Ce secret est trop long pour être encodé. Saisissez-le à la main dans
        votre application.
      </p>
    );
  }

  const { trace, cote } = dessin;

  return (
    <svg
      viewBox={`0 0 ${cote} ${cote}`}
      width={TAILLE_AFFICHEE}
      height={TAILLE_AFFICHEE}
      role="img"
      aria-label={legende}
      shapeRendering="crispEdges"
      className="rounded-[14px] shadow-inset-field"
    >
      <rect width={cote} height={cote} fill="#FFFFFF" />
      <path d={trace} fill="#14161A" />
    </svg>
  );
}
