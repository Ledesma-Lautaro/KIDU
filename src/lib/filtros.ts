import { esCategoriaValida } from "./categorias";

export const POR_PAGINA = 24;

export const ORDENES = {
  nuevo: "Más nuevos",
  "precio-asc": "Precio: menor a mayor",
  "precio-desc": "Precio: mayor a menor",
} as const;

export type Orden = keyof typeof ORDENES;

export type FiltrosCatalogo = {
  q: string;
  marcas: string[];
  categorias: string[];
  colores: string[];
  precioMin: number | null;
  precioMax: number | null;
  talles: number[];
  orden: Orden;
  pagina: number;
};

export type ParamsCrudos = Record<string, string | string[] | undefined>;

function comoLista(valor: string | string[] | undefined): string[] {
  if (!valor) return [];
  const bruto = Array.isArray(valor) ? valor : valor.split(",");
  return [...new Set(bruto.map((v) => v.trim()).filter(Boolean))];
}

function comoNumero(valor: string | string[] | undefined): number | null {
  const texto = Array.isArray(valor) ? valor[0] : valor;
  if (!texto) return null;
  const n = Number(texto);
  return Number.isFinite(n) ? n : null;
}

function comoTexto(valor: string | string[] | undefined): string {
  return (Array.isArray(valor) ? valor[0] : valor ?? "").trim();
}

export function parsearFiltros(params: ParamsCrudos): FiltrosCatalogo {
  const ordenCrudo = comoTexto(params.orden);
  const orden: Orden = ordenCrudo in ORDENES ? (ordenCrudo as Orden) : "nuevo";

  return {
    q: comoTexto(params.q).slice(0, 80),
    marcas: comoLista(params.marca).slice(0, 20),
    categorias: comoLista(params.categoria).filter(esCategoriaValida),
    colores: comoLista(params.color).slice(0, 20),
    precioMin: comoNumero(params.min),
    precioMax: comoNumero(params.max),
    talles: comoLista(params.talle)
      .map(Number)
      .filter((n) => Number.isFinite(n) && n > 0)
      .slice(0, 30),
    orden,
    pagina: Math.max(1, Math.trunc(comoNumero(params.pagina) ?? 1)),
  };
}

export function aQueryString(f: Partial<FiltrosCatalogo>): string {
  const p = new URLSearchParams();
  if (f.q) p.set("q", f.q);
  if (f.marcas?.length) p.set("marca", f.marcas.join(","));
  if (f.categorias?.length) p.set("categoria", f.categorias.join(","));
  if (f.colores?.length) p.set("color", f.colores.join(","));
  if (f.precioMin != null) p.set("min", String(f.precioMin));
  if (f.precioMax != null) p.set("max", String(f.precioMax));
  if (f.talles?.length) p.set("talle", f.talles.join(","));
  if (f.orden && f.orden !== "nuevo") p.set("orden", f.orden);
  if (f.pagina && f.pagina > 1) p.set("pagina", String(f.pagina));
  const qs = p.toString();
  return qs ? `?${qs}` : "";
}

export function contarFiltrosActivos(f: FiltrosCatalogo): number {
  return (
    f.marcas.length +
    f.categorias.length +
    f.colores.length +
    f.talles.length +
    (f.precioMin != null || f.precioMax != null ? 1 : 0)
  );
}
