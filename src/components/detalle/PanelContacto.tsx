"use client";

import { useState } from "react";
import { BotonWhatsApp } from "@/components/BotonWhatsApp";
import { formatearTalle } from "@/lib/format";

type TalleVista = { id: string; talle: number; stock: boolean };

/**
 * Selector de talle + botón de WhatsApp. Van juntos porque el talle elegido
 * se inyecta en el mensaje precargado.
 */
export function PanelContacto({
  id,
  marca,
  modelo,
  talles,
}: {
  id: string;
  marca: string;
  modelo: string;
  talles: TalleVista[];
}) {
  const [elegido, setElegido] = useState<number | null>(null);
  const hayDisponibles = talles.some((t) => t.stock);

  return (
    <div className="space-y-6">
      {talles.length > 0 && (
        <div>
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="text-[11px] font-bold uppercase tracking-[0.18em] text-gris">
              Talles
            </h2>
            {!hayDisponibles && (
              <span className="text-xs font-semibold text-gris">
                Sin stock por ahora
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {talles.map((t) => {
              const activo = elegido === t.talle;
              return (
                <button
                  key={t.id}
                  type="button"
                  disabled={!t.stock}
                  aria-pressed={activo}
                  onClick={() => setElegido(activo ? null : t.talle)}
                  title={t.stock ? `Talle ${formatearTalle(t.talle)}` : "Agotado"}
                  className={`min-w-14 rounded-xl border px-3 py-2.5 text-sm font-semibold transition ${
                    !t.stock
                      ? "cursor-not-allowed border-borde bg-humo text-gris line-through decoration-gris/70"
                      : activo
                        ? "border-violeta bg-violeta text-white"
                        : "border-borde text-tinta hover:border-tinta"
                  }`}
                >
                  {formatearTalle(t.talle)}
                </button>
              );
            })}
          </div>

          <p className="mt-3 text-xs text-gris">
            {elegido
              ? `Vas a consultar por el talle ${formatearTalle(elegido)}.`
              : "Elegí un talle y lo sumamos al mensaje de WhatsApp."}
          </p>
        </div>
      )}

      <BotonWhatsApp
        marca={marca}
        modelo={modelo}
        path={`/zapatilla/${id}`}
        talle={elegido !== null ? formatearTalle(elegido) : null}
        variante="detalle"
      />
    </div>
  );
}
