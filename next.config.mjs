/**
 * Configuration Next.js.
 *
 * Choix de sécurité pilotés depuis ce fichier :
 *  - images.unoptimized : true
 *    Neutralise la surface d'attaque de l'API d'optimisation d'images
 *    (/_next/image), visée par deux RCE critiques (AVIF et SVG). Les visuels
 *    sont servis tels quels ; les uploads de l'admin sont déjà redimensionnés
 *    par sharp avant d'atteindre Storage.
 *  - Aucune règle `rewrites` : l'advisory de SSRF par hostname de destination
 *    attacker-controlled ne s'applique qu'aux rewrites. Ne jamais en ajouter
 *    sans réévaluer ce point (voir SECURITY.md).
 *  - Les en-têtes porteurs d'un nonce (Content-Security-Policy) sont posés par
 *    middleware.ts, car le nonce doit être différent à chaque requête.
 */

/** @type {{ key: string; value: string }[]} */
const ADMIN_EN_TETES = [
  { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
  {
    key: "Cache-Control",
    value: "no-store, no-cache, must-revalidate, private",
  },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  images: {
    unoptimized: true,
  },

  experimental: {
    // sharp charge des binaires natifs : hors bundle serveur, sinon le
    // bundlage Webpack échoue au build Vercel.
    serverComponentsExternalPackages: ["sharp"],
    serverActions: {
      // Le formulaire d'un projet transporte une image jusqu'à 3 Mo plus les
      // champs texte. Au-delà, Next rejette la requête avant l'action serveur.
      bodySizeLimit: "4mb",
    },
  },

  async headers() {
    return [
      {
        // En-têtes fixes sur toutes les routes, y compris celles que le
        // middleware ne couvre pas (assets statiques).
        source: "/:path*",
        headers: [
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value:
              "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
          {
            // Indices d'appareil demandés au navigateur (lib/device.ts).
            key: "Accept-CH",
            value: "Sec-CH-UA-Model, Sec-CH-UA-Platform-Version",
          },
        ],
      },
      {
        // L'espace d'administration n'est jamais indexé ni mis en cache.
        // Deux règles : "/admin/:path*" ne couvre pas la page elle-même.
        source: "/admin",
        headers: ADMIN_EN_TETES,
      },
      {
        source: "/admin/:path*",
        headers: ADMIN_EN_TETES,
      },
    ];
  },
};

export default nextConfig;
