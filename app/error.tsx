"use client";

import { useEffect } from "react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Route Error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-6">
      <div className="w-full max-w-md rounded-[28px] border border-white/80 bg-gradient-to-br from-bg-card-start to-bg-card-end p-8 text-center shadow-contact-card">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-[14px] bg-accent/5 text-error">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <h2 className="font-display text-xl font-extrabold text-text-title">Une erreur est survenue</h2>
        <p className="mt-2 font-text text-sm text-text-body">
          Impossible de charger cette section.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <button
            onClick={() => reset()}
            className="h-10 rounded-[12px] bg-accent px-5 font-text text-sm font-semibold text-white shadow-btn-submit hover:bg-accent-dark transition-colors"
          >
            Réessayer
          </button>
          <a
            href="/"
            className="flex h-10 items-center justify-center rounded-[12px] border border-white/80 bg-bg-page px-5 font-text text-sm font-semibold text-text-body shadow-inset-field hover:text-text-title transition-colors"
          >
            Accueil
          </a>
        </div>
      </div>
    </div>
  );
}

