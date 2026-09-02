"use server";

import { revalidatePath } from "next/cache";
import { del } from "@vercel/blob";
import { auth, signIn, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
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

export async function alternarActivo(id: string, activo: boolean) {
  await exigirAdmin();
  await prisma.zapatilla.update({ where: { id }, data: { activo } });
  refrescarVistas(id);
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
