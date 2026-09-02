"use client";

import { useState } from "react";
import { formatearTalle } from "@/lib/format";

export type TalleForm = { talle: number; stock: boolean };

const PRESETS = [35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46];

export function EditorTalles({
  talles,
  onCambio,
}: {
  talles: TalleForm[];
  onCambio: (talles: TalleForm[]) => void;
}) {
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");

  const ordenados = [...talles].sort((a, b) => a.talle - b.talle);
  const cargados = new Set(talles.map((t) => t.talle));

  function agregar(valores: number[]) {
    const nuevos = valores
      .filter((v) => Number.isFinite(v) && v > 0 && v <= 70 && !cargados.has(v))
      .map((talle) => ({ talle, stock: true }));
    if (nuevos.length) onCambio([...talles, ...nuevos]);
  }

  function alternarPreset(valor: number) {
    if (cargados.has(valor)) {
      onCambio(talles.filter((t) => t.talle !== valor));
    } else {
      agregar([valor]);
    }
  }

  function agregarRango() {
    const a = Number(desde);
    const b = Number(hasta);
    if (!Number.isFinite(a) || !Number.isFinite(b) || a > b) return;
    const valores: number[] = [];
    for (let v = a; v <= b; v += 1) valores.push(v);
    agregar(valores);
    setDesde("");
    setHasta("");
  }

  function marcarTodos(stock: boolean) {
    onCambio(talles.map((t) => ({ ...t, stock })));
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="mb-2 text-xs text-gris">Agregado rápido</p>
        <div className="flex flex-wrap gap-1.5">
          {PRESETS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => alternarPreset(p)}
              aria-pressed={cargados.has(p)}
              className={`min-w-11 rounded-lg border px-2.5 py-1.5 text-sm font-semibold transition ${
                cargados.has(p)
                  ? "border-tinta bg-tinta text-white"
                  : "border-borde bg-white text-tinta hover:border-tinta"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-2">
        <label className="text-xs text-gris">
          Desde
          <input
            type="number"
            step="0.5"
            value={desde}
            onChange={(e) => setDesde(e.target.value)}
            className="mt-1 block w-24 rounded-lg border border-borde px-3 py-2 text-sm text-tinta outline-none focus:border-violeta"
          />
        </label>
        <label className="text-xs text-gris">
          Hasta
          <input
            type="number"
            step="0.5"
            value={hasta}
            onChange={(e) => setHasta(e.target.value)}
            className="mt-1 block w-24 rounded-lg border border-borde px-3 py-2 text-sm text-tinta outline-none focus:border-violeta"
          />
        </label>
        <button
          type="button"
          onClick={agregarRango}
          className="rounded-lg border border-borde bg-white px-3 py-2 text-sm font-semibold text-tinta transition hover:border-tinta"
        >
          Agregar rango
        </button>
      </div>

      {ordenados.length > 0 && (
        <div className="rounded-2xl border border-borde bg-white p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs text-gris">
              Tocá un talle para marcarlo agotado. Los agotados se muestran
              tachados en el catálogo.
            </p>
            <div className="flex gap-2 text-xs">
              <button
                type="button"
                onClick={() => marcarTodos(true)}
                className="text-violeta hover:underline"
              >
                Todos disponibles
              </button>
              <span className="text-borde">|</span>
              <button
                type="button"
                onClick={() => marcarTodos(false)}
                className="text-gris hover:underline"
              >
                Todos agotados
              </button>
            </div>
          </div>

          <ul className="flex flex-wrap gap-2">
            {ordenados.map((t) => (
              <li key={t.talle} className="flex items-stretch">
                <button
                  type="button"
                  onClick={() =>
                    onCambio(
                      talles.map((x) =>
                        x.talle === t.talle ? { ...x, stock: !x.stock } : x
                      )
                    )
                  }
                  aria-label={`Talle ${formatearTalle(t.talle)}: ${
                    t.stock ? "disponible" : "agotado"
                  }`}
                  className={`rounded-l-lg border px-3 py-2 text-sm font-semibold transition ${
                    t.stock
                      ? "border-violeta bg-violeta text-white"
                      : "border-borde bg-humo text-gris line-through"
                  }`}
                >
                  {formatearTalle(t.talle)}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    onCambio(talles.filter((x) => x.talle !== t.talle))
                  }
                  aria-label={`Quitar talle ${formatearTalle(t.talle)}`}
                  className="rounded-r-lg border border-l-0 border-borde bg-white px-2 text-gris transition hover:bg-red-50 hover:text-red-600"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
