"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";

export function BuscadorAdmin({ valorInicial }: { valorInicial: string }) {
  const router = useRouter();
  const [texto, setTexto] = useState(valorInicial);
  const [pendiente, startTransition] = useTransition();
  const montado = useRef(false);

  useEffect(() => {
    if (!montado.current) {
      montado.current = true;
      return;
    }
    const t = setTimeout(() => {
      if (texto.trim() === valorInicial) return;
      const qs = texto.trim() ? `?q=${encodeURIComponent(texto.trim())}` : "";
      startTransition(() => router.push(`/admin${qs}`));
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [texto]);

  return (
    <input
      type="search"
      value={texto}
      onChange={(e) => setTexto(e.target.value)}
      placeholder="Buscar marca o modelo…"
      aria-label="Buscar en el catálogo cargado"
      className={`w-full rounded-xl border border-borde bg-white px-4 py-2.5 text-sm outline-none transition focus:border-violeta sm:w-72 ${
        pendiente ? "opacity-70" : ""
      }`}
    />
  );
}
