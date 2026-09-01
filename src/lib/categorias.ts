/**
 * Lista cerrada de categorías.
 *
 * Es la única fuente de verdad: alimenta el <select> del admin, los filtros del
 * catálogo y la validación del formulario. Para agregar o sacar una categoría,
 * editá SOLO este array — no hace falta migrar la base de datos.
 *
 * Ojo: si borrás una categoría que ya está usada por alguna zapatilla, esos
 * modelos van a seguir teniendo el valor viejo guardado. Editalos desde /admin.
 */
export const CATEGORIAS = [
  "running",
  "urbana",
  "basketball",
  "skate",
  "lifestyle",
] as const;

export type Categoria = (typeof CATEGORIAS)[number];

/** Etiqueta para mostrar en pantalla (capitalizada). */
export function labelCategoria(categoria: string): string {
  return categoria.charAt(0).toUpperCase() + categoria.slice(1);
}

export function esCategoriaValida(valor: string): valor is Categoria {
  return (CATEGORIAS as readonly string[]).includes(valor);
}
