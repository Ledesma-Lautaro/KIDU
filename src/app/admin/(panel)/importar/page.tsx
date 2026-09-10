import type { Metadata } from "next";
import Link from "next/link";
import { Importador } from "@/components/admin/Importador";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Importar fotos" };

export default async function PaginaImportar() {
  const modelos = await prisma.zapatilla
    .findMany({
      distinct: ["modelo"],
      select: { modelo: true },
      orderBy: { modelo: "asc" },
    })
    .catch(() => []);

  return (
    <div>
      <div className="mb-8">
        <h1 className="titulo-display text-4xl">Importar fotos</h1>
        <p className="mt-2 max-w-2xl text-sm text-gris">
          Elegí la carpeta del catálogo: cada subcarpeta se toma como marca.
          Agrupá las fotos de cada modelo y guardalas como borradores ocultos.
          Después completás precio y talles en la{" "}
          <Link href="/admin/planilla" className="font-semibold text-violeta underline">
            planilla
          </Link>
          . Las fotos HEIC de iPhone se convierten solas.
        </p>
      </div>

      <Importador modelosExistentes={modelos.map((m) => m.modelo)} />
    </div>
  );
}
