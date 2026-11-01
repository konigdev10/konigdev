"use client";

import { useState, useCallback, useTransition } from "react";
import { creerProjet, modifierProjet, supprimerProjet, changerOrdre } from "@/app/admin/projets/actions";
import { CATEGORIES, STATUTS_PROJET, type ProjectRow } from "@/lib/supabase/database.types";

const INPUT = "w-full h-10 px-3 rounded-[10px] bg-bg-page font-text text-sm text-text-title shadow-inset-field border border-transparent focus:outline-none focus:border-text-title appearance-none";
const TEXTAREA = "w-full px-3 py-2.5 rounded-[12px] bg-bg-page font-text text-sm text-text-title shadow-inset-field border border-transparent focus:outline-none focus:border-text-title resize-none";
const SELECT = "w-full h-10 px-3 rounded-[10px] bg-bg-page font-text text-sm text-text-title shadow-inset-field border border-transparent focus:outline-none focus:border-text-title appearance-none";
const BTN_PRIMARY = "h-10 rounded-[10px] bg-accent px-5 font-text text-sm font-semibold text-white hover:bg-accent-dark disabled:opacity-50 transition-colors";
const BTN_GHOST = "h-10 rounded-[10px] border border-white/60 bg-bg-page px-4 font-text text-sm text-text-body shadow-inset-field hover:text-text-title disabled:opacity-50";

function slugifier(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function ProjetForm({
  projet,
  onAnnuler,
}: {
  projet?: ProjectRow;
  onAnnuler: () => void;
}) {
  const [pending, start] = useTransition();
  const [erreur, setErreur] = useState<string | null>(null);
  const [slug, setSlug] = useState(projet?.slug ?? "");
  const [nom, setNom] = useState(projet?.nom ?? "");

  const surNom = useCallback((v: string) => {
    setNom(v);
    if (!projet) setSlug(slugifier(v));
  }, [projet]);

  const surSoumission = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setErreur(null);
      const fd = new FormData(e.currentTarget);
      start(async () => {
        try {
          const r = projet
            ? await modifierProjet(projet.id, fd)
            : await creerProjet(fd);
          if (!r || !r.ok) {
            setErreur(r?.erreur ?? "Erreur inconnue lors de l'enregistrement.");
            return;
          }
          // optimistic: recharge la page pour récupérer le vrai état
          window.location.reload();
        } catch (err) {
          console.error("Erreur soumission projet:", err);
          setErreur(err instanceof Error ? err.message : "Erreur inattendue du serveur.");
        }
      });
    },
    [projet],
  );

  return (
    <form onSubmit={surSoumission} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <label className="font-text text-xs font-semibold text-text-title">Nom <span className="text-error">*</span></label>
          <input name="nom" value={nom} onChange={(e) => surNom(e.target.value)} required maxLength={120} className={INPUT} placeholder="Le Viceto" />
        </div>
        <div className="space-y-1">
          <label className="font-text text-xs font-semibold text-text-title">Slug <span className="text-error">*</span></label>
          <input name="slug" value={slug} onChange={(e) => setSlug(e.target.value)} required pattern="[a-z0-9]+(-[a-z0-9]+)*" className={INPUT} placeholder="le-viceto" />
        </div>
        <div className="space-y-1">
          <label className="font-text text-xs font-semibold text-text-title">Catégorie <span className="text-error">*</span></label>
          <select name="categorie" defaultValue={projet?.categorie ?? ""} required className={SELECT}>
            <option value="" disabled>Choisir…</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="space-y-1">
          <label className="font-text text-xs font-semibold text-text-title">Statut <span className="text-error">*</span></label>
          <select name="statut" defaultValue={projet?.statut ?? ""} required className={SELECT}>
            <option value="" disabled>Choisir…</option>
            {STATUTS_PROJET.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="space-y-1">
          <label className="font-text text-xs font-semibold text-text-title">Année</label>
          <input name="annee" defaultValue={projet?.annee ?? ""} maxLength={4} pattern="\d{4}" className={INPUT} placeholder="2026" />
        </div>
        <div className="space-y-1">
          <label className="font-text text-xs font-semibold text-text-title">Lien</label>
          <input name="lien" type="url" defaultValue={projet?.lien ?? ""} className={INPUT} placeholder="https://…" />
        </div>
        <div className="space-y-1 sm:col-span-2">
          <label className="font-text text-xs font-semibold text-text-title">Image du projet</label>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <input
              type="file"
              name="fichier_image"
              accept="image/png, image/jpeg, image/webp"
              className="font-text text-xs text-text-body file:mr-3 file:h-10 file:rounded-[10px] file:border-0 file:bg-accent file:px-4 file:font-text file:text-xs file:font-semibold file:text-white file:cursor-pointer hover:file:bg-accent-dark transition-colors"
            />
            <span className="font-text text-xs text-text-muted">ou URL :</span>
            <input
              name="image_url"
              defaultValue={projet?.image_url ?? ""}
              className={`${INPUT} flex-1`}
              placeholder="/viceto.png ou https://…"
            />
          </div>
          {projet?.image_url ? (
            <p className="mt-1 font-text text-[11px] text-text-muted">
              Image actuelle : <a href={projet.image_url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">{projet.image_url}</a>
            </p>
          ) : null}
        </div>
        <div className="space-y-1 sm:col-span-2">
          <label className="font-text text-xs font-semibold text-text-title">Outils (séparés par des virgules)</label>
          <input name="outils" defaultValue={projet?.outils.join(", ") ?? ""} className={INPUT} placeholder="Next.js, TypeScript, Tailwind" />
        </div>
      </div>

      <div className="space-y-1">
        <label className="font-text text-xs font-semibold text-text-title">Rôle <span className="text-error">*</span></label>
        <input name="role" defaultValue={projet?.role ?? ""} required className={INPUT} placeholder="Conception UI/UX, développement…" />
      </div>

      <div className="space-y-1">
        <label className="font-text text-xs font-semibold text-text-title">Résumé <span className="text-error">*</span></label>
        <textarea name="resume" defaultValue={projet?.resume ?? ""} required maxLength={2000} rows={4} className={TEXTAREA} placeholder="Description du projet…" />
      </div>

      <div className="space-y-1">
        <label className="font-text text-xs font-semibold text-text-title">Résultat</label>
        <textarea name="resultat" defaultValue={projet?.resultat ?? ""} rows={2} className={TEXTAREA} placeholder="Impact mesurable…" />
      </div>

      <div className="flex items-center gap-2">
        <input type="checkbox" name="publie" id="publie-check" defaultChecked={projet?.publie ?? false} className="h-4 w-4 rounded" />
        <label htmlFor="publie-check" className="font-text text-sm text-text-body">Publié (visible sur le portfolio)</label>
      </div>

      {erreur ? (
        <p role="alert" className="rounded-[10px] bg-error/10 px-4 py-3 font-text text-sm text-error">{erreur}</p>
      ) : null}

      <div className="flex gap-2 justify-end pt-2">
        <button type="button" onClick={onAnnuler} className={BTN_GHOST}>Annuler</button>
        <button type="submit" disabled={pending} className={BTN_PRIMARY}>
          {pending ? "Enregistrement…" : projet ? "Enregistrer" : "Créer le projet"}
        </button>
      </div>
    </form>
  );
}

export function ProjetsClient({ projets: initial }: { projets: ProjectRow[] }) {
  const [projets, setProjets] = useState<ProjectRow[]>(initial);
  const [mode, setMode] = useState<"liste" | "creer" | { editer: ProjectRow }>("liste");
  const [aSupprimer, setASupprimer] = useState<ProjectRow | null>(null);
  const [pending, start] = useTransition();

  const supprimer = useCallback((p: ProjectRow) => {
    start(async () => {
      const r = await supprimerProjet(p.id);
      if (r.ok) {
        setProjets((prev) => prev.filter((x) => x.id !== p.id));
        setASupprimer(null);
      }
    });
  }, []);

  const changerOrdreLocal = useCallback((p: ProjectRow, delta: number) => {
    const nouvelOrdre = p.ordre + delta;
    start(async () => {
      await changerOrdre(p.id, nouvelOrdre);
      setProjets((prev) =>
        [...prev]
          .map((x) => x.id === p.id ? { ...x, ordre: nouvelOrdre } : x)
          .sort((a, b) => a.ordre - b.ordre)
      );
    });
  }, []);

  return (
    <div className="px-6 py-8 lg:px-10">
      {mode === "liste" ? (
        <>
          <div className="flex items-center justify-between mb-6">
            <h1 className="font-display text-2xl font-extrabold text-text-title">Projets</h1>
            <button onClick={() => setMode("creer")} className={BTN_PRIMARY}>
              <span className="flex items-center gap-1.5">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                Nouveau projet
              </span>
            </button>
          </div>

          <div className="space-y-3">
            {projets.length === 0 ? (
              <div className="rounded-[20px] border border-white/80 bg-gradient-to-br from-bg-card-start to-bg-card-end p-12 text-center shadow-contact-card">
                <p className="font-text text-sm text-text-muted">Aucun projet. Cliquez sur &quot;Nouveau projet&quot; pour commencer.</p>
              </div>
            ) : projets.map((p) => (
              <div key={p.id} className="flex items-center gap-4 rounded-[16px] border border-white/80 bg-gradient-to-br from-bg-card-start to-bg-card-end px-5 py-4 shadow-contact-card">
                <div className="flex flex-col gap-1">
                  <button onClick={() => changerOrdreLocal(p, -1)} disabled={pending} className="text-text-muted hover:text-text-title disabled:opacity-30" aria-label="Remonter">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 8l4-4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                  </button>
                  <button onClick={() => changerOrdreLocal(p, 1)} disabled={pending} className="text-text-muted hover:text-text-title disabled:opacity-30" aria-label="Descendre">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                  </button>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-text text-sm font-semibold text-text-title">{p.nom}</p>
                    <span className={`rounded-full px-2 py-0.5 font-text text-[10px] font-semibold ${p.publie ? "bg-accent text-white" : "bg-bg-page text-text-muted border border-white/60"}`}>
                      {p.publie ? "Publié" : "Brouillon"}
                    </span>
                    <span className="rounded-full bg-bg-page px-2 py-0.5 font-text text-[10px] text-text-muted border border-white/60">{p.categorie}</span>
                  </div>
                  <p className="mt-0.5 truncate font-text text-xs text-text-muted">{p.slug} {p.annee ? `· ${p.annee}` : ""}</p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setMode({ editer: p })}
                    className="rounded-[8px] border border-white/60 bg-bg-page px-3 py-1.5 font-text text-xs text-text-body shadow-inset-field hover:text-text-title"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() => setASupprimer(p)}
                    className="rounded-[8px] border border-error/20 px-3 py-1.5 font-text text-xs text-error hover:bg-error/5"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : mode === "creer" ? (
        <div>
          <button onClick={() => setMode("liste")} className="mb-6 flex items-center gap-1.5 font-text text-sm text-text-muted hover:text-text-title">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 2L3 7l6 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
            Retour
          </button>
          <h1 className="mb-6 font-display text-2xl font-extrabold text-text-title">Nouveau projet</h1>
          <div className="max-w-2xl rounded-[20px] border border-white/80 bg-gradient-to-br from-bg-card-start to-bg-card-end p-6 shadow-contact-card lg:p-8">
            <ProjetForm onAnnuler={() => setMode("liste")} />
          </div>
        </div>
      ) : (
        <div>
          <button onClick={() => setMode("liste")} className="mb-6 flex items-center gap-1.5 font-text text-sm text-text-muted hover:text-text-title">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 2L3 7l6 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
            Retour
          </button>
          <h1 className="mb-6 font-display text-2xl font-extrabold text-text-title">Modifier · {mode.editer.nom}</h1>
          <div className="max-w-2xl rounded-[20px] border border-white/80 bg-gradient-to-br from-bg-card-start to-bg-card-end p-6 shadow-contact-card lg:p-8">
            <ProjetForm projet={mode.editer} onAnnuler={() => setMode("liste")} />
          </div>
        </div>
      )}

      {/* Modal de confirmation suppression */}
      {aSupprimer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-accent/20 px-4">
          <div className="w-full max-w-sm rounded-[24px] border border-white/80 bg-gradient-to-br from-bg-card-start to-bg-card-end p-7 shadow-contact-card">
            <h2 className="font-display text-lg font-extrabold text-text-title">Supprimer ce projet ?</h2>
            <p className="mt-2 font-text text-sm text-text-body">
              &quot;{aSupprimer.nom}&quot; sera définitivement supprimé de la base de données.
            </p>
            <div className="mt-6 flex gap-3 justify-end">
              <button onClick={() => setASupprimer(null)} className={BTN_GHOST}>Annuler</button>
              <button onClick={() => supprimer(aSupprimer)} disabled={pending} className="h-10 rounded-[10px] bg-error px-5 font-text text-sm font-semibold text-white hover:bg-error/80 disabled:opacity-50">
                {pending ? "Suppression…" : "Supprimer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

