"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState, useCallback } from "react";
import { deconnecter } from "@/app/admin/actions";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const NAV: NavItem[] = [
  {
    href: "/admin",
    label: "Tableau de bord",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
        <rect x="1.5" y="1.5" width="6" height="6" rx="2" stroke="currentColor" strokeWidth="1.5"/>
        <rect x="10.5" y="1.5" width="6" height="6" rx="2" stroke="currentColor" strokeWidth="1.5"/>
        <rect x="1.5" y="10.5" width="6" height="6" rx="2" stroke="currentColor" strokeWidth="1.5"/>
        <rect x="10.5" y="10.5" width="6" height="6" rx="2" stroke="currentColor" strokeWidth="1.5"/>
      </svg>
    ),
  },
  {
    href: "/admin/messages",
    label: "Messages",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
        <path d="M2 3.5A1.5 1.5 0 013.5 2h11A1.5 1.5 0 0116 3.5v9A1.5 1.5 0 0114.5 14H11l-2 2-2-2H3.5A1.5 1.5 0 012 12.5v-9z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M5 6h8M5 9h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    href: "/admin/projets",
    label: "Projets",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
        <rect x="2" y="5" width="14" height="11" rx="2" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M2 8h14" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M6 5V3.5A1.5 1.5 0 017.5 2h3A1.5 1.5 0 0112 3.5V5" stroke="currentColor" strokeWidth="1.5"/>
      </svg>
    ),
  },
  {
    href: "/admin/visites",
    label: "Visites",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
        <path d="M1.5 13L5.5 9l3 3L12 7l4.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    href: "/admin/securite",
    label: "Sécurité",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
        <path d="M9 1.5L2.5 4.5V9c0 3.5 2.5 6.5 6.5 7.5 4-1 6.5-4 6.5-7.5V4.5L9 1.5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M6 9l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
];

export function AdminShell({
  children,
  email,
  nonLus,
}: {
  children: React.ReactNode;
  email: string | null;
  nonLus?: number;
}) {
  const chemin = usePathname();
  const routeur = useRouter();
  const [sortieEnCours, setSortieEnCours] = useState(false);
  const [menuOuvert, setMenuOuvert] = useState(false);

  const surDeconnexion = useCallback(async () => {
    setSortieEnCours(true);
    await deconnecter();
    routeur.push("/admin/login");
    routeur.refresh();
  }, [routeur]);

  return (
    <div className="flex min-h-screen bg-bg-page">
      {/* Sidebar — desktop */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-white/60 bg-gradient-to-b from-bg-card-start to-bg-card-end lg:flex">
        <div className="px-6 py-6 flex items-center gap-3">
          <div className="relative w-9 h-9 shrink-0">
            <Image
              src="/logo.png"
              alt="Logo KoniG.dev"
              fill
              sizes="36px"
              priority
              className="object-contain"
            />
          </div>
          <div>
            <p className="font-text text-[10px] font-semibold uppercase tracking-[0.18em] text-text-muted">
              KoniG.dev
            </p>
            <p className="mt-0.5 font-display text-lg font-extrabold text-text-title">
              Administration
            </p>
          </div>
        </div>

        <nav className="flex-1 px-3 pb-4" aria-label="Navigation admin">
          <ul className="space-y-0.5">
            {NAV.map(({ href, label, icon }) => {
              const actif = href === "/admin" ? chemin === "/admin" : chemin.startsWith(href);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    className={`flex items-center gap-3 rounded-[12px] px-3 py-2.5 font-text text-sm font-medium transition-colors duration-150 ${
                      actif
                        ? "bg-accent text-white"
                        : "text-text-body hover:bg-accent/5 hover:text-text-title"
                    }`}
                  >
                    {icon}
                    <span>{label}</span>
                    {label === "Messages" && nonLus ? (
                      <span className="ml-auto rounded-full bg-error px-2 py-0.5 font-text text-[10px] font-bold text-white">
                        {nonLus > 99 ? "99+" : nonLus}
                      </span>
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="border-t border-white/60 px-4 py-5">
          {email ? (
            <p className="mb-3 truncate font-text text-xs text-text-muted" title={email}>
              {email}
            </p>
          ) : null}
          <button
            onClick={surDeconnexion}
            disabled={sortieEnCours}
            className="flex w-full items-center gap-2 rounded-[10px] px-3 py-2 font-text text-sm text-text-body transition-colors hover:bg-error/8 hover:text-error disabled:opacity-50"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M6 2H3a1 1 0 00-1 1v10a1 1 0 001 1h3M11 11l3-3-3-3M14 8H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {sortieEnCours ? "Déconnexion…" : "Se déconnecter"}
          </button>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 flex items-center gap-2 rounded-[10px] px-3 py-2 font-text text-sm text-text-muted transition-colors hover:text-text-title"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M8 1a7 7 0 100 14A7 7 0 008 1z" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M5 8h6M8 5l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Voir le portfolio
          </a>
        </div>
      </aside>

      {/* Header mobile */}
      <div className="fixed inset-x-0 top-0 z-20 flex h-14 items-center justify-between border-b border-white/60 bg-gradient-to-r from-bg-card-start to-bg-card-end px-4 lg:hidden">
        <div className="flex items-center gap-2.5">
          <div className="relative w-7 h-7 shrink-0">
            <Image
              src="/logo.png"
              alt="Logo KoniG.dev"
              fill
              sizes="28px"
              className="object-contain"
            />
          </div>
          <p className="font-display text-base font-extrabold text-text-title">Administration</p>
        </div>
        <button
          onClick={() => setMenuOuvert((v) => !v)}
          className="rounded-[10px] p-2 text-text-body hover:bg-accent/5"
          aria-label={menuOuvert ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={menuOuvert}
        >
          {menuOuvert ? (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          )}
        </button>
      </div>

      {/* Drawer mobile */}
      {menuOuvert && (
        <div
          className="fixed inset-0 z-30 bg-accent/20 lg:hidden"
          onClick={() => setMenuOuvert(false)}
        >
          <nav
            className="absolute left-0 top-0 h-full w-64 border-r border-white/60 bg-gradient-to-b from-bg-card-start to-bg-card-end p-4 pt-16"
            onClick={(e) => e.stopPropagation()}
            aria-label="Navigation admin mobile"
          >
            <ul className="space-y-0.5">
              {NAV.map(({ href, label, icon }) => {
                const actif = href === "/admin" ? chemin === "/admin" : chemin.startsWith(href);
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      onClick={() => setMenuOuvert(false)}
                      className={`flex items-center gap-3 rounded-[12px] px-3 py-3 font-text text-sm font-medium ${
                        actif ? "bg-accent text-white" : "text-text-body hover:bg-accent/5"
                      }`}
                    >
                      {icon}
                      {label}
                      {label === "Messages" && nonLus ? (
                        <span className="ml-auto rounded-full bg-error px-2 py-0.5 text-[10px] font-bold text-white">
                          {nonLus}
                        </span>
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
            <div className="mt-6 border-t border-white/60 pt-4">
              <button
                onClick={surDeconnexion}
                className="flex items-center gap-2 rounded-[10px] px-3 py-2 font-text text-sm text-text-body hover:text-error"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M6 2H3a1 1 0 00-1 1v10a1 1 0 001 1h3M11 11l3-3-3-3M14 8H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Se déconnecter
              </button>
            </div>
          </nav>
        </div>
      )}

      {/* Contenu principal */}
      <main className="min-w-0 flex-1 pt-14 lg:pt-0">
        {children}
      </main>
    </div>
  );
}

