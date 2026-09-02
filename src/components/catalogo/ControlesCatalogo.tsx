"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CATEGORIAS, labelCategoria } from "@/lib/categorias";
import {
  aQueryString,
  contarFiltrosActivos,
  ORDENES,
  type FiltrosCatalogo,
  type Orden,
} from "@/lib/filtros";
import { formatearPrecio, formatearTalle } from "@/lib/format";

export type Facetas = {
  marcas: string[];
  talles: number[];
  precioMin: number;
  precioMax: number;
};

type Props = {
  facetas: Facetas;
  filtros: FiltrosCatalogo;
  total: number;
  children: React.ReactNode;
};

function alternar<T>(lista: T[], valor: T): T[] {
  return lista.includes(valor)
    ? lista.filter((v) => v !== valor)
    : [...lista, valor];
}

export function ControlesCatalogo({ facetas, filtros, total, children }: Props) {
  const router = useRouter();
  const [pendiente, startTransition] = useTransition();
  const [abierto, setAbierto] = useState(false);

  const [texto, setTexto] = useState(filtros.q);
  const [min, setMin] = useState(filtros.precioMin?.toString() ?? "");
  const [max, setMax] = useState(filtros.precioMax?.toString() ?? "");
  const montado = useRef(false);

  useEffect(() => {
    setTexto(filtros.q);
    setMin(filtros.precioMin?.toString() ?? "");
    setMax(filtros.precioMax?.toString() ?? "");
  }, [filtros.q, filtros.precioMin, filtros.precioMax]);

  function navegar(cambios: Partial<FiltrosCatalogo>) {
    const siguiente = { ...filtros, ...cambios, pagina: 1 };
    startTransition(() => {
      router.push(`/${aQueryString(siguiente)}#catalogo`, { scroll: false });
    });
  }

  useEffect(() => {
    if (!montado.current) {
      montado.current = true;
      return;
    }
    const t = setTimeout(() => {
      const nuevoMin = min === "" ? null : Number(min);
      const nuevoMax = max === "" ? null : Number(max);
      const sinCambios =
        texto.trim() === filtros.q &&
        nuevoMin === filtros.precioMin &&
        nuevoMax === filtros.precioMax;
      if (sinCambios) return;

      navegar({
        q: texto.trim(),
        precioMin:
          nuevoMin !== null && Number.isFinite(nuevoMin) ? nuevoMin : null,
        precioMax:
          nuevoMax !== null && Number.isFinite(nuevoMax) ? nuevoMax : null,
      });
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [texto, min, max]);

  const activos = useMemo(() => contarFiltrosActivos(filtros), [filtros]);

  const panel = (
    <div className="space-y-8">
      <Grupo titulo="Categoría">
        <div className="flex flex-wrap gap-2">
          {CATEGORIAS.map((c) => (
            <Chip
              key={c}
              activo={filtros.categorias.includes(c)}
              onClick={() =>
                navegar({ categorias: alternar([...filtros.categorias], c) })
              }
            >
              {labelCategoria(c)}
            </Chip>
          ))}
        </div>
      </Grupo>

      {facetas.marcas.length > 0 && (
        <Grupo titulo="Marca">
          <ul className="space-y-1.5">
            {facetas.marcas.map((m) => {
              const activo = filtros.marcas.includes(m);
              return (
                <li key={m}>
                  <label className="flex cursor-pointer items-center gap-2.5 text-sm text-tinta">
                    <input
                      type="checkbox"
                      checked={activo}
                      onChange={() =>
                        navegar({ marcas: alternar([...filtros.marcas], m) })
                      }
                      className="size-4 rounded border-borde accent-violeta"
                    />
                    <span className={activo ? "font-semibold" : ""}>{m}</span>
                  </label>
                </li>
              );
            })}
          </ul>
        </Grupo>
      )}

      <Grupo titulo="Precio">
        <div className="flex items-center gap-2">
          <input
            type="number"
            inputMode="numeric"
            placeholder="Mín"
            aria-label="Precio mínimo"
            value={min}
            onChange={(e) => setMin(e.target.value)}
            className="w-full rounded-lg border border-borde px-3 py-2 text-sm outline-none focus:border-violeta"
          />
          <span className="text-gris">—</span>
          <input
            type="number"
            inputMode="numeric"
            placeholder="Máx"
            aria-label="Precio máximo"
            value={max}
            onChange={(e) => setMax(e.target.value)}
            className="w-full rounded-lg border border-borde px-3 py-2 text-sm outline-none focus:border-violeta"
          />
        </div>
        {facetas.precioMax > 0 && (
          <p className="mt-2 text-xs text-gris">
            En el catálogo: {formatearPrecio(facetas.precioMin)} —{" "}
            {formatearPrecio(facetas.precioMax)}
          </p>
        )}
      </Grupo>

      {facetas.talles.length > 0 && (
        <Grupo titulo="Talle disponible">
          <div className="flex flex-wrap gap-2">
            {facetas.talles.map((t) => (
              <Chip
                key={t}
                activo={filtros.talles.includes(t)}
                onClick={() =>
                  navegar({ talles: alternar([...filtros.talles], t) })
                }
              >
                {formatearTalle(t)}
              </Chip>
            ))}
          </div>
        </Grupo>
      )}

      {activos > 0 && (
        <button
          type="button"
          onClick={() =>
            navegar({
              marcas: [],
              categorias: [],
              talles: [],
              precioMin: null,
              precioMax: null,
            })
          }
          className="w-full rounded-xl border border-borde px-4 py-2.5 text-sm font-semibold text-tinta transition hover:border-tinta"
        >
          Limpiar filtros ({activos})
        </button>
      )}
    </div>
  );

  return (
    <div className="grid gap-10 lg:grid-cols-[240px_minmax(0,1fr)]">
      <div className="hidden lg:sticky lg:top-24 lg:block lg:self-start">
        {panel}
      </div>

      <div>
        <div className="mb-8 space-y-3">
          <div className="relative">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
              className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-gris"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" strokeLinecap="round" />
            </svg>
            <input
              type="search"
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              placeholder="Buscar por marca o modelo…"
              aria-label="Buscar zapatillas"
              className="w-full rounded-2xl border border-borde bg-white py-3.5 pl-12 pr-4 text-base outline-none transition focus:border-violeta"
            />
          </div>

          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setAbierto(true)}
              className="flex items-center gap-2 rounded-xl border border-borde px-4 py-2.5 text-sm font-semibold text-tinta lg:hidden"
            >
              Filtros
              {activos > 0 && (
                <span className="rounded-full bg-violeta px-2 py-0.5 text-xs text-white">
                  {activos}
                </span>
              )}
            </button>

            <p className="hidden text-sm text-gris lg:block">
              {total} {total === 1 ? "modelo" : "modelos"}
            </p>

            <label className="flex items-center gap-2 text-sm text-gris">
              <span className="hidden sm:inline">Ordenar por</span>
              <select
                value={filtros.orden}
                onChange={(e) => navegar({ orden: e.target.value as Orden })}
                className="rounded-xl border border-borde bg-white px-3 py-2.5 text-sm font-medium text-tinta outline-none focus:border-violeta"
              >
                {Object.entries(ORDENES).map(([valor, etiqueta]) => (
                  <option key={valor} value={valor}>
                    {etiqueta}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <div
          className={
            pendiente ? "opacity-50 transition-opacity" : "transition-opacity"
          }
        >
          {children}
        </div>
      </div>

      {abierto && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Cerrar filtros"
            onClick={() => setAbierto(false)}
            className="absolute inset-0 bg-tinta/50 backdrop-blur-sm"
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[85dvh] overflow-y-auto rounded-t-3xl bg-white p-6 pb-10">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="titulo-display text-2xl">Filtros</h2>
              <button
                type="button"
                onClick={() => setAbierto(false)}
                className="rounded-full border border-borde px-3 py-1.5 text-sm font-semibold"
              >
                Cerrar
              </button>
            </div>
            {panel}
            <button
              type="button"
              onClick={() => setAbierto(false)}
              className="mt-8 w-full rounded-xl bg-violeta px-4 py-3 font-semibold text-white"
            >
              Ver {total} {total === 1 ? "resultado" : "resultados"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Grupo({
  titulo,
  children,
}: {
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h3 className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-gris">
        {titulo}
      </h3>
      {children}
    </section>
  );
}

function Chip({
  activo,
  onClick,
  children,
}: {
  activo: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={activo}
      className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${
        activo
          ? "border-violeta bg-violeta text-white"
          : "border-borde text-tinta hover:border-tinta"
      }`}
    >
      {children}
    </button>
  );
}
