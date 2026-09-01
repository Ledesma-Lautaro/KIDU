import Link from "next/link";
import { aQueryString, type FiltrosCatalogo } from "@/lib/filtros";

/** Devuelve los números de página a mostrar, con "…" donde se saltea. */
function ventana(actual: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const paginas = new Set<number>([1, total, actual - 1, actual, actual + 1]);
  const ordenadas = [...paginas]
    .filter((p) => p >= 1 && p <= total)
    .sort((a, b) => a - b);

  const resultado: (number | "…")[] = [];
  ordenadas.forEach((p, i) => {
    if (i > 0 && p - ordenadas[i - 1] > 1) resultado.push("…");
    resultado.push(p);
  });
  return resultado;
}

export function Paginacion({
  filtros,
  paginas,
}: {
  filtros: FiltrosCatalogo;
  paginas: number;
}) {
  if (paginas <= 1) return null;

  const actual = Math.min(filtros.pagina, paginas);
  const href = (p: number) => `/${aQueryString({ ...filtros, pagina: p })}#catalogo`;

  return (
    <nav
      aria-label="Paginación del catálogo"
      className="mt-14 flex items-center justify-center gap-2"
    >
      <Link
        href={href(Math.max(1, actual - 1))}
        aria-disabled={actual === 1}
        scroll={false}
        className={`rounded-xl border border-borde px-4 py-2.5 text-sm font-semibold transition ${
          actual === 1
            ? "pointer-events-none opacity-40"
            : "hover:border-tinta"
        }`}
      >
        Anterior
      </Link>

      <div className="hidden items-center gap-1 sm:flex">
        {ventana(actual, paginas).map((p, i) =>
          p === "…" ? (
            <span key={`gap-${i}`} className="px-2 text-gris">
              …
            </span>
          ) : (
            <Link
              key={p}
              href={href(p)}
              scroll={false}
              aria-current={p === actual ? "page" : undefined}
              className={`min-w-10 rounded-xl px-3 py-2.5 text-center text-sm font-semibold transition ${
                p === actual
                  ? "bg-tinta text-white"
                  : "border border-borde hover:border-tinta"
              }`}
            >
              {p}
            </Link>
          )
        )}
      </div>

      <span className="text-sm text-gris sm:hidden">
        {actual} / {paginas}
      </span>

      <Link
        href={href(Math.min(paginas, actual + 1))}
        aria-disabled={actual === paginas}
        scroll={false}
        className={`rounded-xl border border-borde px-4 py-2.5 text-sm font-semibold transition ${
          actual === paginas
            ? "pointer-events-none opacity-40"
            : "hover:border-tinta"
        }`}
      >
        Siguiente
      </Link>
    </nav>
  );
}
