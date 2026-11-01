import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { creerClientSupabase } from "@/lib/supabase/server";
import { creerClientAdmin } from "@/lib/supabase/admin";
import { sessionAdmin } from "@/lib/security/guard";
import { AdminShell } from "@/components/admin/AdminShell";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Tableau de bord — Administration KoniG.dev",
};

function carte(titre: string, valeur: string | number, sous?: string) {
  return (
    <div className="rounded-[20px] border border-white/80 bg-gradient-to-br from-bg-card-start to-bg-card-end p-6 shadow-contact-card">
      <p className="font-text text-xs font-semibold uppercase tracking-[0.14em] text-text-muted">
        {titre}
      </p>
      <p className="mt-1 font-display text-3xl font-extrabold text-text-title">{valeur}</p>
      {sous ? <p className="mt-1 font-text text-xs text-text-muted">{sous}</p> : null}
    </div>
  );
}

export default async function PageAdmin() {
  const supabase = creerClientSupabase();
  const session = await sessionAdmin(supabase);
  if (!session) redirect("/admin/login");

  const admin = creerClientAdmin();

  // --- Compteurs parallèles ---
  const [
    { count: totalMessages },
    { count: nonLus },
    { count: visites7j },
    { count: visitesTotal },
    { count: projetsPublies },
    { data: derniersMessages },
    { data: derniersLogs },
  ] = await Promise.all([
    admin.from("messages").select("*", { count: "exact", head: true }),
    admin.from("messages").select("*", { count: "exact", head: true }).eq("lu", false),
    admin.from("visits").select("*", { count: "exact", head: true })
      .gte("created_at", new Date(Date.now() - 7 * 86400_000).toISOString())
      .eq("est_bot", false),
    admin.from("visits").select("*", { count: "exact", head: true }).eq("est_bot", false),
    admin.from("projects").select("*", { count: "exact", head: true }).eq("publie", true),
    admin.from("messages").select("id,created_at,nom,projet,lu").order("created_at", { ascending: false }).limit(5),
    admin.from("admin_logs").select("id,created_at,action,reussite").order("created_at", { ascending: false }).limit(8),
  ]);

  const fmt = new Intl.DateTimeFormat("fr-FR", { dateStyle: "short", timeStyle: "short" });

  return (
    <AdminShell email={session.email} nonLus={nonLus ?? 0}>
      <div className="px-6 py-8 lg:px-10 lg:py-10">
        <h1 className="font-display text-2xl font-extrabold text-text-title lg:text-3xl">
          Tableau de bord
        </h1>
        <p className="mt-1 font-text text-sm text-text-muted">
          Vue d&apos;ensemble en temps réel.
        </p>

        {/* KPIs */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {carte("Messages reçus", totalMessages ?? 0)}
          {carte("Non lus", nonLus ?? 0, "à traiter")}
          {carte("Visites (7 j)", visites7j ?? 0, "hors bots")}
          {carte("Projets publiés", projetsPublies ?? 0)}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {/* Derniers messages */}
          <section>
            <div className="mb-4 flex items-baseline justify-between">
              <h2 className="font-display text-base font-extrabold text-text-title">
                Derniers messages
              </h2>
              <a href="/admin/messages" className="font-text text-xs text-text-muted underline underline-offset-4 hover:text-text-title">
                Voir tout
              </a>
            </div>
            <div className="rounded-[20px] border border-white/80 bg-gradient-to-br from-bg-card-start to-bg-card-end shadow-contact-card overflow-hidden">
              {derniersMessages && derniersMessages.length > 0 ? (
                <ul className="divide-y divide-white/60">
                  {derniersMessages.map((m) => (
                    <li key={m.id}>
                      <a
                        href={`/admin/messages?id=${m.id}`}
                        className="flex items-start gap-3 px-5 py-4 transition-colors hover:bg-accent/4"
                      >
                        <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${m.lu ? "bg-transparent border border-text-muted/40" : "bg-accent"}`} aria-label={m.lu ? "Lu" : "Non lu"} />
                        <div className="min-w-0 flex-1">
                          <p className={`font-text text-sm ${m.lu ? "text-text-body" : "font-semibold text-text-title"}`}>
                            {m.nom}
                          </p>
                          <p className="truncate font-text text-xs text-text-muted">{m.projet}</p>
                        </div>
                        <time className="shrink-0 font-text text-[11px] text-text-muted">
                          {fmt.format(new Date(m.created_at))}
                        </time>
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="px-5 py-8 text-center font-text text-sm text-text-muted">
                  Aucun message pour l&apos;instant.
                </p>
              )}
            </div>
          </section>

          {/* Journal de sécurité */}
          <section>
            <div className="mb-4 flex items-baseline justify-between">
              <h2 className="font-display text-base font-extrabold text-text-title">
                Journal récent
              </h2>
              <a href="/admin/securite" className="font-text text-xs text-text-muted underline underline-offset-4 hover:text-text-title">
                Voir tout
              </a>
            </div>
            <div className="rounded-[20px] border border-white/80 bg-gradient-to-br from-bg-card-start to-bg-card-end shadow-contact-card overflow-hidden">
              {derniersLogs && derniersLogs.length > 0 ? (
                <ul className="divide-y divide-white/60">
                  {derniersLogs.map((l) => (
                    <li key={l.id} className="flex items-center gap-3 px-5 py-3">
                      <span
                        className={`h-1.5 w-1.5 shrink-0 rounded-full ${l.reussite ? "bg-accent" : "bg-error"}`}
                        aria-label={l.reussite ? "Succès" : "Échec"}
                      />
                      <p className="flex-1 font-mono text-xs text-text-body">{l.action}</p>
                      <time className="shrink-0 font-text text-[11px] text-text-muted">
                        {fmt.format(new Date(l.created_at))}
                      </time>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="px-5 py-8 text-center font-text text-sm text-text-muted">
                  Aucun événement.
                </p>
              )}
            </div>
          </section>
        </div>

        {/* Lien stats complètes */}
        <p className="mt-6 font-text text-xs text-text-muted">
          Total visites enregistrées (hors bots) : <strong>{visitesTotal ?? 0}</strong>.{" "}
          <a href="/admin/visites" className="underline underline-offset-4 hover:text-text-title">
            Voir les statistiques complètes
          </a>
        </p>
      </div>
    </AdminShell>
  );
}

