export const CATEGORIAS = [
  "running",
  "urbana",
  "basketball",
  "skate",
  "lifestyle",
] as const;

export type Categoria = (typeof CATEGORIAS)[number];

export function labelCategoria(categoria: string): string {
  return categoria.charAt(0).toUpperCase() + categoria.slice(1);
}

export function esCategoriaValida(valor: string): valor is Categoria {
  return (CATEGORIAS as readonly string[]).includes(valor);
}
