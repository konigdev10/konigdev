import type { Config, ThemeConfig } from "tailwindcss/types/config";

/**
 * Les couleurs du thème sont des variables CSS. Tailwind ne sait pas appliquer
 * un modificateur /50 sur une valeur en var() : sans cette forme fonction,
 * « bg-primary/10 » rendait un vert totalement opaque. Le repli color-mix garde
 * un unique hex par token (--accent, --surface…) et ses paliers alpha en dérivent.
 */
function token(cssVar: string) {
  return ({ opacityValue }: { opacityValue?: string }) => {
    const alpha = Number(opacityValue);
    if (!Number.isFinite(alpha) || alpha >= 1) return cssVar;
    return `color-mix(in srgb, ${cssVar} ${(alpha * 100).toFixed(4)}%, transparent)`;
  };
}

const colors = {
  /* ── Tokens de design éditorial sombre ── */
  background: token("var(--background)"),
  surface: {
    DEFAULT: token("var(--surface)"),
    card: token("var(--surface-card)"),
    elevated: token("var(--surface-elevated)"),
  },
  "on-surface": {
    DEFAULT: token("var(--on-surface)"),
    variant: token("var(--on-surface-variant)"),
  },
  outline: {
    DEFAULT: token("var(--outline)"),
    strong: token("var(--outline-strong)"),
  },
  primary: {
    DEFAULT: token("var(--primary)"),
    hover: token("var(--primary-hover)"),
    muted: token("var(--primary-muted)"),
  },
  "on-primary": token("var(--on-primary)"),
  /* Paliers alpha nommés, pour les traits fins de l'anneau et du hero. */
  accent: {
    DEFAULT: token("var(--accent)"),
    line: token("var(--accent-line)"),
    hair: token("var(--accent-hair)"),
    faint: token("var(--accent-faint)"),
    dark: token("var(--accent-dark)"),
    light: token("var(--accent-light)"),
  },
  "bg-page": token("var(--bg-page)"),
  "bg-card-start": token("var(--bg-card-start)"),
  "bg-card-end": token("var(--bg-card-end)"),
  "text-title": token("var(--text-title)"),
  "text-body": token("var(--text-body)"),
  "text-muted": token("var(--text-muted)"),
  error: token("var(--error)"),
};

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      /* Valeurs fonction supportées à l'exécution, absentes du type public. */
      colors: colors as unknown as ThemeConfig["colors"],
      fontFamily: {
        heading: ["var(--font-heading)", "sans-serif"],
        display: ["var(--font-display)", "sans-serif"],
        serif: ["var(--font-serif)", "serif"],
        sans: ["var(--font-sans)", "sans-serif"],
        text: ["var(--font-text)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      boxShadow: {
        glow: "var(--shadow-glow)",
        card: "var(--shadow-card)",
        glass: "var(--shadow-glass)",
        "soft-card": "var(--shadow-soft-card)",
        "ambient-orb": "var(--shadow-ambient-orb)",
        charcoal: "var(--shadow-charcoal)",
        floating: "var(--shadow-card)",
        "inset-field": "var(--shadow-inset-field)",
        "contact-card": "var(--shadow-contact-card)",
        "btn-submit": "var(--shadow-btn-submit)",
        "pill-relief": "var(--shadow-pill-relief)",
      },
      borderRadius: {
        "2xl": "16px",
        "3xl": "24px",
        "4xl": "32px",
      },
      transitionTimingFunction: {
        editorial: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
    },
  },
  plugins: [],
};
export default config;
