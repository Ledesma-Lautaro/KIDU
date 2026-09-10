export type FichaPublicable = {
  precio: number;
  imagenes: string[];
  talles: { stock: boolean }[];
};

export function motivoIncompleta(
  ficha: FichaPublicable
): { campo: "imagenes" | "precio" | "talles"; mensaje: string } | null {
  if (ficha.imagenes.length === 0) {
    return { campo: "imagenes", mensaje: "Subí al menos una foto antes de publicar." };
  }
  if (ficha.precio <= 0) {
    return { campo: "precio", mensaje: "Poné un precio antes de publicar." };
  }
  if (ficha.talles.length === 0) {
    return { campo: "talles", mensaje: "Cargá al menos un talle antes de publicar." };
  }
  return null;
}
