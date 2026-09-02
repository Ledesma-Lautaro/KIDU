import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { auth } from "@/auth";

const MAX_BYTES = 4 * 1024 * 1024;

const EXTENSIONES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

function detectarTipo(bytes: Uint8Array): string | null {
  if (bytes.length < 12) return null;

  const texto = (desde: number, hasta: number) =>
    String.fromCharCode(...bytes.slice(desde, hasta));

  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "image/jpeg";
  }
  if (texto(1, 4) === "PNG" && bytes[0] === 0x89) {
    return "image/png";
  }
  if (texto(0, 4) === "RIFF" && texto(8, 12) === "WEBP") {
    return "image/webp";
  }
  if (texto(4, 8) === "ftyp") {
    const marca = texto(8, 12);
    if (marca === "avif" || marca === "avis") return "image/avif";
    if (["heic", "heix", "hevc", "heim", "heis", "mif1", "msf1"].includes(marca)) {
      return "image/heic";
    }
  }
  return null;
}

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
  if (archivo.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "La imagen supera los 4 MB." },
      { status: 400 }
    );
  }

  const contenido = Buffer.from(await archivo.arrayBuffer());
  const tipo = detectarTipo(contenido);

  if (tipo === "image/heic") {
    return NextResponse.json(
      {
        error:
          "El archivo está en formato HEIC (iPhone) y los navegadores no lo muestran. Convertilo a JPG y volvé a subirlo.",
      },
      { status: 400 }
    );
  }
  if (!tipo) {
    return NextResponse.json(
      { error: "Formato no soportado. Usá JPG, PNG o WebP." },
      { status: 400 }
    );
  }

  try {
    const blob = await put(
      `zapatillas/${randomUUID()}.${EXTENSIONES[tipo]}`,
      contenido,
      {
        access: "public",
        contentType: tipo,
        addRandomSuffix: false,
      }
    );
    return NextResponse.json({ url: blob.url });
  } catch (error) {
    console.error("[upload] Falló la subida a Vercel Blob:", error);

    const detalle =
      error instanceof Error && error.message.startsWith("Vercel Blob:")
        ? error.message.slice("Vercel Blob:".length).trim()
        : null;

    return NextResponse.json(
      {
        error: detalle
          ? `No se pudo subir la imagen. ${detalle}`
          : "No se pudo subir la imagen.",
      },
      { status: 500 }
    );
  }
}
