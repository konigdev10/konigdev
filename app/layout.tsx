import type { Metadata } from "next";
import {
  Bricolage_Grotesque,
  Instrument_Serif,
  Plus_Jakarta_Sans,
  JetBrains_Mono,
  Syne,
} from "next/font/google";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://konigdev.com"
  ),
  title: "Esdras Thychel MBOULOUKOUE | KoniG.dev — Développeur Full-Stack & IA Freelance",
  description:
    "Portfolio d'Esdras Thychel MBOULOUKOUE (KoniG.dev), développeur full-stack et IA freelance basé à Brazzaville. Applications web modernes, agents IA et architectures logicielles sur-mesure pour fondateurs et équipes.",
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },
      { url: "/favicon-16x16.png", type: "image/png", sizes: "16x16" },
      { url: "/logo.png", type: "image/png" },
      { url: "/favicon.png", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title:
      "Esdras Thychel MBOULOUKOUE | KoniG.dev — Développeur Full-Stack & IA Freelance",
    description:
      "Applications web modernes, agents IA et architectures logicielles sur-mesure pour fondateurs et équipes.",
    url: "https://konigdev.com",
    siteName: "KoniG.dev",
    locale: "fr_FR",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "KoniG.dev — Développeur Full-Stack & IA Freelance",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Esdras Thychel MBOULOUKOUE | KoniG.dev",
    description:
      "Applications web modernes, agents IA et architectures logicielles sur-mesure pour fondateurs et équipes.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${bricolage.variable} ${instrumentSerif.variable} ${jakarta.variable} ${mono.variable} ${syne.variable}`}
    >
      <body className="bg-background text-on-surface font-sans antialiased selection:bg-primary selection:text-on-primary">
        {children}
      </body>
    </html>
  );
}
