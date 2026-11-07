import Link from "next/link";
import Image from "next/image";

export default function NotFound() {
  return (
    <main className="min-h-screen w-full flex flex-col items-center justify-center p-6 bg-gradient-to-b from-[#EEF2F7] via-[#F5F8FC] to-[#EEF2F7] text-center">
      <div className="w-full max-w-lg p-8 sm:p-12 rounded-[28px] bg-gradient-to-br from-[#F4F7FA] to-[#EDF1F6] border border-white/95 shadow-contact-card flex flex-col items-center">
        <div className="relative w-14 h-14 mb-4">
          <Image
            src="/logo.png"
            alt="Logo KoniG.dev"
            fill
            sizes="56px"
            priority
            className="object-contain"
          />
        </div>
        <span className="font-mono text-xs uppercase tracking-widest text-[#6B7480] block mb-2">
          Erreur 404
        </span>
        <h1 className="font-display font-black text-4xl sm:text-5xl text-[#22252A] tracking-tight mb-4">
          Page introuvable
        </h1>
        <p className="font-text text-sm text-[#4A5663] leading-relaxed mb-8">
          La page que vous recherchez n&apos;existe pas ou a été déplacée.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-gradient-to-r from-[#3A3F46] to-[#14161A] text-white font-text text-xs font-bold uppercase tracking-wider shadow-btn-submit hover:-translate-y-0.5 transition-all"
        >
          Retourner à l&apos;accueil
        </Link>
      </div>
    </main>
  );
}

