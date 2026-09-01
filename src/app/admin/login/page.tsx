import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { FormularioLogin } from "@/components/admin/FormularioLogin";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Ingresar al panel",
  robots: { index: false, follow: false },
};

export default async function PaginaLogin() {
  const sesion = await auth();
  if (sesion?.user) redirect("/admin");

  return (
    <main className="flex min-h-dvh items-center justify-center bg-humo px-4 py-16">
      <div className="w-full max-w-sm">
        <Link
          href="/"
          className="titulo-display block text-center text-4xl text-tinta"
        >
          {siteConfig.nombre}
          <span className="text-violeta">.</span>
        </Link>

        <div className="mt-8 rounded-marco border border-borde bg-white p-8">
          <h1 className="titulo-display text-2xl">Panel de carga</h1>
          <p className="mb-6 mt-2 text-sm text-gris">
            Acceso solo para administradores.
          </p>

          <FormularioLogin />
        </div>

        <p className="mt-6 text-center text-sm text-gris">
          <Link href="/" className="hover:text-tinta">
            ← Volver al catálogo
          </Link>
        </p>
      </div>
    </main>
  );
}
