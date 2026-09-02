import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FormularioZapatilla } from "@/components/admin/FormularioZapatilla";
import { prisma } from "@/lib/prisma";

type Props = { params: Promise<{ id: string }> };

export const metadata: Metadata = { title: "Editar zapatilla" };

export default async function PaginaEditar({ params }: Props) {
  const { id } = await params;

  const [zapatilla, marcas, colores] = await Promise.all([
    prisma.zapatilla
      .findUnique({
        where: { id },
        include: { talles: { orderBy: { talle: "asc" } } },
      })
      .catch(() => null),
    prisma.zapatilla
      .findMany({
        distinct: ["marca"],
        select: { marca: true },
        orderBy: { marca: "asc" },
      })
      .catch(() => []),
    prisma.zapatilla
      .findMany({
        where: { color: { not: null } },
        distinct: ["color"],
        select: { color: true },
        orderBy: { color: "asc" },
      })
      .catch(() => []),
  ]);

  if (!zapatilla) notFound();

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-gris">
            Editando
          </p>
          <h1 className="titulo-display text-4xl">
            {zapatilla.marca} {zapatilla.modelo}
          </h1>
        </div>

        <Link
          href={`/zapatilla/${zapatilla.id}`}
          target="_blank"
          className="text-sm text-gris transition hover:text-tinta"
        >
          Ver en el sitio ↗
        </Link>
      </div>

      <FormularioZapatilla
        marcasExistentes={marcas.map((m) => m.marca)}
        coloresExistentes={colores
          .map((c) => c.color)
          .filter((c): c is string => Boolean(c))}
        inicial={{
          id: zapatilla.id,
          marca: zapatilla.marca,
          modelo: zapatilla.modelo,
          categoria: zapatilla.categoria,
          color: zapatilla.color ?? "",
          precio: String(zapatilla.precio),
          descripcion: zapatilla.descripcion ?? "",
          imagenes: zapatilla.imagenes,
          talles: zapatilla.talles.map((t) => ({
            talle: t.talle,
            stock: t.stock,
          })),
          activo: zapatilla.activo,
        }}
      />
    </div>
  );
}
