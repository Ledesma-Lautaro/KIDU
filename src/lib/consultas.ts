import { Prisma } from "@prisma/client";
import { prisma } from "./prisma";
import { POR_PAGINA, type FiltrosCatalogo, type Orden } from "./filtros";

function construirWhere(f: FiltrosCatalogo): Prisma.ZapatillaWhereInput {
  const where: Prisma.ZapatillaWhereInput = { activo: true };

  if (f.q) {
    where.OR = [
      { marca: { contains: f.q, mode: "insensitive" } },
      { modelo: { contains: f.q, mode: "insensitive" } },
    ];
  }
  if (f.marcas.length) where.marca = { in: f.marcas };
  if (f.categorias.length) where.categoria = { in: f.categorias };

  if (f.precioMin !== null || f.precioMax !== null) {
    where.precio = {
      ...(f.precioMin !== null ? { gte: f.precioMin } : {}),
      ...(f.precioMax !== null ? { lte: f.precioMax } : {}),
    };
  }

  // "Talle disponible": al menos un talle de la lista con stock.
  if (f.talles.length) {
    where.talles = { some: { talle: { in: f.talles }, stock: true } };
  }

  return where;
}

function construirOrden(
  orden: Orden
): Prisma.ZapatillaOrderByWithRelationInput[] {
  switch (orden) {
    case "precio-asc":
      return [{ precio: "asc" }, { createdAt: "desc" }];
    case "precio-desc":
      return [{ precio: "desc" }, { createdAt: "desc" }];
    default:
      return [{ createdAt: "desc" }];
  }
}

export async function buscarZapatillas(f: FiltrosCatalogo) {
  const where = construirWhere(f);

  const [total, zapatillas] = await Promise.all([
    prisma.zapatilla.count({ where }),
    prisma.zapatilla.findMany({
      where,
      orderBy: construirOrden(f.orden),
      skip: (f.pagina - 1) * POR_PAGINA,
      take: POR_PAGINA,
      include: { talles: { orderBy: { talle: "asc" } } },
    }),
  ]);

  return {
    zapatillas,
    total,
    paginas: Math.max(1, Math.ceil(total / POR_PAGINA)),
  };
}

/** Opciones para armar los filtros, calculadas sobre el catálogo activo. */
export async function obtenerFacetas() {
  const [marcas, talles, rango] = await Promise.all([
    prisma.zapatilla.findMany({
      where: { activo: true },
      distinct: ["marca"],
      select: { marca: true },
      orderBy: { marca: "asc" },
    }),
    prisma.talle.findMany({
      where: { stock: true, zapatilla: { activo: true } },
      distinct: ["talle"],
      select: { talle: true },
      orderBy: { talle: "asc" },
    }),
    prisma.zapatilla.aggregate({
      where: { activo: true },
      _min: { precio: true },
      _max: { precio: true },
    }),
  ]);

  return {
    marcas: marcas.map((m) => m.marca),
    talles: talles.map((t) => t.talle),
    precioMin: rango._min.precio ?? 0,
    precioMax: rango._max.precio ?? 0,
  };
}

export async function obtenerZapatilla(id: string) {
  return prisma.zapatilla.findFirst({
    where: { id, activo: true },
    include: { talles: { orderBy: { talle: "asc" } } },
  });
}

export async function obtenerRelacionadas(
  id: string,
  categoria: string,
  cantidad = 4
) {
  return prisma.zapatilla.findMany({
    where: { activo: true, categoria, id: { not: id } },
    orderBy: { createdAt: "desc" },
    take: cantidad,
    include: { talles: { orderBy: { talle: "asc" } } },
  });
}
