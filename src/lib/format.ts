const formateadorARS = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

/** 150000 -> "$ 150.000" */
export function formatearPrecio(precio: number): string {
  // Intl devuelve "$ 150.000" en es-AR; normalizamos el espacio raro (NBSP)
  // que algunos runtimes insertan, para que sea un espacio común.
  return formateadorARS.format(precio).replace(/ /g, " ");
}

/** 40 -> "40" | 40.5 -> "40.5" */
export function formatearTalle(talle: number): string {
  return Number.isInteger(talle) ? String(talle) : String(talle);
}
