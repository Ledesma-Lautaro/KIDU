import Link from "next/link";
import { siteConfig } from "@/lib/site";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-borde bg-tinta text-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-12 sm:px-6 md:flex-row md:items-end md:justify-between lg:px-8">
        <div>
          <p className="titulo-display text-4xl">
            {siteConfig.nombre}
            <span className="text-violeta">.</span>
          </p>
          <p className="mt-2 max-w-sm text-sm text-white/60">
            {siteConfig.descripcion}
          </p>
        </div>

        <div className="text-sm text-white/60">
          <p>
            Consultas y disponibilidad por{" "}
            <span className="font-semibold text-white">WhatsApp</span>.
          </p>
          <p className="mt-4 text-xs text-white/40">
            © {new Date().getFullYear()} {siteConfig.nombre}. Precios en pesos
            argentinos.{" "}
            <Link href="/admin" className="underline hover:text-white/70">
              Admin
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
