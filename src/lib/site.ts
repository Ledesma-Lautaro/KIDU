/**
 * Configuración general del sitio.
 * Todo lo que se cambia seguido (nombre, textos, mensaje de WhatsApp) vive acá.
 */
export const siteConfig = {
  nombre: "KIDU",
  descripcion: "Catálogo de zapatillas — modelos originales, entrega en el día.",
  tagline: "Sneakers seleccionadas",
  /** Número en formato internacional, sin + ni espacios. Ej: 5491122334455 */
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
} as const;

/**
 * Mensaje que se precarga en WhatsApp. Editalo libremente: la lógica del botón
 * no depende del texto, solo llama a esta función.
 */
export function mensajeWhatsApp({
  marca,
  modelo,
  talle,
  url,
}: {
  marca: string;
  modelo: string;
  talle?: string | null;
  url: string;
}): string {
  const conTalle = talle ? `, talle ${talle}` : "";
  return `Hola! Estoy interesado/a en las ${marca} ${modelo}${conTalle}, las vi en ${url}. ¿Están disponibles?`;
}
