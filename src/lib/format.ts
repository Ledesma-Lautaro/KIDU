const formateadorARS = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export function formatearPrecio(precio: number): string {
  return formateadorARS.format(precio).replace(/ /g, " ");
}

export function formatearTalle(talle: number): string {
  return Number.isInteger(talle) ? String(talle) : String(talle);
}
