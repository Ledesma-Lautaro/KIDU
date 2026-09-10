import { formatearTalle } from "./format";

export type FilaTalle = {
  br: number;
  arg: number;
  eur: number;
  plantilla: number;
};

export const TABLA_TALLES: FilaTalle[] = [
  { br: 34, arg: 35, eur: 36, plantilla: 23.5 },
  { br: 35, arg: 36, eur: 37, plantilla: 24 },
  { br: 36, arg: 37, eur: 38, plantilla: 24.5 },
  { br: 37, arg: 38, eur: 39, plantilla: 25 },
  { br: 38, arg: 39, eur: 40, plantilla: 26 },
  { br: 39, arg: 40, eur: 41, plantilla: 26.5 },
  { br: 40, arg: 41, eur: 42, plantilla: 27 },
  { br: 41, arg: 42, eur: 43, plantilla: 27.5 },
  { br: 42, arg: 43, eur: 44, plantilla: 28 },
  { br: 43, arg: 44, eur: 45, plantilla: 29 },
];

export type Conversion = {
  arg: number;
  eur: number;
  plantilla: number | null;
  enTabla: boolean;
};

export function convertir(br: number): Conversion {
  const fila = TABLA_TALLES.find((f) => f.br === br);
  if (fila) {
    return { arg: fila.arg, eur: fila.eur, plantilla: fila.plantilla, enTabla: true };
  }
  return { arg: br + 1, eur: br + 2, plantilla: null, enTabla: false };
}

export function formatearPlantilla(cm: number): string {
  return `${cm.toString().replace(".", ",")} cm`;
}

export function equivalenciaCompleta(br: number): string {
  const c = convertir(br);
  const partes = [
    `BR ${formatearTalle(br)}`,
    `ARG ${formatearTalle(c.arg)}`,
    `EUR ${formatearTalle(c.eur)}`,
  ];
  if (c.plantilla !== null) partes.push(formatearPlantilla(c.plantilla));
  return partes.join(" · ");
}

export function talleParaMensaje(br: number): string {
  const c = convertir(br);
  return `BR ${formatearTalle(br)} (ARG ${formatearTalle(c.arg)})`;
}
