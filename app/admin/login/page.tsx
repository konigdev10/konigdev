import type { Metadata } from "next";
import { getPublicEnv, getServerEnv } from "@/lib/env";
import { ConnexionForm } from "@/components/admin/ConnexionForm";

/**
 * Page de connexion.
 *
 * Elle n'affiche que du texte blanc ou gris charbon, jamais une donnée venue de
 * l'extérieur. Les seuls messages dynamiques sont le motif de renvoi — et il
 * est choisi dans une liste fermée : une valeur « raison » forgée dans l'URL
 * ne peut rien injecter.
 */

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Connexion — Administration KoniG.dev",
  description: "Accès réservé à l'administrateur de ce portfolio.",
  robots: { index: false, follow: false, noarchive: true },
};

/** Motifs envoyés par middleware.ts via ?raison=. */
const AVIS: Record<string, string> = {
  inactive: "Session terminée : aucune activité depuis 30 minutes.",
  expiree: "Session terminée : une session dure au maximum 8 heures.",
  mfa: "Second facteur requis pour ouvrir l'administration.",
  config:
    "Administration indisponible : la configuration du serveur est incomplète.",
};

export default function PageConnexion({
  searchParams,
}: {
  searchParams: { raison?: string };
}) {
  const raison = typeof searchParams.raison === "string" ? searchParams.raison : "";
  const avis = Object.prototype.hasOwnProperty.call(AVIS, raison)
    ? (AVIS[raison] as string)
    : null;

  // Le widget n'apparaît que si les deux clés existent : une seule ne sert à rien.
  let siteKeyTurnstile: string | null = null;
  try {
    const { turnstileSiteKey } = getPublicEnv();
    const { turnstileSecretKey } = getServerEnv();
    if (turnstileSiteKey && turnstileSecretKey) siteKeyTurnstile = turnstileSiteKey;
  } catch {
    siteKeyTurnstile = null;
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-12">
      <div className="w-full max-w-[440px]">
        <div className="mb-8">
          <p className="font-text text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">
            KoniG.dev
          </p>
          <h1
            id="connexion-titre"
            className="mt-2 font-display text-[30px] font-extrabold leading-[1.1] tracking-tight text-text-title"
          >
            Administration
          </h1>
        </div>

        <div className="rounded-[28px] border border-white/95 bg-gradient-to-br from-bg-card-start to-bg-card-end p-7 shadow-contact-card sm:p-9">
          <p className="mb-7 font-text text-sm leading-relaxed text-text-body">
            Espace privé. Il n&apos;est accessible qu&apos;avec le compte
            administrateur, son mot de passe et un code à 6 chiffres généré par
            une application d&apos;authentification.
          </p>
          <ConnexionForm
            siteKeyTurnstile={siteKeyTurnstile}
            avis={avis}
          />
        </div>

        <p className="mt-6 text-center font-text text-xs text-text-muted">
          <a
            href="/"
            className="underline underline-offset-4 hover:text-text-title focus-visible:outline focus-visible:outline-2 focus-visible:outline-text-title focus-visible:outline-offset-2"
          >
            Retour au portfolio
          </a>
        </p>
      </div>
    </main>
  );
}
