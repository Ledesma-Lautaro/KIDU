import { mensajeWhatsApp, siteConfig } from "./site";

export type DatosContacto = {
  marca: string;
  modelo: string;
  talle?: string | null;
  /** Path de la página de detalle, ej: /zapatilla/abc123 */
  path: string;
  /** Origin a usar para el link. Si no se pasa, usa NEXT_PUBLIC_SITE_URL. */
  origin?: string;
};

/**
 * Arma el link wa.me con el mensaje precargado.
 * Si no hay número configurado devuelve null, para que el botón se muestre
 * deshabilitado en vez de abrir un WhatsApp roto.
 */
export function linkWhatsApp({
  marca,
  modelo,
  talle,
  path,
  origin,
}: DatosContacto): string | null {
  const numero = siteConfig.whatsapp.replace(/\D/g, "");
  if (!numero) return null;

  const base = (origin ?? siteConfig.url).replace(/\/$/, "");
  const texto = mensajeWhatsApp({ marca, modelo, talle, url: `${base}${path}` });

  return `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`;
}
