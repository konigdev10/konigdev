import { creerClientSupabase } from "@/lib/supabase/server";
import type { Project, ProjectCategory, ProjectStatus } from "@/lib/projects-data";

/**
 * Récupère les projets publiés depuis la base de données Supabase (gérés dans l'admin).
 */
export async function getPublishedProjects(): Promise<Project[]> {
  try {
    const supabase = creerClientSupabase();
    const { data: rows, error } = await supabase
      .from("projects")
      .select("*")
      .eq("publie", true)
      .order("ordre", { ascending: true });

    if (error || !rows) {
      console.error("Erreur récupération projets publiés:", error);
      return [];
    }

    return rows.map((r) => ({
      slug: r.slug,
      nom: r.nom,
      categorie: r.categorie as ProjectCategory,
      annee: r.annee ?? undefined,
      statut: r.statut as ProjectStatus,
      role: r.role,
      resume: r.resume,
      outils: r.outils,
      resultat: r.resultat ?? undefined,
      image: r.image_url ?? undefined,
      lien: r.lien ?? undefined,
    }));
  } catch (err) {
    console.error("Erreur serveur getPublishedProjects:", err);
    return [];
  }
}

