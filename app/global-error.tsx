"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global Error:", error);
  }, [error]);

  return (
    <html lang="fr">
      <body className="flex min-h-screen items-center justify-center bg-[#EEF2F7] px-6 text-[#22252A]">
        <div className="w-full max-w-md rounded-[28px] border border-white/80 bg-gradient-to-br from-[#F4F7FA] to-[#EDF1F6] p-8 text-center shadow-[0_20px_60px_rgba(120,130,145,0.18)]">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-[14px] bg-[#22252A]/5 text-[#B3261E]">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h2 className="text-xl font-extrabold">Une erreur est survenue</h2>
          <p className="mt-2 text-sm text-[#4A5663]">
            Un problème inattendu s&apos;est produit.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <button
              onClick={() => reset()}
              className="h-10 rounded-[12px] bg-[#22252A] px-5 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(20,22,26,0.3)] hover:bg-[#14161A] transition-colors"
            >
              Réessayer
            </button>
            <a
              href="/"
              className="flex h-10 items-center justify-center rounded-[12px] border border-white/80 bg-[#EEF2F7] px-5 text-sm font-semibold text-[#4A5663] shadow-[inset_3px_3px_7px_rgba(120,130,145,0.2),inset_-3px_-3px_7px_rgba(255,255,255,0.95)] hover:text-[#22252A] transition-colors"
            >
              Accueil
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}

