export const siteConfig = {
  nombre: "KIDU",
  descripcion: "Catálogo de zapatillas — modelos originales, entrega en el día.",
  tagline: "Sneakers seleccionadas",
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
} as const;

export function mensajeWhatsApp({
  marca,
  modelo,
  color,
  talle,
  url,
}: {
  marca: string;
  modelo: string;
  color?: string | null;
  talle?: string | null;
  url: string;
}): string {
  const conColor = color ? ` ${color}` : "";
  const conTalle = talle ? `, talle ${talle}` : "";
  return `Hola! Estoy interesado/a en las ${marca} ${modelo}${conColor}${conTalle}, las vi en ${url}. ¿Están disponibles?`;
}
