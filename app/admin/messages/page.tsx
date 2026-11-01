import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { creerClientSupabase } from "@/lib/supabase/server";
import { creerClientAdmin } from "@/lib/supabase/admin";
import { sessionAdmin } from "@/lib/security/guard";
import { AdminShell } from "@/components/admin/AdminShell";
import { MessagesClient } from "@/components/admin/MessagesClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Messages — Administration KoniG.dev",
};

export default async function PageMessages() {
  const supabase = creerClientSupabase();
  const session = await sessionAdmin(supabase);
  if (!session) redirect("/admin/login");

  const admin = creerClientAdmin();
  const { data: messages } = await admin
    .from("messages")
    .select("*")
    .order("created_at", { ascending: false });

  const { count: nonLus } = await admin
    .from("messages")
    .select("*", { count: "exact", head: true })
    .eq("lu", false);

  return (
    <AdminShell email={session.email} nonLus={nonLus ?? 0}>
      <div className="flex h-full flex-col">
        <header className="border-b border-white/60 bg-gradient-to-r from-bg-card-start to-bg-card-end px-6 py-5 lg:px-8">
          <h1 className="font-display text-xl font-extrabold text-text-title">Messages</h1>
          <p className="mt-0.5 font-text text-sm text-text-muted">
            {nonLus ? <><strong>{nonLus}</strong> message{nonLus > 1 ? "s" : ""} non lu{nonLus > 1 ? "s" : ""}.</> : "Tous les messages sont lus."}
          </p>
        </header>
        <MessagesClient messages={messages ?? []} />
      </div>
    </AdminShell>
  );
}

