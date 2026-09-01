import type { Metadata } from "next";
import { Archivo, Archivo_Black } from "next/font/google";
import { siteConfig } from "@/lib/site";
import "./globals.css";

const sans = Archivo({
  subsets: ["latin"],
  variable: "--fuente-sans",
  display: "swap",
});

const display = Archivo_Black({
  subsets: ["latin"],
  weight: "400",
  variable: "--fuente-display",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.nombre} — ${siteConfig.tagline}`,
    template: `%s · ${siteConfig.nombre}`,
  },
  description: siteConfig.descripcion,
  openGraph: {
    title: `${siteConfig.nombre} — ${siteConfig.tagline}`,
    description: siteConfig.descripcion,
    type: "website",
    locale: "es_AR",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es-AR" className={`${sans.variable} ${display.variable}`}>
      <body className="min-h-dvh antialiased">{children}</body>
    </html>
  );
}
