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
  title: "Esdras Thychel MBOULOUKOUE | KoniG.dev — Développeur Full-Stack & IA Freelance",
  description:
    "Portfolio d'Esdras Thychel MBOULOUKOUE (KoniG.dev), développeur full-stack et IA freelance basé à Brazzaville. Applications web modernes, agents IA et architectures logicielles sur-mesure pour fondateurs et équipes.",
  icons: {
    icon: [
      { url: "/logo.png", type: "image/png" },
      { url: "/favicon.png", type: "image/png" },
    ],
    shortcut: "/logo.png",
    apple: "/logo.png",
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
