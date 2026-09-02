import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { cerrarSesion } from "@/app/admin/actions";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: { default: "Panel", template: "%s · Panel KIDU" },
  robots: { index: false, follow: false },
};

export default async function LayoutPanel({
  children,
}: {
  children: React.ReactNode;
}) {
  const sesion = await auth();
  if (!sesion?.user) redirect("/admin/login");

  return (
    <div className="min-h-dvh bg-humo">
      <header className="border-b border-borde bg-tinta text-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="titulo-display text-xl">
              {siteConfig.nombre}
              <span className="text-violeta">.</span>
              <span className="ml-2 text-xs font-normal tracking-widest text-white/50">
                ADMIN
              </span>
            </Link>

            <nav className="hidden items-center gap-4 text-sm sm:flex">
              <Link href="/admin" className="text-white/70 hover:text-white">
                Catálogo
              </Link>
              <Link
                href="/"
                target="_blank"
                className="text-white/70 hover:text-white"
              >
                Ver sitio ↗
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/nueva"
              className="rounded-full bg-violeta px-4 py-2 text-sm font-semibold text-white transition hover:bg-violeta-claro"
            >
              + Nueva
            </Link>
            <form action={cerrarSesion}>
              <button
                type="submit"
                className="text-sm text-white/60 transition hover:text-white"
              >
                Salir
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">{children}</main>
    </div>
  );
}
