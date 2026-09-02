"use client";

import Image from "next/image";
import { useCallback, useRef, useState } from "react";

const MAX_IMAGENES = 10;
const LADO_MAXIMO = 1600;

async function optimizar(archivo: File): Promise<File> {
  if (!archivo.type.startsWith("image/")) return archivo;

  try {
    const bitmap = await createImageBitmap(archivo, {
      imageOrientation: "from-image",
    });
    const escala = Math.min(
      1,
      LADO_MAXIMO / Math.max(bitmap.width, bitmap.height)
    );

    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * escala);
    canvas.height = Math.round(bitmap.height * escala);

    const ctx = canvas.getContext("2d");
    if (!ctx) return archivo;
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/webp", 0.85)
    );
    if (!blob || blob.size >= archivo.size) return archivo;

    return new File([blob], `${archivo.name.replace(/\.[^.]+$/, "")}.webp`, {
      type: "image/webp",
    });
  } catch {
    return archivo;
  }
}

export function SubidorImagenes({
  imagenes,
  onCambio,
  error,
}: {
  imagenes: string[];
  onCambio: (imagenes: string[]) => void;
  error?: string;
}) {
  const [subiendo, setSubiendo] = useState(0);
  const [fallo, setFallo] = useState<string | null>(null);
  const [arrastrando, setArrastrando] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const subir = useCallback(
    async (archivos: FileList | File[]) => {
      const lista = Array.from(archivos).filter((a) =>
        a.type.startsWith("image/")
      );
      if (lista.length === 0) return;

      const espacio = MAX_IMAGENES - imagenes.length;
      if (espacio <= 0) {
        setFallo(`Máximo ${MAX_IMAGENES} imágenes por modelo.`);
        return;
      }

      setFallo(null);
      const aSubir = lista.slice(0, espacio);
      setSubiendo((n) => n + aSubir.length);

      const subidas: string[] = [];
      for (const archivo of aSubir) {
        try {
          const optimizado = await optimizar(archivo);
          const body = new FormData();
          body.append("archivo", optimizado);

          const res = await fetch("/api/admin/upload", { method: "POST", body });
          const datos = await res.json();

          if (!res.ok) throw new Error(datos.error ?? "Error al subir");
          subidas.push(datos.url as string);
        } catch (e) {
          setFallo(e instanceof Error ? e.message : "No se pudo subir la imagen.");
        } finally {
          setSubiendo((n) => n - 1);
        }
      }

      if (subidas.length) onCambio([...imagenes, ...subidas]);
    },
    [imagenes, onCambio]
  );

  function mover(desde: number, hacia: number) {
    if (hacia < 0 || hacia >= imagenes.length) return;
    const copia = [...imagenes];
    const [item] = copia.splice(desde, 1);
    copia.splice(hacia, 0, item);
    onCambio(copia);
  }

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setArrastrando(true);
        }}
        onDragLeave={() => setArrastrando(false)}
        onDrop={(e) => {
          e.preventDefault();
          setArrastrando(false);
          void subir(e.dataTransfer.files);
        }}
        className={`rounded-2xl border-2 border-dashed p-6 text-center transition ${
          arrastrando ? "border-violeta bg-violeta/5" : "border-borde bg-white"
        }`}
      >
        <p className="text-sm text-tinta">
          Arrastrá las fotos acá o{" "}
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="font-semibold text-violeta underline underline-offset-2"
          >
            elegilas del disco
          </button>
        </p>
        <p className="mt-1 text-xs text-gris">
          JPG, PNG o WebP · se redimensionan solas · hasta {MAX_IMAGENES} por
          modelo
        </p>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) void subir(e.target.files);
            e.target.value = "";
          }}
        />

        {subiendo > 0 && (
          <p className="mt-3 text-sm font-semibold text-violeta">
            Subiendo {subiendo} {subiendo === 1 ? "imagen" : "imágenes"}…
          </p>
        )}
      </div>

      {(fallo || error) && (
        <p role="alert" className="mt-2 text-sm text-red-600">
          {fallo ?? error}
        </p>
      )}

      {imagenes.length > 0 && (
        <ul className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
          {imagenes.map((url, i) => (
            <li
              key={url}
              className="group relative aspect-square overflow-hidden rounded-xl border border-borde bg-humo"
            >
              <Image
                src={url}
                alt={`Imagen ${i + 1}`}
                fill
                sizes="120px"
                className="object-cover"
              />

              {i === 0 && (
                <span className="absolute left-1.5 top-1.5 rounded-full bg-violeta px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">
                  Principal
                </span>
              )}

              <div className="absolute inset-x-0 bottom-0 flex justify-between bg-tinta/70 p-1 opacity-0 transition group-hover:opacity-100 focus-within:opacity-100">
                <button
                  type="button"
                  onClick={() => mover(i, i - 1)}
                  disabled={i === 0}
                  aria-label="Mover a la izquierda"
                  className="px-1.5 text-white disabled:opacity-30"
                >
                  ←
                </button>
                <button
                  type="button"
                  onClick={() => onCambio(imagenes.filter((_, j) => j !== i))}
                  aria-label="Quitar imagen"
                  className="px-1.5 text-white hover:text-red-300"
                >
                  ✕
                </button>
                <button
                  type="button"
                  onClick={() => mover(i, i + 1)}
                  disabled={i === imagenes.length - 1}
                  aria-label="Mover a la derecha"
                  className="px-1.5 text-white disabled:opacity-30"
                >
                  →
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
