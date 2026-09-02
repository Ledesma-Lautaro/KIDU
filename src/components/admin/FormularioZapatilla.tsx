"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import Link from "next/link";
import { guardarZapatilla } from "@/app/admin/actions";
import { CATEGORIAS, labelCategoria } from "@/lib/categorias";
import { formatearPrecio } from "@/lib/format";
import { EditorTalles, type TalleForm } from "./EditorTalles";
import { SubidorImagenes } from "./SubidorImagenes";

export type ValoresIniciales = {
  id?: string;
  marca: string;
  modelo: string;
  categoria: string;
  precio: string;
  descripcion: string;
  imagenes: string[];
  talles: TalleForm[];
  activo: boolean;
};

export const VALORES_VACIOS: ValoresIniciales = {
  marca: "",
  modelo: "",
  categoria: CATEGORIAS[0],
  precio: "",
  descripcion: "",
  imagenes: [],
  talles: [],
  activo: true,
};

export function FormularioZapatilla({
  inicial = VALORES_VACIOS,
  marcasExistentes = [],
}: {
  inicial?: ValoresIniciales;
  marcasExistentes?: string[];
}) {
  const router = useRouter();
  const [guardando, startTransition] = useTransition();

  const [valores, setValores] = useState<ValoresIniciales>(inicial);
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  const esEdicion = Boolean(inicial.id);

  function set<K extends keyof ValoresIniciales>(
    campo: K,
    valor: ValoresIniciales[K]
  ) {
    setValores((v) => ({ ...v, [campo]: valor }));
    setErrores((previos) => {
      if (!(campo in previos)) return previos;
      const resto = { ...previos };
      delete resto[campo as string];
      return resto;
    });
  }

  function enviar(continuarCargando: boolean) {
    setErrorGeneral(null);
    setAviso(null);

    const payload = {
      marca: valores.marca,
      modelo: valores.modelo,
      categoria: valores.categoria,
      precio: valores.precio === "" ? NaN : Number(valores.precio),
      descripcion: valores.descripcion,
      imagenes: valores.imagenes,
      talles: valores.talles,
      activo: valores.activo,
    };

    startTransition(async () => {
      const res = await guardarZapatilla(payload, inicial.id);

      if (!res.ok) {
        setErrores(res.campos ?? {});
        setErrorGeneral(res.error);
        return;
      }

      if (continuarCargando) {
        setValores({
          ...VALORES_VACIOS,
          marca: valores.marca,
          categoria: valores.categoria,
        });
        setErrores({});
        setAviso(`Guardada: ${payload.marca} ${payload.modelo}`);
        window.scrollTo({ top: 0, behavior: "smooth" });
        router.refresh();
        return;
      }

      router.push("/admin");
      router.refresh();
    });
  }

  const precioNumero = Number(valores.precio);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        enviar(false);
      }}
      onKeyDown={(e) => {
        if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
          e.preventDefault();
          enviar(false);
        }
      }}
      className="space-y-8"
    >
      {aviso && (
        <p
          role="status"
          className="rounded-xl border border-violeta/30 bg-violeta/10 px-4 py-3 text-sm font-semibold text-violeta-oscuro"
        >
          ✓ {aviso} — el formulario quedó listo para el siguiente modelo.
        </p>
      )}

      {errorGeneral && (
        <p
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {errorGeneral}
        </p>
      )}

      <Bloque titulo="Datos del modelo">
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo etiqueta="Marca" error={errores.marca}>
            <input
              value={valores.marca}
              onChange={(e) => set("marca", e.target.value)}
              list="marcas-existentes"
              placeholder="Nike"
              autoFocus
              className={entrada(errores.marca)}
            />
            <datalist id="marcas-existentes">
              {marcasExistentes.map((m) => (
                <option key={m} value={m} />
              ))}
            </datalist>
          </Campo>

          <Campo etiqueta="Modelo" error={errores.modelo}>
            <input
              value={valores.modelo}
              onChange={(e) => set("modelo", e.target.value)}
              placeholder="Air Max 90"
              className={entrada(errores.modelo)}
            />
          </Campo>

          <Campo etiqueta="Categoría" error={errores.categoria}>
            <select
              value={valores.categoria}
              onChange={(e) => set("categoria", e.target.value)}
              className={entrada(errores.categoria)}
            >
              {CATEGORIAS.map((c) => (
                <option key={c} value={c}>
                  {labelCategoria(c)}
                </option>
              ))}
            </select>
          </Campo>

          <Campo
            etiqueta="Precio (ARS)"
            error={errores.precio}
            ayuda={
              Number.isFinite(precioNumero) && valores.precio !== ""
                ? `Se muestra como ${formatearPrecio(Math.trunc(precioNumero))}`
                : "Sin puntos ni decimales. Ej: 150000"
            }
          >
            <input
              type="number"
              inputMode="numeric"
              min={0}
              step={1}
              value={valores.precio}
              onChange={(e) => set("precio", e.target.value)}
              placeholder="150000"
              className={entrada(errores.precio)}
            />
          </Campo>
        </div>

        <Campo etiqueta="Descripción (opcional)" error={errores.descripcion}>
          <textarea
            value={valores.descripcion}
            onChange={(e) => set("descripcion", e.target.value)}
            rows={4}
            placeholder="Detalles, estado, material, origen…"
            className={entrada(errores.descripcion)}
          />
        </Campo>
      </Bloque>

      <Bloque
        titulo="Imágenes"
        descripcion="La primera es la que se ve en el catálogo."
      >
        <SubidorImagenes
          imagenes={valores.imagenes}
          onCambio={(imagenes) => set("imagenes", imagenes)}
          error={errores.imagenes}
        />
      </Bloque>

      <Bloque
        titulo="Talles y stock"
        descripcion="Los talles sin stock se muestran tachados, no se ocultan."
      >
        <EditorTalles
          talles={valores.talles}
          onCambio={(talles) => set("talles", talles)}
        />
        {errores.talles && (
          <p className="text-xs text-red-600">{errores.talles}</p>
        )}
      </Bloque>

      <Bloque titulo="Publicación">
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={valores.activo}
            onChange={(e) => set("activo", e.target.checked)}
            className="mt-0.5 size-5 rounded border-borde accent-violeta"
          />
          <span>
            <span className="block text-sm font-semibold text-tinta">
              Visible en el catálogo
            </span>
            <span className="block text-xs text-gris">
              Destildalo para dejarlo guardado sin que se vea en el sitio.
            </span>
          </span>
        </label>
      </Bloque>

      <div className="sticky bottom-0 -mx-4 flex flex-wrap items-center gap-3 border-t border-borde bg-humo/95 px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6">
        <button
          type="submit"
          disabled={guardando}
          className="rounded-xl bg-violeta px-6 py-3 font-semibold text-white transition hover:bg-violeta-oscuro disabled:opacity-60"
        >
          {guardando ? "Guardando…" : esEdicion ? "Guardar cambios" : "Guardar"}
        </button>

        {!esEdicion && (
          <button
            type="button"
            disabled={guardando}
            onClick={() => enviar(true)}
            className="rounded-xl border border-tinta px-6 py-3 font-semibold text-tinta transition hover:bg-tinta hover:text-white disabled:opacity-60"
          >
            Guardar y cargar otra
          </button>
        )}

        <Link
          href="/admin"
          className="px-2 text-sm text-gris transition hover:text-tinta"
        >
          Cancelar
        </Link>

        <span className="ml-auto hidden text-xs text-gris sm:block">
          Ctrl + Enter para guardar
        </span>
      </div>
    </form>
  );
}

function entrada(error?: string) {
  return `w-full rounded-xl border bg-white px-4 py-3 text-tinta outline-none transition focus:border-violeta ${
    error ? "border-red-400" : "border-borde"
  }`;
}

function Bloque({
  titulo,
  descripcion,
  children,
}: {
  titulo: string;
  descripcion?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-marco border border-borde bg-white p-6">
      <h2 className="titulo-display text-xl">{titulo}</h2>
      {descripcion && <p className="mt-1 text-sm text-gris">{descripcion}</p>}
      <div className="mt-5 space-y-4">{children}</div>
    </section>
  );
}

function Campo({
  etiqueta,
  error,
  ayuda,
  children,
}: {
  etiqueta: string;
  error?: string;
  ayuda?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.16em] text-gris">
        {etiqueta}
      </span>
      {children}
      {error ? (
        <span className="mt-1 block text-xs text-red-600">{error}</span>
      ) : ayuda ? (
        <span className="mt-1 block text-xs text-gris">{ayuda}</span>
      ) : null}
    </label>
  );
}
