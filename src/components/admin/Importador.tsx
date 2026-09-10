"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { guardarZapatilla } from "@/app/admin/actions";
import { CATEGORIAS, labelCategoria } from "@/lib/categorias";
import {
  esImagenProbable,
  miniatura,
  subirImagen,
} from "@/lib/imagenes-cliente";

type Foto = {
  id: string;
  archivo: File;
  marca: string;
  miniatura?: string;
  error?: string;
};

type Grupo = {
  id: string;
  marca: string;
  modelo: string;
  color: string;
  categoria: string;
  fotos: string[];
  urls: Record<string, string>;
  estado: "pendiente" | "guardando" | "listo" | "error";
  mensaje?: string;
};

type Armado = { marca: string; modelo: string; color: string; categoria: string };

const MAX_FOTOS = 10;

const CAMPO =
  "w-full rounded-xl border border-borde bg-white px-3 py-2.5 text-sm text-tinta outline-none transition focus:border-violeta disabled:bg-humo";

const ordenNatural = (a: string, b: string) =>
  a.localeCompare(b, "es", { numeric: true, sensitivity: "base" });

function marcaDesdeRuta(archivo: File) {
  const partes = archivo.webkitRelativePath.split("/").filter(Boolean);
  return partes.length >= 2 ? partes[partes.length - 2] : "";
}

function claveArchivo(a: File) {
  return `${a.webkitRelativePath || a.name}:${a.size}`;
}

export function Importador({
  modelosExistentes,
}: {
  modelosExistentes: string[];
}) {
  const [fotos, setFotos] = useState<Foto[]>([]);
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [seleccion, setSeleccion] = useState<Set<string>>(new Set());
  const [ancla, setAncla] = useState<string | null>(null);
  const [armando, setArmando] = useState<Armado | null>(null);
  const [ultimaCategoria, setUltimaCategoria] = useState<string>(CATEGORIAS[0]);
  const [guardando, setGuardando] = useState(false);

  const vivo = useRef(true);
  const urlsCreadas = useRef<string[]>([]);
  const inputCarpeta = useRef<HTMLInputElement>(null);
  const inputArchivos = useRef<HTMLInputElement>(null);

  useEffect(() => {
    vivo.current = true;
    const urls = urlsCreadas.current;
    return () => {
      vivo.current = false;
      urls.forEach((u) => URL.revokeObjectURL(u));
    };
  }, []);

  const porId = useMemo(() => new Map(fotos.map((f) => [f.id, f])), [fotos]);
  const agrupadas = useMemo(
    () => new Set(grupos.flatMap((g) => g.fotos)),
    [grupos]
  );
  const pool = useMemo(
    () => fotos.filter((f) => !agrupadas.has(f.id)),
    [fotos, agrupadas]
  );
  const porMarca = useMemo(() => {
    const mapa = new Map<string, Foto[]>();
    for (const f of pool) {
      const clave = f.marca || "Sin carpeta";
      mapa.set(clave, [...(mapa.get(clave) ?? []), f]);
    }
    return [...mapa.entries()];
  }, [pool]);

  const modelosSugeridos = useMemo(
    () =>
      [...new Set([...modelosExistentes, ...grupos.map((g) => g.modelo)])]
        .filter(Boolean)
        .sort(ordenNatural),
    [modelosExistentes, grupos]
  );

  const seleccionadas = fotos.filter((f) => seleccion.has(f.id));
  const preparando = fotos.filter((f) => !f.miniatura && !f.error).length;
  const porGuardar = grupos.filter((g) => g.estado !== "listo").length;
  const listos = grupos.length - porGuardar;

  useEffect(() => {
    if (porGuardar === 0 && !guardando) return;
    const avisar = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", avisar);
    return () => window.removeEventListener("beforeunload", avisar);
  }, [porGuardar, guardando]);

  async function generarMiniaturas(lote: Foto[]) {
    const cola = [...lote];
    const trabajar = async () => {
      while (cola.length && vivo.current) {
        const f = cola.shift()!;
        try {
          const url = await miniatura(f.archivo);
          urlsCreadas.current.push(url);
          setFotos((prev) =>
            prev.map((p) => (p.id === f.id ? { ...p, miniatura: url } : p))
          );
        } catch (e) {
          const error = e instanceof Error ? e.message : "No se pudo leer";
          setFotos((prev) =>
            prev.map((p) => (p.id === f.id ? { ...p, error } : p))
          );
        }
      }
    };
    await Promise.all([trabajar(), trabajar()]);
  }

  function agregarArchivos(lista: FileList | null) {
    if (!lista) return;
    const yaCargadas = new Set(fotos.map((f) => claveArchivo(f.archivo)));
    const nuevas: Foto[] = Array.from(lista)
      .filter(esImagenProbable)
      .filter((a) => !yaCargadas.has(claveArchivo(a)))
      .map((a) => ({ id: crypto.randomUUID(), archivo: a, marca: marcaDesdeRuta(a) }));
    if (nuevas.length === 0) return;

    setFotos((prev) =>
      [...prev, ...nuevas].sort(
        (a, b) =>
          ordenNatural(a.marca, b.marca) || ordenNatural(a.archivo.name, b.archivo.name)
      )
    );
    void generarMiniaturas(nuevas);
  }

  function clickFoto(id: string, lista: Foto[], extender: boolean) {
    setSeleccion((prev) => {
      const siguiente = new Set(prev);
      if (extender && ancla) {
        const a = lista.findIndex((f) => f.id === ancla);
        const b = lista.findIndex((f) => f.id === id);
        if (a !== -1 && b !== -1) {
          const [desde, hasta] = a < b ? [a, b] : [b, a];
          lista.slice(desde, hasta + 1).forEach((f) => siguiente.add(f.id));
          return siguiente;
        }
      }
      if (siguiente.has(id)) siguiente.delete(id);
      else siguiente.add(id);
      return siguiente;
    });
    if (!extender) setAncla(id);
  }

  function limpiarSeleccion() {
    setSeleccion(new Set());
    setAncla(null);
    setArmando(null);
  }

  function abrirArmado() {
    const marcas = [...new Set(seleccionadas.map((f) => f.marca).filter(Boolean))];
    setArmando({
      marca: marcas.length === 1 ? marcas[0] : "",
      modelo: "",
      color: "",
      categoria: ultimaCategoria,
    });
  }

  function confirmarArmado() {
    if (!armando?.marca.trim() || !armando.modelo.trim()) return;
    setGrupos((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        marca: armando.marca.trim(),
        modelo: armando.modelo.trim(),
        color: armando.color.trim(),
        categoria: armando.categoria,
        fotos: seleccionadas.map((f) => f.id),
        urls: {},
        estado: "pendiente",
      },
    ]);
    setUltimaCategoria(armando.categoria);
    limpiarSeleccion();
  }

  function descartarSeleccion() {
    setFotos((prev) => prev.filter((f) => !seleccion.has(f.id)));
    limpiarSeleccion();
  }

  function actualizarGrupo(id: string, cambios: Partial<Grupo>) {
    setGrupos((prev) => prev.map((g) => (g.id === id ? { ...g, ...cambios } : g)));
  }

  function hacerPrincipal(grupoId: string, fotoId: string) {
    setGrupos((prev) =>
      prev.map((g) =>
        g.id === grupoId
          ? { ...g, fotos: [fotoId, ...g.fotos.filter((f) => f !== fotoId)] }
          : g
      )
    );
  }

  async function guardarTodos() {
    setGuardando(true);
    for (const g of grupos) {
      if (g.estado === "listo") continue;
      actualizarGrupo(g.id, { estado: "guardando", mensaje: undefined });
      const urls = { ...g.urls };

      try {
        for (const [i, fotoId] of g.fotos.entries()) {
          if (urls[fotoId]) continue;
          const foto = porId.get(fotoId);
          if (!foto) continue;
          actualizarGrupo(g.id, {
            mensaje: `Subiendo foto ${i + 1} de ${g.fotos.length}…`,
          });
          urls[fotoId] = await subirImagen(foto.archivo);
          actualizarGrupo(g.id, { urls: { ...urls } });
        }

        const res = await guardarZapatilla({
          marca: g.marca,
          modelo: g.modelo,
          categoria: g.categoria,
          color: g.color,
          precio: 0,
          descripcion: "",
          imagenes: g.fotos.map((f) => urls[f]).filter(Boolean),
          talles: [],
          activo: false,
        });
        if (!res.ok) {
          throw new Error(Object.values(res.campos ?? {})[0] ?? res.error);
        }
        actualizarGrupo(g.id, { estado: "listo", mensaje: undefined });
      } catch (e) {
        actualizarGrupo(g.id, {
          estado: "error",
          mensaje: e instanceof Error ? e.message : "No se pudo guardar.",
        });
      }
    }
    setGuardando(false);
  }

  const selectorCategoria = (valor: string, onCambio: (v: string) => void, deshabilitado = false) => (
    <select
      value={valor}
      disabled={deshabilitado}
      onChange={(e) => onCambio(e.target.value)}
      className={CAMPO}
    >
      {CATEGORIAS.map((c) => (
        <option key={c} value={c}>
          {labelCategoria(c)}
        </option>
      ))}
    </select>
  );

  return (
    <div className="space-y-8 pb-40">
      <section className="rounded-marco border border-borde bg-white p-6">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => inputCarpeta.current?.click()}
            className="rounded-xl bg-violeta px-5 py-3 font-semibold text-white transition hover:bg-violeta-oscuro"
          >
            Elegir carpeta
          </button>
          <button
            type="button"
            onClick={() => inputArchivos.current?.click()}
            className="rounded-xl border border-borde px-5 py-3 font-semibold text-tinta transition hover:border-tinta"
          >
            Elegir fotos sueltas
          </button>
          <p className="text-sm text-gris">
            {fotos.length === 0
              ? "Descargá la carpeta del Drive, descomprimila y elegila acá."
              : `${fotos.length} fotos · ${pool.length} sin agrupar${
                  preparando ? ` · preparando ${preparando}…` : ""
                }`}
          </p>
        </div>

        <input
          ref={inputCarpeta}
          type="file"
          multiple
          className="hidden"
          {...{ webkitdirectory: "", directory: "" }}
          onChange={(e) => {
            agregarArchivos(e.target.files);
            e.target.value = "";
          }}
        />
        <input
          ref={inputArchivos}
          type="file"
          multiple
          accept="image/*,.heic,.heif"
          className="hidden"
          onChange={(e) => {
            agregarArchivos(e.target.files);
            e.target.value = "";
          }}
        />
      </section>

      {porMarca.map(([marca, lista]) => (
        <section key={marca} className="rounded-marco border border-borde bg-white p-6">
          <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="titulo-display text-2xl">{marca}</h2>
            <p className="text-xs text-gris">
              {lista.length} fotos · click para elegir · Shift + click elige un tramo
            </p>
          </div>

          <ul className="grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-8">
            {lista.map((f) => {
              const activa = seleccion.has(f.id);
              return (
                <li key={f.id}>
                  <button
                    type="button"
                    onClick={(e) => clickFoto(f.id, lista, e.shiftKey)}
                    aria-pressed={activa}
                    title={f.error ?? f.archivo.name}
                    className={`relative block aspect-square w-full overflow-hidden rounded-xl border-2 bg-humo transition ${
                      activa
                        ? "border-violeta ring-2 ring-violeta/40"
                        : "border-transparent hover:border-borde"
                    }`}
                  >
                    {f.miniatura ? (
                      <Image
                        src={f.miniatura}
                        alt={f.archivo.name}
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    ) : (
                      <span className="flex h-full items-center justify-center p-1 text-center text-[10px] text-gris">
                        {f.error ? "No se pudo leer" : "…"}
                      </span>
                    )}
                    {activa && (
                      <span className="absolute right-1 top-1 flex size-5 items-center justify-center rounded-full bg-violeta text-[11px] font-bold text-white">
                        ✓
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      ))}

      {grupos.length > 0 && (
        <section className="rounded-marco border border-borde bg-white p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="titulo-display text-2xl">Modelos armados</h2>
              <p className="text-sm text-gris">
                {porGuardar} por guardar · {listos} guardados como borrador
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              {listos > 0 && (
                <Link
                  href="/admin/planilla"
                  className="rounded-xl border border-borde px-5 py-3 font-semibold text-tinta transition hover:border-tinta"
                >
                  Completar en la planilla →
                </Link>
              )}
              <button
                type="button"
                disabled={guardando || porGuardar === 0}
                onClick={guardarTodos}
                className="rounded-xl bg-violeta px-5 py-3 font-semibold text-white transition hover:bg-violeta-oscuro disabled:opacity-50"
              >
                {guardando
                  ? "Guardando…"
                  : `Guardar ${porGuardar} ${porGuardar === 1 ? "borrador" : "borradores"}`}
              </button>
            </div>
          </div>

          <ul className="space-y-3">
            {grupos.map((g) => {
              const bloqueado = guardando || g.estado === "guardando" || g.estado === "listo";
              return (
                <li
                  key={g.id}
                  className={`rounded-2xl border p-4 ${
                    g.estado === "error"
                      ? "border-red-300 bg-red-50/50"
                      : g.estado === "listo"
                        ? "border-violeta/30 bg-violeta-tenue/50"
                        : "border-borde"
                  }`}
                >
                  <div className="flex flex-wrap gap-2">
                    {g.fotos.map((fotoId, i) => {
                      const f = porId.get(fotoId);
                      return (
                        <button
                          key={fotoId}
                          type="button"
                          disabled={bloqueado}
                          onClick={() => hacerPrincipal(g.id, fotoId)}
                          title={i === 0 ? "Foto principal" : "Usar como principal"}
                          className={`relative size-16 overflow-hidden rounded-lg border-2 bg-humo ${
                            i === 0 ? "border-violeta" : "border-transparent"
                          }`}
                        >
                          {f?.miniatura && (
                            <Image src={f.miniatura} alt="" fill unoptimized className="object-cover" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-3 grid gap-2 sm:grid-cols-4">
                    <input
                      value={g.marca}
                      disabled={bloqueado}
                      onChange={(e) => actualizarGrupo(g.id, { marca: e.target.value })}
                      placeholder="Marca"
                      className={CAMPO}
                    />
                    <input
                      value={g.modelo}
                      disabled={bloqueado}
                      list="modelos-sugeridos"
                      onChange={(e) => actualizarGrupo(g.id, { modelo: e.target.value })}
                      placeholder="Modelo"
                      className={CAMPO}
                    />
                    <input
                      value={g.color}
                      disabled={bloqueado}
                      onChange={(e) => actualizarGrupo(g.id, { color: e.target.value })}
                      placeholder="Color (opcional)"
                      className={CAMPO}
                    />
                    {selectorCategoria(
                      g.categoria,
                      (v) => actualizarGrupo(g.id, { categoria: v }),
                      bloqueado
                    )}
                  </div>

                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm">
                    <span className={g.estado === "error" ? "text-red-600" : "text-gris"}>
                      {g.estado === "listo"
                        ? "✓ Guardado como borrador oculto"
                        : (g.mensaje ?? `${g.fotos.length} ${g.fotos.length === 1 ? "foto" : "fotos"}`)}
                    </span>
                    {g.estado !== "listo" && (
                      <button
                        type="button"
                        disabled={bloqueado}
                        onClick={() => setGrupos((prev) => prev.filter((x) => x.id !== g.id))}
                        className="text-gris transition hover:text-red-600 disabled:opacity-50"
                      >
                        Desarmar
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <datalist id="modelos-sugeridos">
        {modelosSugeridos.map((m) => (
          <option key={m} value={m} />
        ))}
      </datalist>

      {seleccionadas.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-borde bg-white/95 backdrop-blur">
          <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6">
            {armando ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  confirmarArmado();
                }}
                className="grid items-center gap-2 sm:grid-cols-[1fr_1fr_1fr_1fr_auto_auto]"
              >
                <input
                  value={armando.marca}
                  onChange={(e) => setArmando({ ...armando, marca: e.target.value })}
                  placeholder="Marca"
                  required
                  className={CAMPO}
                />
                <input
                  value={armando.modelo}
                  onChange={(e) => setArmando({ ...armando, modelo: e.target.value })}
                  list="modelos-sugeridos"
                  placeholder="Modelo"
                  required
                  autoFocus
                  className={CAMPO}
                />
                <input
                  value={armando.color}
                  onChange={(e) => setArmando({ ...armando, color: e.target.value })}
                  placeholder="Color (opcional)"
                  className={CAMPO}
                />
                {selectorCategoria(armando.categoria, (v) =>
                  setArmando({ ...armando, categoria: v })
                )}
                <button
                  type="submit"
                  className="rounded-xl bg-violeta px-5 py-2.5 font-semibold text-white transition hover:bg-violeta-oscuro"
                >
                  Crear modelo
                </button>
                <button
                  type="button"
                  onClick={() => setArmando(null)}
                  className="px-3 text-sm text-gris transition hover:text-tinta"
                >
                  Cancelar
                </button>
              </form>
            ) : (
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-sm font-semibold text-tinta">
                  {seleccionadas.length}{" "}
                  {seleccionadas.length === 1 ? "foto seleccionada" : "fotos seleccionadas"}
                </p>
                {seleccionadas.length > MAX_FOTOS && (
                  <p className="text-sm text-red-600">Máximo {MAX_FOTOS} fotos por modelo.</p>
                )}
                <button
                  type="button"
                  disabled={seleccionadas.length > MAX_FOTOS}
                  onClick={abrirArmado}
                  className="rounded-xl bg-violeta px-5 py-2.5 font-semibold text-white transition hover:bg-violeta-oscuro disabled:opacity-50"
                >
                  Armar modelo
                </button>
                <button
                  type="button"
                  onClick={descartarSeleccion}
                  className="rounded-xl border border-borde px-5 py-2.5 font-semibold text-tinta transition hover:border-tinta"
                >
                  Descartar
                </button>
                <button
                  type="button"
                  onClick={limpiarSeleccion}
                  className="text-sm text-gris transition hover:text-tinta"
                >
                  Limpiar selección
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
