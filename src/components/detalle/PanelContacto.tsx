"use client";

import { useState } from "react";
import { BotonWhatsApp } from "@/components/BotonWhatsApp";
import { BotonTablaTalles } from "@/components/talles/BotonTablaTalles";
import { formatearTalle } from "@/lib/format";
import { equivalenciaCompleta, talleParaMensaje } from "@/lib/talles";

type TalleVista = { id: string; talle: number; stock: boolean };

export function PanelContacto({
  id,
  marca,
  modelo,
  color,
  talles,
}: {
  id: string;
  marca: string;
  modelo: string;
  color?: string | null;
  talles: TalleVista[];
}) {
  const [elegido, setElegido] = useState<number | null>(null);
  const hayDisponibles = talles.some((t) => t.stock);

  return (
    <div className="space-y-6">
      {talles.length > 0 && (
        <div>
          <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <h2 className="text-[11px] font-bold uppercase tracking-[0.18em] text-gris">
              Talles <span className="text-tinta">BR</span>
            </h2>
            <BotonTablaTalles resaltado={elegido} />
          </div>

          {!hayDisponibles && (
            <p className="mb-3 text-xs font-semibold text-gris">
              Sin stock por ahora
            </p>
          )}

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
                  title={
                    t.stock ? equivalenciaCompleta(t.talle) : "Agotado"
                  }
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

          {elegido !== null ? (
            <p className="mt-3 rounded-xl bg-violeta-tenue px-3 py-2.5 text-sm font-semibold text-violeta-oscuro">
              {equivalenciaCompleta(elegido)}
            </p>
          ) : (
            <p className="mt-3 text-xs text-gris">
              Los números son talles brasileños. Elegí uno y te muestro su
              equivalente argentino.
            </p>
          )}
        </div>
      )}

      <BotonWhatsApp
        marca={marca}
        modelo={modelo}
        color={color}
        path={`/zapatilla/${id}`}
        talle={elegido !== null ? talleParaMensaje(elegido) : null}
        variante="detalle"
      />
    </div>
  );
}
