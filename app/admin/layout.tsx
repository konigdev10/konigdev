import type { Metadata } from "next";

/**
 * Enveloppe de toute l'administration.
 *
 * Elle ne contient AUCUN composant du site public : pas de rideau d'intro, pas
 * de défilement doux, pas de curseur personnalisé. Un espace de travail avec
 * formulaires et tableaux doit rester un document au défilement natif.
 *
 * Le contrôle d'accès n'est pas ici : /admin/login et /admin/mfa doivent être
 * accessibles sans session. Ce sont le middleware, chaque page protégée et
 * chaque action qui vérifient leur propre accès (lib/security/guard.ts).
 */

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { default: "Administration KoniG.dev", template: "%s — Administration KoniG.dev" },
  robots: {
    index: false,
    follow: false,
    noarchive: true,
    nosnippet: true,
    noimageindex: true,
  },
};

export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen bg-bg-page font-text text-text-body">
      {children}
    </div>
  );
}
