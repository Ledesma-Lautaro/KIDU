import Link from "next/link";
import { siteConfig } from "@/lib/site";
import { Zapa } from "@/components/marca/Zapa";

export function Footer() {
  return (
    <footer className="grano relative mt-24 overflow-hidden bg-tinta text-white">
      <div
        aria-hidden="true"
        className="anim-latir pointer-events-none absolute -left-20 -top-24 size-[26rem] rounded-full bg-violeta-electrico/25 blur-[110px]"
      />
      <div
        aria-hidden="true"
        style={{ animationDelay: "2s" }}
        className="anim-latir pointer-events-none absolute -bottom-32 right-0 size-[24rem] rounded-full bg-violeta-profundo/35 blur-[110px]"
      />

      <div
        aria-hidden="true"
        className="anim-flotar pointer-events-none absolute -right-4 top-6 w-[38%] opacity-15 sm:w-[26%]"
        style={{ "--giro": "-8deg" } as React.CSSProperties}
      >
        <Zapa
          className="h-auto w-full"
          cuerpo="var(--color-violeta-neon)"
          suela="var(--color-violeta)"
          detalle="var(--color-violeta-noche)"
          espejada
        />
      </div>

      <div className="relative mx-auto flex max-w-7xl flex-col gap-6 px-4 py-14 sm:px-6 md:flex-row md:items-end md:justify-between lg:px-8">
        <div>
          <p className="titulo-display text-5xl">
            <span className="bg-gradient-to-r from-white via-white to-violeta-neon bg-clip-text text-transparent">
              {siteConfig.nombre}
            </span>
            <span className="text-violeta">.</span>
          </p>
          <p className="mt-3 max-w-sm text-sm text-white/50">
            {siteConfig.descripcion}
          </p>
        </div>

        <div className="text-sm text-white/50">
          <p>
            Consultas y disponibilidad por{" "}
            <span className="font-semibold text-white">WhatsApp</span>.
          </p>
          <p className="mt-4 text-xs text-white/30">
            © {new Date().getFullYear()} {siteConfig.nombre}. Precios en pesos
            argentinos.{" "}
            <Link href="/admin" className="underline hover:text-white/60">
              Admin
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
