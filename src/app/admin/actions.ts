"use server";

import { revalidatePath } from "next/cache";
import { del } from "@vercel/blob";
import { z } from "zod";
import { auth, signIn, signOut } from "@/auth";
import { CATEGORIAS } from "@/lib/categorias";
import { prisma } from "@/lib/prisma";
import { motivoIncompleta } from "@/lib/publicacion";
import { zapatillaSchema } from "@/lib/validaciones";

export type Resultado =
  | { ok: true; id: string }
  | { ok: false; error: string; campos?: Record<string, string> };

async function exigirAdmin() {
  const sesion = await auth();
  if (!sesion?.user) throw new Error("No autorizado");
}

function refrescarVistas(id?: string) {
  revalidatePath("/");
  revalidatePath("/admin");
  if (id) revalidatePath(`/zapatilla/${id}`);
}

function aMapaDeErrores(issues: { path: PropertyKey[]; message: string }[]) {
  const campos: Record<string, string> = {};
  for (const issue of issues) {
    const clave = issue.path.join(".");
    if (!campos[clave]) campos[clave] = issue.message;

    const raiz = String(issue.path[0] ?? "");
    if (raiz && raiz !== clave && !campos[raiz]) campos[raiz] = issue.message;
  }
  return campos;
}

export async function guardarZapatilla(
  datosCrudos: unknown,
  id?: string
): Promise<Resultado> {
  await exigirAdmin();

  const parseo = zapatillaSchema.safeParse(datosCrudos);
  if (!parseo.success) {
    return {
      ok: false,
      error: "Revisá los campos marcados.",
      campos: aMapaDeErrores(parseo.error.issues),
    };
  }

  const { talles, descripcion, color, ...zapatilla } = parseo.data;
  const datos = {
    ...zapatilla,
    descripcion: descripcion?.trim() ? descripcion.trim() : null,
    color: color?.trim() ? color.trim() : null,
  };

  try {
    if (id) {
      const [actualizada] = await prisma.$transaction([
        prisma.zapatilla.update({ where: { id }, data: datos }),
        prisma.talle.deleteMany({ where: { zapatillaId: id } }),
        prisma.talle.createMany({
          data: talles.map((t) => ({ ...t, zapatillaId: id })),
        }),
      ]);
      refrescarVistas(actualizada.id);
      return { ok: true, id: actualizada.id };
    }

    const creada = await prisma.zapatilla.create({
      data: { ...datos, talles: { create: talles } },
    });
    refrescarVistas(creada.id);
    return { ok: true, id: creada.id };
  } catch (error) {
    console.error("[admin] Error al guardar la zapatilla:", error);
    return {
      ok: false,
      error: "No se pudo guardar. Revisá la conexión con la base de datos.",
    };
  }
}

export type ResultadoSimple = { ok: true } | { ok: false; error: string };

export async function alternarActivo(
  id: string,
  activo: boolean
): Promise<ResultadoSimple> {
  await exigirAdmin();

  if (activo) {
    const ficha = await prisma.zapatilla.findUnique({
      where: { id },
      select: { precio: true, imagenes: true, talles: { select: { stock: true } } },
    });
    if (!ficha) return { ok: false, error: "La zapatilla ya no existe." };
    const falta = motivoIncompleta(ficha);
    if (falta) return { ok: false, error: falta.mensaje };
  }

  await prisma.zapatilla.update({ where: { id }, data: { activo } });
  refrescarVistas(id);
  return { ok: true };
}

const cambioRapidoSchema = z.object({
  modelo: z.string().trim().min(1, "Poné el modelo").max(140),
  color: z.string().trim().max(40),
  categoria: z.enum(CATEGORIAS, { message: "Elegí una categoría" }),
  precio: z.number().int("Sin decimales").min(0).max(1_000_000_000),
  talles: z.array(z.number().positive().max(70)).max(40),
  activo: z.boolean(),
});

export type CambioRapido = z.infer<typeof cambioRapidoSchema>;

export async function guardarCambioRapido(
  id: string,
  crudo: unknown
): Promise<ResultadoSimple> {
  await exigirAdmin();

  const parseo = cambioRapidoSchema.safeParse(crudo);
  if (!parseo.success) {
    return { ok: false, error: parseo.error.issues[0]?.message ?? "Datos inválidos" };
  }
  const { talles, color, ...resto } = parseo.data;

  const actual = await prisma.zapatilla.findUnique({
    where: { id },
    select: { imagenes: true, talles: { select: { talle: true, stock: true } } },
  });
  if (!actual) return { ok: false, error: "La zapatilla ya no existe." };

  const stockPrevio = new Map(actual.talles.map((t) => [t.talle, t.stock]));
  const nuevosTalles = [...new Set(talles)]
    .sort((a, b) => a - b)
    .map((talle) => ({ talle, stock: stockPrevio.get(talle) ?? true }));

  if (resto.activo) {
    const falta = motivoIncompleta({
      precio: resto.precio,
      imagenes: actual.imagenes,
      talles: nuevosTalles,
    });
    if (falta) return { ok: false, error: falta.mensaje };
  }

  try {
    await prisma.$transaction([
      prisma.zapatilla.update({
        where: { id },
        data: { ...resto, color: color || null },
      }),
      prisma.talle.deleteMany({ where: { zapatillaId: id } }),
      prisma.talle.createMany({
        data: nuevosTalles.map((t) => ({ ...t, zapatillaId: id })),
      }),
    ]);
  } catch (error) {
    console.error("[admin] Error en guardado rápido:", error);
    return { ok: false, error: "No se pudo guardar." };
  }

  refrescarVistas(id);
  return { ok: true };
}

export async function eliminarZapatilla(id: string) {
  await exigirAdmin();

  const zapatilla = await prisma.zapatilla.findUnique({
    where: { id },
    select: { imagenes: true },
  });

  await prisma.zapatilla.delete({ where: { id } });

  if (zapatilla?.imagenes.length) {
    try {
      await del(zapatilla.imagenes);
    } catch (error) {
      console.error("[admin] No se pudieron borrar las imágenes:", error);
    }
  }

  refrescarVistas(id);
}

export async function iniciarSesion(
  _estadoPrevio: string | null,
  formData: FormData
): Promise<string | null> {
  try {
    await signIn("credentials", {
      usuario: formData.get("usuario"),
      password: formData.get("password"),
      redirectTo: "/admin",
    });
    return null;
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "digest" in error &&
      String((error as { digest?: string }).digest).startsWith("NEXT_REDIRECT")
    ) {
      throw error;
    }
    return "Usuario o contraseña incorrectos.";
  }
}

export async function cerrarSesion() {
  await signOut({ redirectTo: "/admin/login" });
}
