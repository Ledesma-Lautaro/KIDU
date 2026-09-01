import type { Metadata } from "next";
import { FormularioZapatilla } from "@/components/admin/FormularioZapatilla";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Nueva zapatilla" };

export default async function PaginaNueva() {
  // Se usan para autocompletar el campo "marca" y no repetir tipeos.
  const marcas = await prisma.zapatilla
    .findMany({
      distinct: ["marca"],
      select: { marca: true },
      orderBy: { marca: "asc" },
    })
    .catch(() => []);

  return (
    <div>
      <div className="mb-8">
        <h1 className="titulo-display text-4xl">Nueva zapatilla</h1>
        <p className="mt-2 text-sm text-gris">
          Al usar «Guardar y cargar otra» se conservan la marca y la categoría,
          para cargar en tandas más rápido.
        </p>
      </div>

      <FormularioZapatilla marcasExistentes={marcas.map((m) => m.marca)} />
    </div>
  );
}
