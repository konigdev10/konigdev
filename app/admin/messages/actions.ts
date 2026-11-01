"use server";

import { creerClientSupabase } from "@/lib/supabase/server";
import { creerClientAdmin } from "@/lib/supabase/admin";
import { sessionAdmin } from "@/lib/security/guard";
import { journaliser } from "@/lib/security/audit";
import { revalidatePath } from "next/cache";

export async function marquerLu(id: string, lu: boolean): Promise<{ ok: boolean; erreur?: string }> {
  const supabase = creerClientSupabase();
  const session = await sessionAdmin(supabase);
  if (!session) return { ok: false, erreur: "Non autorisé." };

  const admin = creerClientAdmin();
  const { error } = await admin.from("messages").update({ lu }).eq("id", id);
  if (error) return { ok: false, erreur: "Mise à jour impossible." };

  await journaliser({ action: "message_marque", detail: `${id.slice(0, 8)}:${lu ? "lu" : "non_lu"}`, ipHash: null, reussite: true });
  revalidatePath("/admin/messages");
  revalidatePath("/admin");
  return { ok: true };
}

export async function marquerRepondu(id: string, repondu: boolean): Promise<{ ok: boolean; erreur?: string }> {
  const supabase = creerClientSupabase();
  const session = await sessionAdmin(supabase);
  if (!session) return { ok: false, erreur: "Non autorisé." };

  const admin = creerClientAdmin();
  const { error } = await admin.from("messages").update({ repondu }).eq("id", id);
  if (error) return { ok: false, erreur: "Mise à jour impossible." };

  revalidatePath("/admin/messages");
  return { ok: true };
}

export async function supprimerMessage(id: string): Promise<{ ok: boolean; erreur?: string }> {
  const supabase = creerClientSupabase();
  const session = await sessionAdmin(supabase);
  if (!session) return { ok: false, erreur: "Non autorisé." };

  const admin = creerClientAdmin();
  const { error } = await admin.from("messages").delete().eq("id", id);
  if (error) return { ok: false, erreur: "Suppression impossible." };

  await journaliser({ action: "message_supprime", detail: id.slice(0, 8), ipHash: null, reussite: true });
  revalidatePath("/admin/messages");
  revalidatePath("/admin");
  return { ok: true };
}
