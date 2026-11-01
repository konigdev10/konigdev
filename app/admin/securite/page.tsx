import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { creerClientSupabase } from "@/lib/supabase/server";
import { creerClientAdmin } from "@/lib/supabase/admin";
import { sessionAdmin } from "@/lib/security/guard";
import { AdminShell } from "@/components/admin/AdminShell";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sécurité — Administration KoniG.dev",
};

const fmt = new Intl.DateTimeFormat("fr-FR", { dateStyle: "short", timeStyle: "medium" });

const LIBELLES: Record<string, string> = {
  connexion_reussie: "Connexion réussie",
  connexion_echouee: "Connexion échouée",
  mfa_reussie: "MFA validée",
  mfa_echec: "MFA échouée",
  deconnexion: "Déconnexion",
  message_lu: "Message marqué lu",
  message_non_lu: "Message marqué non lu",
  message_supprime: "Message supprimé",
  projet_cree: "Projet créé",
  projet_modifie: "Projet modifié",
  projet_supprime: "Projet supprimé",
};

export default async function PageSecurite() {
  const supabase = creerClientSupabase();
  const session = await sessionAdmin(supabase);
  if (!session) redirect("/admin/login");

  const admin = creerClientAdmin();

  const [
    { data: logs },
    { data: tentatives },
    { count: nonLus },
    { count: echecs7j },
  ] = await Promise.all([
    admin.from("admin_logs").select("*").order("created_at", { ascending: false }).limit(50),
    admin
      .from("login_attempts")
      .select("ip_hash,created_at,reussite")
      .order("created_at", { ascending: false })
      .limit(20),
    admin.from("messages").select("*", { count: "exact", head: true }).eq("lu", false),
    admin
      .from("login_attempts")
      .select("*", { count: "exact", head: true })
      .eq("reussite", false)
      .gte("created_at", new Date(Date.now() - 7 * 86400_000).toISOString()),
  ]);

  return (
    <AdminShell email={session.email} nonLus={nonLus ?? 0}>
      <div className="px-6 py-8 lg:px-10 lg:py-10">
        <h1 className="font-display text-2xl font-extrabold text-text-title lg:text-3xl">
          Sécurité
        </h1>
        <p className="mt-1 font-text text-sm text-text-muted">
          Journal d&apos;audit et tentatives de connexion.
        </p>

        {/* KPI */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-[20px] border border-white/80 bg-gradient-to-br from-bg-card-start to-bg-card-end p-6 shadow-contact-card">
            <p className="font-text text-xs font-semibold uppercase tracking-[0.14em] text-text-muted">Échecs de connexion (7 j)</p>
            <p className={`mt-1 font-display text-3xl font-extrabold ${(echecs7j ?? 0) >= 5 ? "text-error" : "text-text-title"}`}>
              {echecs7j ?? 0}
            </p>
          </div>
          <div className="rounded-[20px] border border-white/80 bg-gradient-to-br from-bg-card-start to-bg-card-end p-6 shadow-contact-card">
            <p className="font-text text-xs font-semibold uppercase tracking-[0.14em] text-text-muted">Événements journalisés</p>
            <p className="mt-1 font-display text-3xl font-extrabold text-text-title">{logs?.length ?? 0}</p>
            <p className="mt-1 font-text text-xs text-text-muted">(50 derniers affichés)</p>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {/* Journal d'audit */}
          <section>
            <h2 className="mb-4 font-display text-base font-extrabold text-text-title">Journal d&apos;audit</h2>
            <div className="rounded-[20px] border border-white/80 bg-gradient-to-br from-bg-card-start to-bg-card-end shadow-contact-card overflow-hidden">
              {logs && logs.length > 0 ? (
                <ul className="divide-y divide-white/60 max-h-[500px] overflow-y-auto">
                  {logs.map((l) => (
                    <li key={l.id} className="flex items-start gap-3 px-5 py-3">
                      <span
                        className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${l.reussite ? "bg-accent" : "bg-error"}`}
                        aria-label={l.reussite ? "Succès" : "Échec"}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-text text-sm text-text-body">
                          {LIBELLES[l.action] ?? l.action}
                        </p>
                        {l.detail ? (
                          <p className="font-mono text-xs text-text-muted truncate">{l.detail}</p>
                        ) : null}
                      </div>
                      <time className="shrink-0 font-text text-[11px] text-text-muted">
                        {fmt.format(new Date(l.created_at))}
                      </time>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="px-5 py-8 text-center font-text text-sm text-text-muted">Aucun événement.</p>
              )}
            </div>
          </section>

          {/* Tentatives de connexion */}
          <section>
            <h2 className="mb-4 font-display text-base font-extrabold text-text-title">Tentatives de connexion</h2>
            <div className="rounded-[20px] border border-white/80 bg-gradient-to-br from-bg-card-start to-bg-card-end shadow-contact-card overflow-hidden">
              {tentatives && tentatives.length > 0 ? (
                <ul className="divide-y divide-white/60 max-h-[500px] overflow-y-auto">
                  {tentatives.map((t) => (
                    <li key={`${t.ip_hash}-${t.created_at}`} className="flex items-center gap-3 px-5 py-3">
                      <span
                        className={`h-2 w-2 shrink-0 rounded-full ${t.reussite ? "bg-accent" : "bg-error"}`}
                        aria-label={t.reussite ? "Réussie" : "Échouée"}
                      />
                      <div className="flex-1">
                        <p className="font-mono text-xs text-text-muted">
                          {/* Afficher uniquement les 8 premiers caractères du hash */}
                          IP #{t.ip_hash.slice(0, 8)}…
                        </p>
                      </div>
                      <p className={`font-text text-xs font-semibold ${t.reussite ? "text-accent" : "text-error"}`}>
                        {t.reussite ? "Réussie" : "Échouée"}
                      </p>
                      <time className="shrink-0 font-text text-[11px] text-text-muted">
                        {fmt.format(new Date(t.created_at))}
                      </time>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="px-5 py-8 text-center font-text text-sm text-text-muted">Aucune tentative.</p>
              )}
            </div>
          </section>
        </div>

        <p className="mt-6 font-text text-xs text-text-muted">
          Les empreintes IP sont des hash SHA-256 salés non inversables. Aucune IP réelle n&apos;est stockée.
        </p>
      </div>
    </AdminShell>
  );
}

