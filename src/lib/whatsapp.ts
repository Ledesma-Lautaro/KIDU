import { mensajeWhatsApp, siteConfig } from "./site";

export type DatosContacto = {
  marca: string;
  modelo: string;
  talle?: string | null;
  path: string;
  origin?: string;
};

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
