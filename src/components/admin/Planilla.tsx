"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { guardarCambioRapido, type CambioRapido } from "@/app/admin/actions";
import { CATEGORIAS, labelCategoria } from "@/lib/categorias";
import { formatearTalle } from "@/lib/format";
import { motivoIncompleta } from "@/lib/publicacion";

export type FilaPlanilla = {
  id: string;
  marca: string;
  modelo: string;
  color: string;
  categoria: string;
  precio: number;
  imagen: string | null;
  cantidadImagenes: number;
  talles: number[];
  activo: boolean;
};

type Borrador = {
  modelo: string;
  color: string;
  categoria: string;
  precio: string;
  talles: string;
  activo: boolean;
};

type EstadoFila = { guardando?: boolean; error?: string; ok?: boolean };

const CAMPO =
  "w-full rounded-lg border border-borde bg-white px-2.5 py-2 text-sm text-tinta outline-none transition focus:border-violeta";

function tallesATexto(talles: number[]): string {
  const orden = [...talles].sort((a, b) => a - b);
  const partes: string[] = [];
  let i = 0;
  while (i < orden.length) {
    let j = i;
    while (
      j + 1 < orden.length &&
      Number.isInteger(orden[j]) &&
      orden[j + 1] === orden[j] + 1
    ) {
      j++;
    }
    if (j - i >= 2) {
      partes.push(`${formatearTalle(orden[i])}-${formatearTalle(orden[j])}`);
    } else {
      orden.slice(i, j + 1).forEach((t) => partes.push(formatearTalle(t)));
    }
    i = j + 1;
  }
  return partes.join(", ");
}

function textoATalles(texto: string): { talles: number[]; error: string | null } {
  const normalizado = texto
    .replace(/\s*-\s*/g, "-")
    .replace(/\s+a\s+/gi, "-");
  const tokens = normalizado.split(/[\s,;/]+/).filter(Boolean);
  const talles: number[] = [];

  for (const token of tokens) {
    const rango = token.match(/^(\d+(?:\.\d+)?)-(\d+(?:\.\d+)?)$/);
    if (rango) {
      const desde = Number(rango[1]);
      const hasta = Number(rango[2]);
      if (desde > hasta || hasta - desde > 20) {
        return { talles: [], error: `Rango inválido: ${token}` };
      }
      for (let v = desde; v <= hasta; v++) talles.push(v);
      continue;
    }
    const n = Number(token);
    if (!Number.isFinite(n) || n <= 0 || n > 70) {
      return { talles: [], error: `Talle inválido: ${token}` };
    }
    talles.push(n);
  }

  return { talles: [...new Set(talles)].sort((a, b) => a - b), error: null };
}

function aBorrador(f: FilaPlanilla): Borrador {
  return {
    modelo: f.modelo,
    color: f.color,
    categoria: f.categoria,
    precio: f.precio > 0 ? String(f.precio) : "",
    talles: tallesATexto(f.talles),
    activo: f.activo,
  };
}

function esPendiente(f: FilaPlanilla) {
  return (
    !f.activo ||
    motivoIncompleta({
      precio: f.precio,
      imagenes: Array.from({ length: f.cantidadImagenes }, () => ""),
      talles: f.talles.map(() => ({ stock: true })),
    }) !== null
  );
}

export function Planilla({ filas }: { filas: FilaPlanilla[] }) {
  const inicial = useMemo(
    () => Object.fromEntries(filas.map((f) => [f.id, aBorrador(f)])),
    [filas]
  );
  const [borradores, setBorradores] = useState<Record<string, Borrador>>(inicial);
  const [bases, setBases] = useState<Record<string, Borrador>>(inicial);
  const [estados, setEstados] = useState<Record<string, EstadoFila>>({});
  const [pendientesIniciales] = useState(
    () => new Set(filas.filter(esPendiente).map((f) => f.id))
  );
  const [vista, setVista] = useState<"pendientes" | "todas">(
    pendientesIniciales.size > 0 ? "pendientes" : "todas"
  );
  const [busqueda, setBusqueda] = useState("");
  const [guardandoTodo, setGuardandoTodo] = useState(false);

  const porId = useMemo(() => new Map(filas.map((f) => [f.id, f])), [filas]);

  const estaSucia = (id: string) =>
    JSON.stringify(borradores[id]) !== JSON.stringify(bases[id]);
  const sucias = filas.filter((f) => estaSucia(f.id)).map((f) => f.id);

  const texto = busqueda.trim().toLowerCase();
  const visibles = filas.filter(
    (f) =>
      (vista === "todas" || pendientesIniciales.has(f.id)) &&
      (!texto ||
        `${f.marca} ${borradores[f.id].modelo} ${borradores[f.id].color}`
          .toLowerCase()
          .includes(texto))
  );

  function cambiar(id: string, cambios: Partial<Borrador>) {
    setBorradores((prev) => ({ ...prev, [id]: { ...prev[id], ...cambios } }));
    setEstados((prev) => ({ ...prev, [id]: {} }));
  }

  function validar(id: string): { datos?: CambioRapido; error?: string } {
    const b = borradores[id];
    const fila = porId.get(id);
    if (!fila) return { error: "Fila desconocida" };

    const { talles, error } = textoATalles(b.talles);
    if (error) return { error };

    const precio = b.precio.trim() === "" ? 0 : Number(b.precio.replace(/[.\s$]/g, ""));
    if (!Number.isInteger(precio) || precio < 0) return { error: "Precio inválido" };
    if (!b.modelo.trim()) return { error: "Falta el modelo" };

    if (b.activo) {
      const falta = motivoIncompleta({
        precio,
        imagenes: Array.from({ length: fila.cantidadImagenes }, () => ""),
        talles: talles.map(() => ({ stock: true })),
      });
      if (falta) return { error: falta.mensaje };
    }

    return {
      datos: {
        modelo: b.modelo.trim(),
        color: b.color.trim(),
        categoria: b.categoria as CambioRapido["categoria"],
        precio,
        talles,
        activo: b.activo,
      },
    };
  }

  async function guardar(id: string) {
    const enviado = borradores[id];
    const { datos, error } = validar(id);
    if (!datos) {
      setEstados((prev) => ({ ...prev, [id]: { error } }));
      return;
    }

    setEstados((prev) => ({ ...prev, [id]: { guardando: true } }));
    try {
      const res = await guardarCambioRapido(id, datos);
      if (!res.ok) {
        setEstados((prev) => ({ ...prev, [id]: { error: res.error } }));
        return;
      }
      setBases((prev) => ({ ...prev, [id]: enviado }));
      setEstados((prev) => ({ ...prev, [id]: { ok: true } }));
    } catch {
      setEstados((prev) => ({ ...prev, [id]: { error: "No se pudo guardar." } }));
    }
  }

  async function guardarTodo() {
    setGuardandoTodo(true);
    for (const id of sucias) await guardar(id);
    setGuardandoTodo(false);
  }

  return (
    <div className="space-y-4 pb-28">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex rounded-xl border border-borde bg-white p-1 text-sm">
          {(
            [
              ["pendientes", `Pendientes (${pendientesIniciales.size})`],
              ["todas", `Todas (${filas.length})`],
            ] as const
          ).map(([valor, etiqueta]) => (
            <button
              key={valor}
              type="button"
              onClick={() => setVista(valor)}
              aria-pressed={vista === valor}
              className={`rounded-lg px-4 py-2 font-semibold transition ${
                vista === valor ? "bg-tinta text-white" : "text-gris hover:text-tinta"
              }`}
            >
              {etiqueta}
            </button>
          ))}
        </div>
        <input
          type="search"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Filtrar por marca, modelo o color…"
          className="w-full rounded-xl border border-borde bg-white px-4 py-2.5 text-sm outline-none focus:border-violeta sm:w-72"
        />
      </div>

      {visibles.length === 0 ? (
        <div className="rounded-marco border border-dashed border-borde bg-white px-6 py-16 text-center">
          <p className="titulo-display text-2xl">
            {vista === "pendientes" ? "No hay nada pendiente" : "Sin resultados"}
          </p>
          <p className="mt-2 text-sm text-gris">
            {vista === "pendientes"
              ? "Todas las fichas tienen foto, precio y talles."
              : "Probá con otra búsqueda."}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-marco border border-borde bg-white">
          <table className="w-full min-w-[1040px] text-sm">
            <thead>
              <tr className="border-b border-borde text-left text-[11px] font-bold uppercase tracking-[0.14em] text-gris">
                <th className="p-3">Foto</th>
                <th className="p-3">Marca · Modelo</th>
                <th className="p-3">Color</th>
                <th className="p-3">Categoría</th>
                <th className="p-3">Precio</th>
                <th className="p-3">Talles BR</th>
                <th className="p-3 text-center">Publicada</th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody>
              {visibles.map((f) => {
                const b = borradores[f.id];
                const estado = estados[f.id] ?? {};
                const sucia = estaSucia(f.id);
                const lectura = textoATalles(b.talles);

                return (
                  <tr
                    key={f.id}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && (e.target as HTMLElement).tagName === "INPUT") {
                        e.preventDefault();
                        void guardar(f.id);
                      }
                    }}
                    className={`border-b border-borde align-top last:border-0 ${
                      sucia ? "bg-violeta-tenue/50" : ""
                    }`}
                  >
                    <td className="p-3">
                      <div className="relative size-12 overflow-hidden rounded-lg bg-humo">
                        {f.imagen && (
                          <Image src={f.imagen} alt="" fill sizes="48px" className="object-cover" />
                        )}
                      </div>
                    </td>
                    <td className="min-w-52 p-3">
                      <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.14em] text-gris">
                        {f.marca}
                      </p>
                      <input
                        value={b.modelo}
                        onChange={(e) => cambiar(f.id, { modelo: e.target.value })}
                        aria-label={`Modelo de ${f.marca}`}
                        className={CAMPO}
                      />
                    </td>
                    <td className="w-32 p-3 pt-8">
                      <input
                        value={b.color}
                        onChange={(e) => cambiar(f.id, { color: e.target.value })}
                        placeholder="—"
                        aria-label="Color"
                        className={CAMPO}
                      />
                    </td>
                    <td className="w-36 p-3 pt-8">
                      <select
                        value={b.categoria}
                        onChange={(e) => cambiar(f.id, { categoria: e.target.value })}
                        aria-label="Categoría"
                        className={CAMPO}
                      >
                        {CATEGORIAS.map((c) => (
                          <option key={c} value={c}>
                            {labelCategoria(c)}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="w-32 p-3 pt-8">
                      <input
                        value={b.precio}
                        onChange={(e) => cambiar(f.id, { precio: e.target.value })}
                        inputMode="numeric"
                        placeholder="Sin precio"
                        aria-label="Precio"
                        className={`${CAMPO} ${b.precio.trim() === "" ? "border-dashed" : ""}`}
                      />
                    </td>
                    <td className="w-52 p-3 pt-8">
                      <input
                        value={b.talles}
                        onChange={(e) => cambiar(f.id, { talles: e.target.value })}
                        placeholder="38-42, 44"
                        aria-label="Talles BR"
                        className={`${CAMPO} ${lectura.error ? "border-red-400" : ""}`}
                      />
                      <p
                        className={`mt-1 text-[11px] ${
                          lectura.error ? "text-red-600" : "text-gris"
                        }`}
                      >
                        {lectura.error ??
                          (lectura.talles.length
                            ? lectura.talles.map(formatearTalle).join(" · ")
                            : "Sin talles")}
                      </p>
                    </td>
                    <td className="p-3 pt-10 text-center">
                      <input
                        type="checkbox"
                        checked={b.activo}
                        onChange={(e) => cambiar(f.id, { activo: e.target.checked })}
                        aria-label="Publicada en el catálogo"
                        className="size-5 accent-violeta"
                      />
                    </td>
                    <td className="w-40 p-3 pt-8">
                      <button
                        type="button"
                        disabled={!sucia || estado.guardando}
                        onClick={() => void guardar(f.id)}
                        className="w-full rounded-lg bg-violeta px-3 py-2 text-sm font-semibold text-white transition hover:bg-violeta-oscuro disabled:bg-borde disabled:text-gris"
                      >
                        {estado.guardando ? "Guardando…" : "Guardar"}
                      </button>
                      <p className="mt-1 min-h-4 text-[11px]">
                        {estado.error ? (
                          <span className="text-red-600">{estado.error}</span>
                        ) : estado.ok ? (
                          <span className="text-violeta-oscuro">✓ Guardado</span>
                        ) : null}
                      </p>
                      <Link
                        href={`/admin/${f.id}`}
                        className="text-[11px] text-gris underline hover:text-tinta"
                      >
                        Ficha completa
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {sucias.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-borde bg-white/95 backdrop-blur">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
            <p className="text-sm font-semibold text-tinta">
              {sucias.length} {sucias.length === 1 ? "fila con cambios" : "filas con cambios"} sin guardar
            </p>
            <button
              type="button"
              disabled={guardandoTodo}
              onClick={() => void guardarTodo()}
              className="rounded-xl bg-violeta px-6 py-3 font-semibold text-white transition hover:bg-violeta-oscuro disabled:opacity-60"
            >
              {guardandoTodo ? "Guardando…" : "Guardar todo"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
