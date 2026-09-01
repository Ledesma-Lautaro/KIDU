import Image from "next/image";
import Link from "next/link";
import { BotonEliminar, InterruptorActivo } from "@/components/admin/AccionesFila";
import { BuscadorAdmin } from "@/components/admin/BuscadorAdmin";
import { labelCategoria } from "@/lib/categorias";
import { formatearPrecio, formatearTalle } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import type { ZapatillaConTalles } from "@/lib/tipos";

export default async function PaginaListado({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const busqueda = q.trim();

  let zapatillas: ZapatillaConTalles[] = [];
  let errorDb: string | null = null;

  try {
    zapatillas = await prisma.zapatilla.findMany({
      where: busqueda
        ? {
            OR: [
              { marca: { contains: busqueda, mode: "insensitive" } },
              { modelo: { contains: busqueda, mode: "insensitive" } },
            ],
          }
        : undefined,
      orderBy: { updatedAt: "desc" },
      include: { talles: { orderBy: { talle: "asc" } } },
    });
  } catch (error) {
    console.error("[admin] No se pudo leer la base de datos:", error);
    errorDb =
      "No se pudo conectar con la base de datos. Revisá DATABASE_URL y que las tablas estén creadas (npm run db:push).";
  }

  const activas = zapatillas.filter((z) => z.activo).length;

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="titulo-display text-4xl">Catálogo</h1>
          <p className="mt-2 text-sm text-gris">
            {zapatillas.length}{" "}
            {zapatillas.length === 1 ? "modelo cargado" : "modelos cargados"} ·{" "}
            {activas} visible{activas === 1 ? "" : "s"} en el sitio
          </p>
        </div>
        <BuscadorAdmin valorInicial={busqueda} />
      </div>

      {errorDb && (
        <p
          role="alert"
          className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {errorDb}
        </p>
      )}

      {zapatillas.length === 0 && !errorDb ? (
        <div className="rounded-marco border border-dashed border-borde bg-white px-6 py-20 text-center">
          <p className="titulo-display text-2xl">
            {busqueda ? "Sin resultados" : "Todavía no cargaste nada"}
          </p>
          <p className="mx-auto mt-3 max-w-sm text-sm text-gris">
            {busqueda
              ? "Probá con otra marca o modelo."
              : "Cargá tu primer modelo y va a aparecer en el catálogo al instante."}
          </p>
          {!busqueda && (
            <Link
              href="/admin/nueva"
              className="mt-6 inline-block rounded-xl bg-violeta px-6 py-3 font-semibold text-white transition hover:bg-violeta-oscuro"
            >
              + Cargar zapatilla
            </Link>
          )}
        </div>
      ) : (
        <ul className="space-y-3">
          {zapatillas.map((z) => {
            const disponibles = z.talles.filter((t) => t.stock);
            return (
              <li
                key={z.id}
                className={`flex flex-wrap items-center gap-4 rounded-2xl border border-borde bg-white p-4 transition ${
                  z.activo ? "" : "opacity-60"
                }`}
              >
                <div className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-humo">
                  {z.imagenes[0] ? (
                    <Image
                      src={z.imagenes[0]}
                      alt=""
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  ) : (
                    <span className="flex h-full items-center justify-center text-[9px] uppercase text-gris">
                      Sin foto
                    </span>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gris">
                    {z.marca} · {labelCategoria(z.categoria)}
                  </p>
                  <p className="truncate font-semibold text-tinta">{z.modelo}</p>
                  <p className="mt-0.5 text-sm text-gris">
                    {formatearPrecio(z.precio)}
                    {z.talles.length > 0 && (
                      <>
                        {" · "}
                        {disponibles.length}/{z.talles.length} talles
                        {disponibles.length > 0 && (
                          <span className="ml-1 text-tinta/60">
                            (
                            {disponibles
                              .slice(0, 5)
                              .map((t) => formatearTalle(t.talle))
                              .join(", ")}
                            {disponibles.length > 5 ? "…" : ""})
                          </span>
                        )}
                      </>
                    )}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <InterruptorActivo id={z.id} activo={z.activo} />
                  <Link
                    href={`/admin/${z.id}`}
                    className="rounded-lg border border-borde px-4 py-2 text-sm font-semibold text-tinta transition hover:border-tinta"
                  >
                    Editar
                  </Link>
                  <BotonEliminar
                    id={z.id}
                    nombre={`${z.marca} ${z.modelo}`}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
