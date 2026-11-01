import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { creerClientSupabase } from "@/lib/supabase/server";
import { sessionMfa } from "@/lib/security/guard";
import { afficherJour } from "@/lib/affichage";
import { MAX_APPAREILS } from "@/lib/security/mfa";
import { MfaForm } from "@/components/admin/MfaForm";
import { MfaEnrolement } from "@/components/admin/MfaEnrolement";
import { MfaAppareils, type Appareil } from "@/components/admin/MfaAppareils";

/**
 * Second facteur.
 *
 * Deux états, un seul écran :
 *  - session au niveau aal1 (mot de passe validé, mot de passe encore récent) :
 *    c'est la porte. On saisit le code d'un appareil enregistré, ou l'on en
 *    enregistre un premier. Tant que le code n'a pas passé, aucune donnée de
 *    l'administration n'est lisible ;
 *  - session aal2 complète : c'est la gestion des appareils — en ajouter un
 *    second, en retirer un, se déconnecter de partout.
 *
 * Aucun code de secours, aucun contournement : la limite de deux appareils est
 * ce qui rend la perte d'un téléphone gérable sans ouvrir de porte dérobée.
 * La page n'affiche jamais un secret d'un autre compte : le titulaire a été
 * comparé à ADMIN_USER_ID par lib/security/guard.ts avant tout rendu.
 */

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Second facteur — Administration KoniG.dev",
  robots: { index: false, follow: false, noarchive: true },
};

const CARTE =
  "rounded-[28px] border border-white/95 bg-gradient-to-br from-bg-card-start to-bg-card-end p-7 shadow-contact-card sm:p-9";

export default async function PageMfa() {
  const supabase = creerClientSupabase();
  const etat = await sessionMfa(supabase);

  // aal1 sans mot de passe récent, ou session d'un autre compte : la connexion
  // reprend depuis le début. Une session aal2, elle, reste sur cet écran :
  // c'est ici que l'on ajoute ou retire un appareil.
  if (etat === null) redirect("/admin/login?raison=connexion");

  const { data: facteurs, error } = await supabase.auth.mfa.listFactors();

  return (
    <main className="flex min-h-screen flex-col items-center px-5 py-12">
      <div className="w-full max-w-[520px]">
        <header className="mb-8">
          <p className="font-text text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">
            KoniG.dev
          </p>
          <h1
            id="mfa-titre"
            className="mt-2 font-display text-[30px] font-extrabold leading-[1.1] tracking-tight text-text-title"
          >
            Vérification en deux temps
          </h1>
          <p className="mt-3 font-text text-sm leading-relaxed text-text-body">
            Le mot de passe seul ne suffit pas. Un code de six chiffres généré
            par une application d&apos;authentification est obligatoire pour
            ouvrir l&apos;administration.
          </p>
        </header>

        {error || !facteurs ? (
          <section className={CARTE} aria-labelledby="mfa-titre">
            <p className="font-text text-sm leading-relaxed text-error">
              Les appareils enregistrés sont injoignables pour l&apos;instant.
              Réessayez dans quelques instants.
            </p>
          </section>
        ) : (
          <div className="flex flex-col gap-6">
            {etat === "initiale" ? (
              <Porte facteurs={facteurs.all} />
            ) : (
              <Terme />
            )}
            <Ajout facteurs={facteurs.all} montre={etat === "complete"} />
            <Appareils facteurs={facteurs.all} complet={etat === "complete"} />
          </div>
        )}

        <p className="mt-8 text-center font-text text-xs text-text-muted">
          <a
            href="/admin/login"
            className="underline underline-offset-4 hover:text-text-title focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-text-title"
          >
            Revenir à la connexion
          </a>
        </p>
      </div>
    </main>
  );
}

// ---------------------------------------------------------------------------
// Morceaux rendus côté serveur
// ---------------------------------------------------------------------------

interface FacteurSimple {
  id: string;
  friendly_name?: string | undefined;
  status: string;
  created_at: string;
}

function porte(facteurs: FacteurSimple[]) {
  const verifies = facteurs.filter((facteur) => facteur.status === "verified");
  return {
    verifies,
    total: facteurs.length,
    noms: verifies.map((facteur, index) => ({
      id: facteur.id,
      nom: facteur.friendly_name ?? `Appareil ${index + 1}`,
    })),
  };
}

/** La porte : code d'un appareil connu, ou premier enregistrement. */
function Porte({ facteurs }: { facteurs: FacteurSimple[] }) {
  const { verifies, total, noms } = porte(facteurs);

  return (
    <section className={CARTE} aria-labelledby="porte-titre">
      <h2
        id="porte-titre"
        className="mb-6 font-display text-[20px] font-extrabold tracking-tight text-text-title"
      >
        {verifies.length > 0 ? "Ouvrir l'administration" : "Enregistrer un appareil"}
      </h2>

      {verifies.length > 0 ? (
        <MfaForm facteurs={noms} libelle="Ouvrir l'administration" />
      ) : (
        <MfaEnrolement dejaEnregistres={total} max={MAX_APPAREILS} />
      )}
    </section>
  );
}

/** Bandeau d'une session déjà complète. */
function Terme() {
  return (
    <section className={CARTE} aria-labelledby="termee-titre">
      <h2
        id="termee-titre"
        className="mb-3 font-display text-[20px] font-extrabold tracking-tight text-text-title"
      >
        Second facteur validé
      </h2>
      <p className="mb-5 font-text text-sm leading-relaxed text-text-body">
        Cette session a passé les deux temps. Gérez ci-dessous les appareils
        autorisés, ou revenez à l&apos;administration.
      </p>
      <a
        href="/admin"
        className="inline-flex h-12 items-center rounded-[14px] bg-accent px-5 font-display text-sm font-extrabold text-white transition-colors duration-200 hover:bg-accent-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-text-title"
      >
        Retour au tableau de bord
      </a>
    </section>
  );
}

/**
 * Enrôlement, proposé seulement quand il ne fait pas doublon : à l&apos;aal1
 * sans appareil connu, c&apos;est la porte qui le propose déjà.
 */
function Ajout({ facteurs, montre }: { facteurs: FacteurSimple[]; montre: boolean }) {
  const { verifies, total } = porte(facteurs);
  if (!montre && verifies.length > 0) return null;

  return (
    <section className={CARTE} aria-labelledby="ajout-titre">
      <h2
        id="ajout-titre"
        className="mb-6 font-display text-[20px] font-extrabold tracking-tight text-text-title"
      >
        {verifies.length > 0 ? "Ajouter un appareil" : "Enregistrer un appareil"}
      </h2>
      <MfaEnrolement dejaEnregistres={total} max={MAX_APPAREILS} />
    </section>
  );
}

/** Inventaire des appareils, avec retrait et déconnexion globale. */
function Appareils({ facteurs, complet }: { facteurs: FacteurSimple[]; complet: boolean }) {
  const { verifies, total } = porte(facteurs);

  const appareils: Appareil[] = facteurs.map((facteur, index) => ({
    id: facteur.id,
    nom: facteur.friendly_name ?? `Appareil ${index + 1}`,
    verifie: facteur.status === "verified",
    ajoute: afficherJour(facteur.created_at),
  }));

  return (
    <section className={CARTE} aria-labelledby="appareils-titre">
      <div className="mb-6 flex items-baseline justify-between gap-4">
        <h2
          id="appareils-titre"
          className="font-display text-[20px] font-extrabold tracking-tight text-text-title"
        >
          Appareils enregistrés
        </h2>
        <p className="font-text text-xs text-text-muted">
          {total} sur {MAX_APPAREILS}
        </p>
      </div>

      {appareils.length === 0 ? (
        <p className="font-text text-sm leading-relaxed text-text-body">
          Aucun appareil. Terminez l&apos;enregistrement ci-dessus pour pouvoir
          entrer.
        </p>
      ) : (
        <MfaAppareils appareils={appareils} peutRetirer={complet && verifies.length >= 2} />
      )}
    </section>
  );
}
