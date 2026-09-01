"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { alternarActivo, eliminarZapatilla } from "@/app/admin/actions";

export function InterruptorActivo({
  id,
  activo,
}: {
  id: string;
  activo: boolean;
}) {
  const router = useRouter();
  const [pendiente, startTransition] = useTransition();
  const [optimista, setOptimista] = useState(activo);

  return (
    <button
      type="button"
      role="switch"
      aria-checked={optimista}
      aria-label={optimista ? "Ocultar del catálogo" : "Mostrar en el catálogo"}
      disabled={pendiente}
      onClick={() => {
        const siguiente = !optimista;
        setOptimista(siguiente);
        startTransition(async () => {
          try {
            await alternarActivo(id, siguiente);
            router.refresh();
          } catch {
            setOptimista(!siguiente);
          }
        });
      }}
      className={`relative h-6 w-11 shrink-0 rounded-full transition ${
        optimista ? "bg-violeta" : "bg-borde"
      } ${pendiente ? "opacity-60" : ""}`}
    >
      <span
        className={`absolute top-0.5 size-5 rounded-full bg-white transition-all ${
          optimista ? "left-[1.375rem]" : "left-0.5"
        }`}
      />
    </button>
  );
}

export function BotonEliminar({
  id,
  nombre,
}: {
  id: string;
  nombre: string;
}) {
  const router = useRouter();
  const [confirmando, setConfirmando] = useState(false);
  const [pendiente, startTransition] = useTransition();

  if (!confirmando) {
    return (
      <button
        type="button"
        onClick={() => setConfirmando(true)}
        className="text-sm text-gris transition hover:text-red-600"
      >
        Eliminar
      </button>
    );
  }

  return (
    <span className="flex items-center gap-2 text-sm">
      <span className="text-gris">¿Seguro?</span>
      <button
        type="button"
        disabled={pendiente}
        onClick={() =>
          startTransition(async () => {
            await eliminarZapatilla(id);
            router.refresh();
          })
        }
        title={`Eliminar ${nombre} definitivamente`}
        className="font-semibold text-red-600 hover:underline disabled:opacity-60"
      >
        {pendiente ? "Borrando…" : "Sí, borrar"}
      </button>
      <button
        type="button"
        onClick={() => setConfirmando(false)}
        className="text-gris hover:text-tinta"
      >
        No
      </button>
    </span>
  );
}
