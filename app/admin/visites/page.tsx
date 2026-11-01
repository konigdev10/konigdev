import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { creerClientSupabase } from "@/lib/supabase/server";
import { creerClientAdmin } from "@/lib/supabase/admin";
import { sessionAdmin } from "@/lib/security/guard";
import { AdminShell } from "@/components/admin/AdminShell";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Visites — Administration KoniG.dev",
};

function StatBar({ label, valeur, max }: { label: string; valeur: number; max: number }) {
  const pct = max > 0 ? Math.round((valeur / max) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <p className="w-32 shrink-0 truncate font-text text-xs text-text-body">{label}</p>
      <div className="flex-1 rounded-full bg-bg-page shadow-inset-field h-2 overflow-hidden">
        <div className="h-2 rounded-full bg-accent transition-all" style={{ width: `${pct}%` }} />
      </div>
      <p className="w-8 text-right font-text text-xs font-semibold text-text-title">{valeur}</p>
    </div>
  );
}

export default async function PageVisites() {
  const supabase = creerClientSupabase();
  const session = await sessionAdmin(supabase);
  if (!session) redirect("/admin/login");

  const admin = creerClientAdmin();

  const maintenant = Date.now();
  const il_y_a_7j = new Date(maintenant - 7 * 86400_000).toISOString();
  const il_y_a_30j = new Date(maintenant - 30 * 86400_000).toISOString();

  const [
    { count: total },
    { count: v7j },
    { count: v30j },
    { count: bots },
    ,
    { data: parAppareil },
    { data: parPays },
    { data: parNavigateur },
    { count: nonLus },
  ] = await Promise.all([
    admin.from("visits").select("*", { count: "exact", head: true }).eq("est_bot", false),
    admin.from("visits").select("*", { count: "exact", head: true }).eq("est_bot", false).gte("created_at", il_y_a_7j),
    admin.from("visits").select("*", { count: "exact", head: true }).eq("est_bot", false).gte("created_at", il_y_a_30j),
    admin.from("visits").select("*", { count: "exact", head: true }).eq("est_bot", true),
    // Stats par page (non utilisé, slot réservé)
    Promise.resolve({ data: null }),
    admin.from("visits").select("device_type").eq("est_bot", false),
    admin.from("visits").select("pays").eq("est_bot", false).not("pays", "is", null),
    admin.from("visits").select("navigateur").eq("est_bot", false).not("navigateur", "is", null),
    admin.from("messages").select("*", { count: "exact", head: true }).eq("lu", false),
  ]);

  // Agrégations côté serveur
  function compter<T extends string>(liste: { [k: string]: T | null }[] | null, cle: string): [string, number][] {
    if (!liste) return [];
    const acc: Record<string, number> = {};
    for (const row of liste) {
      const val = (row as Record<string, unknown>)[cle];
      if (typeof val === "string" && val) acc[val] = (acc[val] ?? 0) + 1;
    }
    return Object.entries(acc).sort((a, b) => b[1] - a[1]).slice(0, 8);
  }

  const statsAppareil = compter(parAppareil ?? [], "device_type");
  const statsPays = compter(parPays ?? [], "pays");
  const statsNav = compter(parNavigateur ?? [], "navigateur");

  const maxAppareil = statsAppareil[0]?.[1] ?? 1;
  const maxPays = statsPays[0]?.[1] ?? 1;
  const maxNav = statsNav[0]?.[1] ?? 1;

  return (
    <AdminShell email={session.email} nonLus={nonLus ?? 0}>
      <div className="px-6 py-8 lg:px-10 lg:py-10">
        <h1 className="font-display text-2xl font-extrabold text-text-title lg:text-3xl">
          Visites
        </h1>
        <p className="mt-1 font-text text-sm text-text-muted">Statistiques d&apos;audience, hors bots.</p>

        {/* KPIs */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {(
            [
              ["Total", total ?? 0, "visites enregistrées"],
              ["7 derniers jours", v7j ?? 0],
              ["30 derniers jours", v30j ?? 0],
              ["Bots filtrés", bots ?? 0, "exclus des stats"],
            ] as [string, number, string?][]
          ).map(([titre, val, sous]) => (
            <div key={titre} className="rounded-[20px] border border-white/80 bg-gradient-to-br from-bg-card-start to-bg-card-end p-6 shadow-contact-card">
              <p className="font-text text-xs font-semibold uppercase tracking-[0.14em] text-text-muted">{titre}</p>
              <p className="mt-1 font-display text-3xl font-extrabold text-text-title">{val}</p>
              {sous ? <p className="mt-1 font-text text-xs text-text-muted">{sous}</p> : null}
            </div>
          ))}
        </div>

        {/* Graphiques */}
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {/* Appareils */}
          <section className="rounded-[20px] border border-white/80 bg-gradient-to-br from-bg-card-start to-bg-card-end p-6 shadow-contact-card">
            <h2 className="mb-4 font-display text-sm font-extrabold text-text-title">Appareils</h2>
            {statsAppareil.length > 0 ? (
              <div className="space-y-3">
                {statsAppareil.map(([label, val]) => (
                  <StatBar key={label} label={label} valeur={val} max={maxAppareil} />
                ))}
              </div>
            ) : (
              <p className="font-text text-sm text-text-muted">Pas encore de données.</p>
            )}
          </section>

          {/* Pays */}
          <section className="rounded-[20px] border border-white/80 bg-gradient-to-br from-bg-card-start to-bg-card-end p-6 shadow-contact-card">
            <h2 className="mb-4 font-display text-sm font-extrabold text-text-title">Pays</h2>
            {statsPays.length > 0 ? (
              <div className="space-y-3">
                {statsPays.map(([label, val]) => (
                  <StatBar key={label} label={label} valeur={val} max={maxPays} />
                ))}
              </div>
            ) : (
              <p className="font-text text-sm text-text-muted">Pas encore de données.</p>
            )}
          </section>

          {/* Navigateurs */}
          <section className="rounded-[20px] border border-white/80 bg-gradient-to-br from-bg-card-start to-bg-card-end p-6 shadow-contact-card">
            <h2 className="mb-4 font-display text-sm font-extrabold text-text-title">Navigateurs</h2>
            {statsNav.length > 0 ? (
              <div className="space-y-3">
                {statsNav.map(([label, val]) => (
                  <StatBar key={label} label={label} valeur={val} max={maxNav} />
                ))}
              </div>
            ) : (
              <p className="font-text text-sm text-text-muted">Pas encore de données.</p>
            )}
          </section>
        </div>

        <p className="mt-6 font-text text-xs text-text-muted">
          Les adresses IP ne sont jamais stockées en clair. Seul un hash salé non inversable est conservé, 
          et les données sont purgées automatiquement après 365 jours.
        </p>
      </div>
    </AdminShell>
  );
}
