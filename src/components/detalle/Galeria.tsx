"use client";

import Image from "next/image";
import { useState } from "react";

export function Galeria({
  imagenes,
  alt,
}: {
  imagenes: string[];
  alt: string;
}) {
  const [indice, setIndice] = useState(0);

  if (imagenes.length === 0) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-marco bg-humo text-xs uppercase tracking-widest text-gris">
        Sin imagen
      </div>
    );
  }

  const actual = imagenes[Math.min(indice, imagenes.length - 1)];

  return (
    <div className="space-y-4">
      <div className="relative aspect-square overflow-hidden rounded-marco bg-humo">
        <Image
          key={actual}
          src={actual}
          alt={alt}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover"
        />

        {imagenes.length > 1 && (
          <>
            <BotonFlecha
              lado="izq"
              onClick={() =>
                setIndice((i) => (i - 1 + imagenes.length) % imagenes.length)
              }
            />
            <BotonFlecha
              lado="der"
              onClick={() => setIndice((i) => (i + 1) % imagenes.length)}
            />
            <p className="absolute bottom-3 right-3 rounded-full bg-tinta/80 px-2.5 py-1 text-xs font-semibold text-white">
              {Math.min(indice, imagenes.length - 1) + 1} / {imagenes.length}
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
              className={`relative size-20 shrink-0 overflow-hidden rounded-xl border-2 transition ${
                i === indice ? "border-violeta" : "border-transparent opacity-70 hover:opacity-100"
              }`}
            >
              <Image
                src={src}
                alt=""
                fill
                sizes="80px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function BotonFlecha({
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
      className={`absolute top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-tinta shadow-sm backdrop-blur transition hover:bg-white ${
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
