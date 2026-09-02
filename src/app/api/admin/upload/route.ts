import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { auth } from "@/auth";

const TIPOS_PERMITIDOS = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const MAX_BYTES = 4 * 1024 * 1024;

export async function POST(request: Request) {
  const sesion = await auth();
  if (!sesion?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: "Falta configurar BLOB_READ_WRITE_TOKEN." },
      { status: 500 }
    );
  }

  const form = await request.formData();
  const archivo = form.get("archivo");

  if (!(archivo instanceof File)) {
    return NextResponse.json(
      { error: "No llegó ningún archivo." },
      { status: 400 }
    );
  }
  if (!TIPOS_PERMITIDOS.includes(archivo.type)) {
    return NextResponse.json(
      { error: "Formato no soportado. Usá JPG, PNG o WebP." },
      { status: 400 }
    );
  }
  if (archivo.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "La imagen supera los 4 MB." },
      { status: 400 }
    );
  }

  const extension = archivo.type.split("/")[1]?.replace("jpeg", "jpg") ?? "jpg";

  try {
    const blob = await put(`zapatillas/${randomUUID()}.${extension}`, archivo, {
      access: "public",
      contentType: archivo.type,
      addRandomSuffix: false,
    });
    return NextResponse.json({ url: blob.url });
  } catch (error) {
    console.error("[upload] Falló la subida a Vercel Blob:", error);
    return NextResponse.json(
      { error: "No se pudo subir la imagen." },
      { status: 500 }
    );
  }
}
