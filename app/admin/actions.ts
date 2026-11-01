"use server";

import { creerClientSupabase } from "@/lib/supabase/server";
import { sessionAdmin } from "@/lib/security/guard";
import { journaliser } from "@/lib/security/audit";
import { NOM_COOKIE_ACTIVITE } from "@/lib/security/session";
import { cookies } from "next/headers";

/** Déconnexion propre : révoque la session Supabase et supprime le cookie d'activité. */
export async function deconnecter(): Promise<void> {
  const supabase = creerClientSupabase();
  const session = await sessionAdmin(supabase);
  if (session) {
    await journaliser({ action: "deconnexion_globale", detail: null, ipHash: null, reussite: true });
  }
  await supabase.auth.signOut();
  const store = cookies();
  store.set(NOM_COOKIE_ACTIVITE, "", { maxAge: 0, path: "/" });
}
