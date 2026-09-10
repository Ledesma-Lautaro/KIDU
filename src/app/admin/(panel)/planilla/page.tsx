import type { Metadata } from "next";
import { Planilla, type FilaPlanilla } from "@/components/admin/Planilla";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Planilla" };

export default async function PaginaPlanilla() {
  const zapatillas = await prisma.zapatilla
    .findMany({
      orderBy: [{ activo: "asc" }, { marca: "asc" }, { modelo: "asc" }],
      include: { talles: { orderBy: { talle: "asc" } } },
    })
    .catch(() => null);

  if (!zapatillas) {
    return (
      <p
        role="alert"
        className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
      >
        No se pudo conectar con la base de datos.
      </p>
    );
  }

  const filas: FilaPlanilla[] = zapatillas.map((z) => ({
    id: z.id,
    marca: z.marca,
    modelo: z.modelo,
    color: z.color ?? "",
    categoria: z.categoria,
    precio: z.precio,
    imagen: z.imagenes[0] ?? null,
    cantidadImagenes: z.imagenes.length,
    talles: z.talles.map((t) => t.talle),
    activo: z.activo,
  }));

  return (
    <div>
      <div className="mb-6">
        <h1 className="titulo-display text-4xl">Planilla</h1>
        <p className="mt-2 max-w-3xl text-sm text-gris">
          Completá precio y talles de muchos modelos seguido. Enter guarda la
          fila. Los talles van en BR, con rangos: <strong>38-42, 44</strong>.
          Los talles nuevos entran con stock; los agotados se marcan en la ficha
          completa. Para publicar hacen falta foto, precio y al menos un talle.
        </p>
      </div>

      <Planilla filas={filas} />
    </div>
  );
}
