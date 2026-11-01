"use client";

import { useState, useCallback, useTransition } from "react";
import { marquerLu, marquerRepondu, supprimerMessage } from "@/app/admin/messages/actions";
import type { MessageRow } from "@/lib/supabase/database.types";

const fmt = new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short" });

function Badge({ children, variante }: { children: React.ReactNode; variante: "ok" | "muted" | "error" }) {
  const cls = {
    ok: "bg-accent text-white",
    muted: "bg-bg-page text-text-muted border border-white/60",
    error: "bg-error/10 text-error",
  }[variante];
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-text text-[10px] font-semibold tracking-wide ${cls}`}>
      {children}
    </span>
  );
}

export function MessageDetail({ message, onFermer, onAction }: {
  message: MessageRow;
  onFermer: () => void;
  onAction: (id: string, champ: "lu" | "repondu" | "supprime", valeur?: boolean) => void;
}) {
  const [pending, startTransition] = useTransition();
  const [confirmerSuppression, setConfirmerSuppression] = useState(false);

  const toggle = useCallback((champ: "lu" | "repondu", valeur: boolean) => {
    const fn = champ === "lu" ? marquerLu : marquerRepondu;
    startTransition(async () => {
      const r = await fn(message.id, valeur);
      if (r.ok) onAction(message.id, champ, valeur);
    });
  }, [message.id, onAction]);

  const supprimer = useCallback(() => {
    startTransition(async () => {
      const r = await supprimerMessage(message.id);
      if (r.ok) onAction(message.id, "supprime");
    });
  }, [message.id, onAction]);

  return (
    <div className="flex flex-col h-full">
      {/* En-tête */}
      <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-white/60">
        <div>
          <p className="font-display text-lg font-extrabold text-text-title">{message.nom}</p>
          <p className="mt-0.5 font-text text-sm text-text-muted">
            {fmt.format(new Date(message.created_at))}
          </p>
        </div>
        <button onClick={onFermer} className="rounded-[10px] p-2 text-text-muted hover:bg-accent/5 hover:text-text-title" aria-label="Fermer">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M4 4l10 10M14 4L4 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
        </button>
      </div>

      {/* Corps */}
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
        <div className="flex flex-wrap gap-2">
          <Badge variante={message.lu ? "ok" : "muted"}>{message.lu ? "Lu" : "Non lu"}</Badge>
          <Badge variante={message.repondu ? "ok" : "muted"}>{message.repondu ? "Répondu" : "En attente"}</Badge>
        </div>

        <dl className="space-y-3">
          <div>
            <dt className="font-text text-[10px] font-semibold uppercase tracking-[0.14em] text-text-muted">Contact</dt>
            <dd className="mt-0.5 font-text text-sm text-text-body break-all">{message.contact}</dd>
          </div>
          <div>
            <dt className="font-text text-[10px] font-semibold uppercase tracking-[0.14em] text-text-muted">Projet</dt>
            <dd className="mt-0.5 font-text text-sm text-text-body">{message.projet}</dd>
          </div>
          {message.budget ? (
            <div>
              <dt className="font-text text-[10px] font-semibold uppercase tracking-[0.14em] text-text-muted">Budget</dt>
              <dd className="mt-0.5 font-text text-sm text-text-body">{message.budget}</dd>
            </div>
          ) : null}
          <div>
            <dt className="font-text text-[10px] font-semibold uppercase tracking-[0.14em] text-text-muted">Message</dt>
            <dd className="mt-1 whitespace-pre-wrap rounded-[14px] bg-bg-page p-4 font-text text-sm text-text-body shadow-inset-field">
              {message.message}
            </dd>
          </div>
        </dl>

        {/* Liens de réponse rapide */}
        <div className="flex flex-wrap gap-2 pt-1">
          {message.contact.includes("@") ? (
            <a
              href={`mailto:${message.contact}?subject=Re%3A ${encodeURIComponent(message.projet)}`}
              className="inline-flex items-center gap-1.5 rounded-[10px] bg-accent px-4 py-2 font-text text-sm font-semibold text-white hover:bg-accent-dark"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1.5 3l5.5 4 5.5-4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><rect x="1" y="2.5" width="12" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.3"/></svg>
              Répondre par email
            </a>
          ) : (
            <a
              href={`https://wa.me/${message.contact.replace(/\D/g, "")}?text=${encodeURIComponent(`Bonjour ${message.nom}, suite à votre message sur mon portfolio concernant : ${message.projet}.`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-[10px] bg-accent px-4 py-2 font-text text-sm font-semibold text-white hover:bg-accent-dark"
            >
              WhatsApp
            </a>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="border-t border-white/60 px-6 py-4 flex flex-wrap gap-2">
        <button
          onClick={() => toggle("lu", !message.lu)}
          disabled={pending}
          className="rounded-[10px] border border-white/60 bg-bg-page px-4 py-2 font-text text-xs font-semibold text-text-body shadow-inset-field hover:text-text-title disabled:opacity-50"
        >
          {message.lu ? "Marquer non lu" : "Marquer lu"}
        </button>
        <button
          onClick={() => toggle("repondu", !message.repondu)}
          disabled={pending}
          className="rounded-[10px] border border-white/60 bg-bg-page px-4 py-2 font-text text-xs font-semibold text-text-body shadow-inset-field hover:text-text-title disabled:opacity-50"
        >
          {message.repondu ? "Marquer en attente" : "Marquer répondu"}
        </button>
        <div className="flex-1" />
        {confirmerSuppression ? (
          <>
            <button onClick={() => setConfirmerSuppression(false)} className="rounded-[10px] px-3 py-2 font-text text-xs text-text-muted hover:text-text-title">Annuler</button>
            <button
              onClick={supprimer}
              disabled={pending}
              className="rounded-[10px] bg-error px-4 py-2 font-text text-xs font-semibold text-white hover:bg-error/80 disabled:opacity-50"
            >
              Confirmer la suppression
            </button>
          </>
        ) : (
          <button
            onClick={() => setConfirmerSuppression(true)}
            className="rounded-[10px] border border-error/20 px-4 py-2 font-text text-xs font-semibold text-error hover:bg-error/5"
          >
            Supprimer
          </button>
        )}
      </div>
    </div>
  );
}

export function MessagesClient({ messages: initial }: { messages: MessageRow[] }) {
  const [messages, setMessages] = useState<MessageRow[]>(initial);
  const [actif, setActif] = useState<MessageRow | null>(null);
  const [filtre, setFiltre] = useState<"tous" | "non_lus" | "repondus">("tous");

  const surAction = useCallback((id: string, champ: "lu" | "repondu" | "supprime", valeur?: boolean) => {
    setMessages((prev) => {
      if (champ === "supprime") return prev.filter((m) => m.id !== id);
      return prev.map((m) =>
        m.id === id ? { ...m, [champ]: valeur ?? false } : m
      );
    });
    if (champ === "supprime") setActif(null);
    else setActif((prev) => prev?.id === id ? { ...prev, [champ]: valeur ?? false } : prev);
  }, []);

  const filtres = messages.filter((m) => {
    if (filtre === "non_lus") return !m.lu;
    if (filtre === "repondus") return m.repondu;
    return true;
  });

  return (
    <div className="flex h-[calc(100vh-0px)] overflow-hidden lg:h-screen">
      {/* Liste */}
      <div className={`flex flex-col border-r border-white/60 ${actif ? "hidden lg:flex lg:w-80 xl:w-96" : "flex-1 lg:w-80 xl:w-96"}`}>
        {/* Filtres */}
        <div className="flex gap-1 border-b border-white/60 p-3">
          {(["tous", "non_lus", "repondus"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFiltre(f)}
              className={`rounded-[8px] px-3 py-1.5 font-text text-xs font-semibold transition-colors ${filtre === f ? "bg-accent text-white" : "text-text-muted hover:text-text-title hover:bg-accent/5"}`}
            >
              {f === "tous" ? "Tous" : f === "non_lus" ? "Non lus" : "Répondus"}
              <span className="ml-1.5 opacity-60">
                {f === "tous" ? messages.length : f === "non_lus" ? messages.filter((m) => !m.lu).length : messages.filter((m) => m.repondu).length}
              </span>
            </button>
          ))}
        </div>

        {filtres.length === 0 ? (
          <div className="flex flex-1 items-center justify-center">
            <p className="font-text text-sm text-text-muted">Aucun message dans ce filtre.</p>
          </div>
        ) : (
          <ul className="flex-1 overflow-y-auto divide-y divide-white/60">
            {filtres.map((m) => (
              <li key={m.id}>
                <button
                  onClick={() => setActif(m)}
                  className={`w-full text-left px-5 py-4 transition-colors hover:bg-accent/4 ${actif?.id === m.id ? "bg-accent/8" : ""}`}
                >
                  <div className="flex items-start gap-3">
                    <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${m.lu ? "border border-text-muted/40" : "bg-accent"}`} />
                    <div className="min-w-0 flex-1">
                      <p className={`font-text text-sm truncate ${m.lu ? "text-text-body" : "font-semibold text-text-title"}`}>
                        {m.nom}
                      </p>
                      <p className="truncate font-text text-xs text-text-muted">{m.projet}</p>
                      <p className="mt-1 truncate font-text text-xs text-text-muted/70">{fmt.format(new Date(m.created_at))}</p>
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Détail */}
      <div className={`flex-1 bg-gradient-to-br from-bg-card-start to-bg-card-end ${actif ? "flex flex-col" : "hidden lg:flex lg:items-center lg:justify-center"}`}>
        {actif ? (
          <MessageDetail message={actif} onFermer={() => setActif(null)} onAction={surAction} />
        ) : (
          <p className="font-text text-sm text-text-muted">Sélectionnez un message pour le lire.</p>
        )}
      </div>
    </div>
  );
}

