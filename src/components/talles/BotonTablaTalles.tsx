"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { TablaTalles } from "./TablaTalles";

export function BotonTablaTalles({
  resaltado,
  className = "",
}: {
  resaltado?: number | null;
  className?: string;
}) {
  const [abierta, setAbierta] = useState(false);

  useEffect(() => {
    if (!abierta) return;

    const alTeclear = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAbierta(false);
    };
    const overflowPrevio = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", alTeclear);

    return () => {
      document.body.style.overflow = overflowPrevio;
      window.removeEventListener("keydown", alTeclear);
    };
  }, [abierta]);

  return (
    <>
      <button
        type="button"
        onClick={() => setAbierta(true)}
        className={`inline-flex items-center gap-1.5 text-xs font-semibold text-violeta underline underline-offset-4 transition hover:text-violeta-oscuro ${className}`}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
          className="size-3.5"
        >
          <circle cx="12" cy="12" r="9" />
          <path d="M12 16v-4M12 8h.01" strokeLinecap="round" />
        </svg>
        Ver tabla de talles
      </button>

      {abierta &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Tabla de talles"
            className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center"
          >
            <button
              type="button"
              aria-label="Cerrar"
              onClick={() => setAbierta(false)}
              className="absolute inset-0 bg-tinta/60 backdrop-blur-sm"
            />

            <div className="relative max-h-[88dvh] w-full overflow-y-auto rounded-t-3xl bg-white p-6 sm:max-w-lg sm:rounded-marco sm:p-8">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <h2 className="titulo-display text-2xl">Tabla de talles</h2>
                  <p className="mt-1 text-sm text-gris">
                    Equivalencias BR · ARG · EUR
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setAbierta(false)}
                  className="rounded-full border border-borde px-3 py-1.5 text-sm font-semibold text-tinta transition hover:border-tinta"
                >
                  Cerrar
                </button>
              </div>

              <TablaTalles resaltado={resaltado} />
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
