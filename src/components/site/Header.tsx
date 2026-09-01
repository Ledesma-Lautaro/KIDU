import Link from "next/link";
import { siteConfig } from "@/lib/site";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-tinta text-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="titulo-display text-2xl tracking-tight text-white sm:text-3xl"
          aria-label={`${siteConfig.nombre} — ir al inicio`}
        >
          {siteConfig.nombre}
          <span className="text-violeta">.</span>
        </Link>

        <p className="hidden text-xs uppercase tracking-[0.2em] text-white/50 md:block">
          {siteConfig.tagline}
        </p>

        <Link
          href="/#catalogo"
          className="rounded-full bg-violeta px-4 py-2 text-sm font-semibold text-white transition hover:bg-violeta-claro"
        >
          Ver catálogo
        </Link>
      </div>
    </header>
  );
}
