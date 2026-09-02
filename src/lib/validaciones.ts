import { z } from "zod";
import { CATEGORIAS } from "./categorias";

export const talleSchema = z.object({
  talle: z
    .number({ message: "Talle inválido" })
    .positive("El talle tiene que ser mayor a 0")
    .max(70, "Talle fuera de rango"),
  stock: z.boolean(),
});

export const zapatillaSchema = z
  .object({
    marca: z.string().trim().min(1, "Poné la marca").max(60),
    modelo: z.string().trim().min(1, "Poné el modelo").max(140),
    categoria: z.enum(CATEGORIAS, { message: "Elegí una categoría" }),
    precio: z
      .number({ message: "El precio tiene que ser un número" })
      .int("El precio va sin decimales")
      .min(0, "El precio no puede ser negativo")
      .max(1_000_000_000),
    descripcion: z.string().trim().max(2000).optional(),
    imagenes: z
      .array(
        z
          .string()
          .trim()
          .refine(
            (v) => /^https?:\/\//.test(v) || v.startsWith("/"),
            "URL de imagen inválida"
          )
      )
      .min(1, "Subí al menos una imagen")
      .max(10, "Máximo 10 imágenes por modelo"),
    talles: z.array(talleSchema).max(40),
    activo: z.boolean(),
  })
  .superRefine((datos, ctx) => {
    const vistos = new Set<number>();
    datos.talles.forEach((t, i) => {
      if (vistos.has(t.talle)) {
        ctx.addIssue({
          code: "custom",
          path: ["talles", i, "talle"],
          message: `El talle ${t.talle} está cargado dos veces`,
        });
      }
      vistos.add(t.talle);
    });
  });

export type ZapatillaInput = z.infer<typeof zapatillaSchema>;
