/**
 * Genera las imágenes de demo que usa `npm run db:seed`.
 * Son SVGs livianos, sin dependencias externas, para poder ver el diseño del
 * catálogo antes de tener fotos reales. Se corre una sola vez:
 *   node scripts/generar-placeholders.mjs
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const SALIDA = join(process.cwd(), "public", "demo");

const PALETAS = [
  { fondo: "#f4f4f5", zapatilla: "#0a0a0b", detalle: "#8a50f5" },
  { fondo: "#8a50f5", zapatilla: "#ffffff", detalle: "#0a0a0b" },
  { fondo: "#0a0a0b", zapatilla: "#8a50f5", detalle: "#ffffff" },
  { fondo: "#efe7fe", zapatilla: "#6d33d6", detalle: "#0a0a0b" },
  { fondo: "#0a0a0b", zapatilla: "#f4f4f5", detalle: "#8a50f5" },
  { fondo: "#ffffff", zapatilla: "#a97ff8", detalle: "#0a0a0b" },
];

/** Silueta lateral de zapatilla, dibujada a mano sobre un lienzo de 800x800. */
const CUERPO =
  "M96 566c0-38 26-59 70-68l104-22c33-7 58-22 80-46l84-92c26-28 55-40 92-36l70 8c30 3 49 19 58 45l24 68c9 26 28 43 55 51l70 20c34 10 51 30 51 60v34H96z";
const SUELA =
  "M88 588h680c18 0 30 12 30 30v20c0 18-12 30-30 30H88c-18 0-30-12-30-30v-20c0-18 12-30 30-30z";
const DETALLE =
  "M300 476l150-134c14-12 30-14 46-6 17 8 24 22 22 40l-14 116c-2 20-16 32-36 32H320c-18 0-30-10-33-27-2-15 2-27 13-37z";

mkdirSync(SALIDA, { recursive: true });

PALETAS.forEach((paleta, i) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="800" height="800">
  <rect width="800" height="800" fill="${paleta.fondo}"/>
  <circle cx="640" cy="180" r="150" fill="${paleta.detalle}" opacity="0.14"/>
  <g transform="translate(0 20)">
    <path d="${CUERPO}" fill="${paleta.zapatilla}"/>
    <path d="${DETALLE}" fill="${paleta.detalle}" opacity="0.85"/>
    <path d="${SUELA}" fill="${paleta.detalle}"/>
  </g>
</svg>
`;
  writeFileSync(join(SALIDA, `${i + 1}.svg`), svg, "utf8");
});

console.log(`Listo: ${PALETAS.length} imágenes en public/demo/`);
