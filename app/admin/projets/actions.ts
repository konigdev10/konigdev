"use server";

import { creerClientSupabase } from "@/lib/supabase/server";
import { creerClientAdmin } from "@/lib/supabase/admin";
import { sessionAdmin } from "@/lib/security/guard";
import { journaliser } from "@/lib/security/audit";
import { revalidatePath } from "next/cache";
import { CATEGORIES, STATUTS_PROJET, type ProjectDraft } from "@/lib/supabase/database.types";

function validerDraft(data: FormData): { ok: true; draft: ProjectDraft } | { ok: false; erreur: string } {
  const slug = String(data.get("slug") ?? "").trim();
  const nom = String(data.get("nom") ?? "").trim();
  const categorie = String(data.get("categorie") ?? "");
  const statut = String(data.get("statut") ?? "");
  const role = String(data.get("role") ?? "").trim();
  const resume = String(data.get("resume") ?? "").trim();
  const outils = String(data.get("outils") ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  const resultat = String(data.get("resultat") ?? "").trim() || null;
  const lien = String(data.get("lien") ?? "").trim() || null;
  const image_url = String(data.get("image_url") ?? "").trim() || null;
  const annee = String(data.get("annee") ?? "").trim() || null;
  const publie = data.get("publie") === "on" || data.get("publie") === "true";

  if (!slug || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) return { ok: false, erreur: "Slug invalide (minuscules, tirets, chiffres)." };
  if (!nom || nom.length > 120) return { ok: false, erreur: "Nom requis (max 120 caractères)." };
  if (!CATEGORIES.includes(categorie as never)) return { ok: false, erreur: "Catégorie invalide." };
  if (!STATUTS_PROJET.includes(statut as never)) return { ok: false, erreur: "Statut invalide." };
  if (!role) return { ok: false, erreur: "Rôle requis." };
  if (!resume || resume.length > 2000) return { ok: false, erreur: "Résumé requis (max 2000 caractères)." };
  if (outils.length > 20) return { ok: false, erreur: "Maximum 20 outils." };
  if (lien && !/^https?:\/\/.+/.test(lien)) return { ok: false, erreur: "Lien invalide (doit commencer par http:// ou https://)." };

  return {
    ok: true,
    draft: {
      slug, nom,
      categorie: categorie as ProjectDraft["categorie"],
      statut: statut as ProjectDraft["statut"],
      role, resume, outils, resultat, lien, image_url,
      annee, publie,
    },
  };
}

export interface ResultatProjet {
  ok: boolean;
  erreur?: string;
  id?: string;
}

export async function creerProjet(data: FormData): Promise<ResultatProjet> {
  try {
    const supabase = creerClientSupabase();
    const session = await sessionAdmin(supabase);
    if (!session) return { ok: false, erreur: "Non autorisé. Veuillez vous reconnecter." };

    const validation = validerDraft(data);
    if (!validation.ok) return { ok: false, erreur: validation.erreur };

    const admin = creerClientAdmin();
    let image_url = String(data.get("image_url") ?? "").trim() || null;

    // Upload d'image direct si un fichier a été fourni
    const fichierImage = data.get("fichier_image");
    if (fichierImage instanceof File && fichierImage.size > 0 && typeof fichierImage.name === "string" && fichierImage.name.length > 0) {
      if (!fichierImage.type.startsWith("image/")) {
        return { ok: false, erreur: "Le fichier doit être une image (PNG, JPG, WebP)." };
      }
      if (fichierImage.size > 5 * 1024 * 1024) {
        return { ok: false, erreur: "L'image ne doit pas dépasser 5 Mo." };
      }
      const ext = fichierImage.name.split(".").pop() || "png";
      const nomFichier = `${validation.draft.slug}-${Date.now()}.${ext}`;

      const tampon = Buffer.from(await fichierImage.arrayBuffer());
      const { error: errUpload } = await admin.storage
        .from("projets")
        .upload(nomFichier, tampon, {
          contentType: fichierImage.type,
          upsert: true,
        });

      if (errUpload) {
        console.error("Erreur upload storage:", errUpload);
        return { ok: false, erreur: `Échec du téléversement de l'image : ${errUpload.message}` };
      }

      const { data: dataUrl } = admin.storage.from("projets").getPublicUrl(nomFichier);
      image_url = dataUrl.publicUrl;
    }

    const { data: row, error } = await admin
      .from("projects")
      .insert({ ...validation.draft, image_url })
      .select("id")
      .single();
    if (error) return { ok: false, erreur: error.code === "23505" ? "Ce slug existe déjà." : `Erreur base de données : ${error.message}` };

    await journaliser({ action: "projet_cree", detail: validation.draft.slug, ipHash: null, reussite: true });
    revalidatePath("/admin/projets");
    revalidatePath("/");
    return { ok: true, id: row.id };
  } catch (e) {
    console.error("Crash serveur creerProjet:", e);
    return { ok: false, erreur: e instanceof Error ? e.message : "Erreur interne du serveur." };
  }
}

export async function modifierProjet(id: string, data: FormData): Promise<ResultatProjet> {
  try {
    const supabase = creerClientSupabase();
    const session = await sessionAdmin(supabase);
    if (!session) return { ok: false, erreur: "Non autorisé. Veuillez vous reconnecter." };

    const validation = validerDraft(data);
    if (!validation.ok) return { ok: false, erreur: validation.erreur };

    const admin = creerClientAdmin();
    let image_url = String(data.get("image_url") ?? "").trim() || null;

    // Upload d'image direct si un fichier a été fourni
    const fichierImage = data.get("fichier_image");
    if (fichierImage instanceof File && fichierImage.size > 0 && typeof fichierImage.name === "string" && fichierImage.name.length > 0) {
      if (!fichierImage.type.startsWith("image/")) {
        return { ok: false, erreur: "Le fichier doit être une image (PNG, JPG, WebP)." };
      }
      if (fichierImage.size > 5 * 1024 * 1024) {
        return { ok: false, erreur: "L'image ne doit pas dépasser 5 Mo." };
      }
      const ext = fichierImage.name.split(".").pop() || "png";
      const nomFichier = `${validation.draft.slug}-${Date.now()}.${ext}`;

      const tampon = Buffer.from(await fichierImage.arrayBuffer());
      const { error: errUpload } = await admin.storage
        .from("projets")
        .upload(nomFichier, tampon, {
          contentType: fichierImage.type,
          upsert: true,
        });

      if (errUpload) {
        console.error("Erreur upload storage:", errUpload);
        return { ok: false, erreur: `Échec du téléversement de l'image : ${errUpload.message}` };
      }

      const { data: dataUrl } = admin.storage.from("projets").getPublicUrl(nomFichier);
      image_url = dataUrl.publicUrl;
    }

    const { error } = await admin
      .from("projects")
      .update({ ...validation.draft, image_url })
      .eq("id", id);
    if (error) return { ok: false, erreur: `Erreur base de données : ${error.message}` };

    await journaliser({ action: "projet_modifie", detail: id.slice(0, 8), ipHash: null, reussite: true });
    revalidatePath("/admin/projets");
    revalidatePath("/");
    return { ok: true };
  } catch (e) {
    console.error("Crash serveur modifierProjet:", e);
    return { ok: false, erreur: e instanceof Error ? e.message : "Erreur interne du serveur." };
  }
}

export async function supprimerProjet(id: string): Promise<ResultatProjet> {
  const supabase = creerClientSupabase();
  const session = await sessionAdmin(supabase);
  if (!session) return { ok: false, erreur: "Non autorisé." };

  const admin = creerClientAdmin();
  const { error } = await admin.from("projects").delete().eq("id", id);
  if (error) return { ok: false, erreur: "Suppression impossible." };

  await journaliser({ action: "projet_supprime", detail: id.slice(0, 8), ipHash: null, reussite: true });
  revalidatePath("/admin/projets");
  revalidatePath("/");
  return { ok: true };
}

export async function changerOrdre(id: string, ordre: number): Promise<ResultatProjet> {
  const supabase = creerClientSupabase();
  const session = await sessionAdmin(supabase);
  if (!session) return { ok: false, erreur: "Non autorisé." };

  const admin = creerClientAdmin();
  const { error } = await admin.from("projects").update({ ordre }).eq("id", id);
  if (error) return { ok: false, erreur: "Impossible de changer l'ordre." };

  revalidatePath("/admin/projets");
  revalidatePath("/");
  return { ok: true };
}

