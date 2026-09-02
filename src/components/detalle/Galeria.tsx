"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

export function Galeria({
  imagenes,
  alt,
}: {
  imagenes: string[];
  alt: string;
}) {
  const [indice, setIndice] = useState(0);
  const [ampliada, setAmpliada] = useState(false);
  const [zoom, setZoom] = useState(false);
  const [origen, setOrigen] = useState("50% 50%");
  const [permiteHover, setPermiteHover] = useState(false);
  const marco = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setPermiteHover(window.matchMedia("(hover: hover) and (pointer: fine)").matches);
  }, []);

  const anterior = useCallback(
    () => setIndice((i) => (i - 1 + imagenes.length) % imagenes.length),
    [imagenes.length]
  );
  const siguiente = useCallback(
    () => setIndice((i) => (i + 1) % imagenes.length),
    [imagenes.length]
  );

  useEffect(() => {
    if (!ampliada) return;

    const alTeclear = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAmpliada(false);
      if (e.key === "ArrowLeft") anterior();
      if (e.key === "ArrowRight") siguiente();
    };

    const overflowPrevio = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", alTeclear);

    return () => {
      document.body.style.overflow = overflowPrevio;
      window.removeEventListener("keydown", alTeclear);
    };
  }, [ampliada, anterior, siguiente]);

  if (imagenes.length === 0) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-marco bg-humo text-xs uppercase tracking-widest text-gris">
        Sin imagen
      </div>
    );
  }

  const actual = imagenes[Math.min(indice, imagenes.length - 1)];
  const posicion = Math.min(indice, imagenes.length - 1) + 1;

  function seguirCursor(e: React.MouseEvent<HTMLDivElement>) {
    if (!permiteHover || !marco.current) return;
    const caja = marco.current.getBoundingClientRect();
    const x = ((e.clientX - caja.left) / caja.width) * 100;
    const y = ((e.clientY - caja.top) / caja.height) * 100;
    setOrigen(`${x}% ${y}%`);
    setZoom(true);
  }

  return (
    <div className="space-y-4">
      <div
        ref={marco}
        onMouseLeave={() => setZoom(false)}
        onMouseMove={seguirCursor}
        className="group relative aspect-square overflow-hidden rounded-marco bg-humo"
      >
        <Image
          key={actual}
          src={actual}
          alt={alt}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          style={{ transformOrigin: origen }}
          className={`object-contain transition-transform duration-200 ${
            zoom ? "scale-[2.4]" : "scale-100"
          }`}
        />

        <button
          type="button"
          onClick={() => setAmpliada(true)}
          aria-label="Ampliar imagen"
          className="absolute inset-0 cursor-zoom-in"
        />

        <span className="pointer-events-none absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-tinta opacity-0 shadow-sm backdrop-blur transition group-hover:opacity-100">
          <IconoLupa className="size-3.5" />
          {permiteHover ? "Click para pantalla completa" : "Tocá para ampliar"}
        </span>

        {imagenes.length > 1 && (
          <>
            <Flecha lado="izq" onClick={anterior} />
            <Flecha lado="der" onClick={siguiente} />
            <p className="pointer-events-none absolute bottom-3 right-3 rounded-full bg-tinta/80 px-2.5 py-1 text-xs font-semibold text-white">
              {posicion} / {imagenes.length}
            </p>
          </>
        )}
      </div>

      {imagenes.length > 1 && (
        <div className="scrollbar-fina flex gap-3 overflow-x-auto pb-2">
          {imagenes.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setIndice(i)}
              aria-label={`Ver imagen ${i + 1}`}
              aria-current={i === indice}
              className={`relative size-20 shrink-0 overflow-hidden rounded-xl border-2 bg-humo transition ${
                i === indice
                  ? "border-violeta"
                  : "border-transparent opacity-70 hover:opacity-100"
              }`}
            >
              <Image
                src={src}
                alt=""
                fill
                sizes="80px"
                className="object-contain"
              />
            </button>
          ))}
        </div>
      )}

      {ampliada && (
        <div className="fixed inset-0 z-[60] flex flex-col bg-tinta/95 backdrop-blur-sm">
          <div className="flex items-center justify-between px-4 py-4 text-white sm:px-6">
            <p className="text-sm font-semibold">
              {alt}
              {imagenes.length > 1 && (
                <span className="ml-2 text-white/50">
                  {posicion} / {imagenes.length}
                </span>
              )}
            </p>
            <button
              type="button"
              onClick={() => setAmpliada(false)}
              className="rounded-full border border-white/20 px-4 py-2 text-sm font-semibold transition hover:bg-white/10"
            >
              Cerrar
            </button>
          </div>

          <div className="relative flex-1 overflow-auto">
            <Image
              src={actual}
              alt={alt}
              fill
              sizes="100vw"
              quality={90}
              className="object-contain p-4 sm:p-8"
            />
          </div>

          {imagenes.length > 1 && (
            <div className="flex items-center justify-center gap-3 px-4 py-5">
              <button
                type="button"
                onClick={anterior}
                className="rounded-full border border-white/20 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                ← Anterior
              </button>
              <button
                type="button"
                onClick={siguiente}
                className="rounded-full border border-white/20 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Siguiente →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function IconoLupa({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      aria-hidden="true"
      className={className}
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
      <path d="M11 8v6M8 11h6" />
    </svg>
  );
}

function Flecha({
  lado,
  onClick,
}: {
  lado: "izq" | "der";
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={lado === "izq" ? "Imagen anterior" : "Imagen siguiente"}
      className={`absolute top-1/2 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-tinta shadow-sm backdrop-blur transition hover:bg-white ${
        lado === "izq" ? "left-3" : "right-3"
      }`}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`size-5 ${lado === "der" ? "rotate-180" : ""}`}
        aria-hidden="true"
      >
        <path d="m15 18-6-6 6-6" />
      </svg>
    </button>
  );
}
