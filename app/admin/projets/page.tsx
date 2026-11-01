import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { creerClientSupabase } from "@/lib/supabase/server";
import { creerClientAdmin } from "@/lib/supabase/admin";
import { sessionAdmin } from "@/lib/security/guard";
import { AdminShell } from "@/components/admin/AdminShell";
import { ProjetsClient } from "@/components/admin/ProjetsClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Projets — Administration KoniG.dev",
};

export default async function PageProjets() {
  const supabase = creerClientSupabase();
  const session = await sessionAdmin(supabase);
  if (!session) redirect("/admin/login");

  const admin = creerClientAdmin();
  const { data: projets } = await admin
    .from("projects")
    .select("*")
    .order("ordre", { ascending: true });

  const { count: nonLus } = await admin
    .from("messages")
    .select("*", { count: "exact", head: true })
    .eq("lu", false);

  return (
    <AdminShell email={session.email} nonLus={nonLus ?? 0}>
      <ProjetsClient projets={projets ?? []} />
    </AdminShell>
  );
}

