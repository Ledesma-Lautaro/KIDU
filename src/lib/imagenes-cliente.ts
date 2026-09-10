const LADO_MAXIMO = 1600;

export class ImagenIlegible extends Error {
  constructor(nombre: string) {
    super(`"${nombre}" no se pudo leer como imagen.`);
    this.name = "ImagenIlegible";
  }
}

async function esHeic(archivo: File): Promise<boolean> {
  const cabecera = new Uint8Array(await archivo.slice(0, 12).arrayBuffer());
  if (cabecera.length < 12) return false;
  const texto = (a: number, b: number) =>
    String.fromCharCode(...cabecera.slice(a, b));
  if (texto(4, 8) !== "ftyp") return false;
  return ["heic", "heix", "hevc", "hevx", "heim", "heis", "mif1", "msf1"].includes(
    texto(8, 12)
  );
}

async function decodificar(archivo: File): Promise<ImageBitmap> {
  if (await esHeic(archivo)) {
    const { heicTo } = await import("heic-to/next");
    try {
      return await heicTo({ blob: archivo, type: "bitmap" });
    } catch {
      throw new ImagenIlegible(archivo.name);
    }
  }
  try {
    return await createImageBitmap(archivo, { imageOrientation: "from-image" });
  } catch {
    throw new ImagenIlegible(archivo.name);
  }
}

async function reencodar(
  bitmap: ImageBitmap,
  lado: number,
  calidad: number
): Promise<Blob> {
  const escala = Math.min(1, lado / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * escala);
  canvas.height = Math.round(bitmap.height * escala);

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("El navegador no pudo procesar la imagen.");
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/webp", calidad)
  );
  if (!blob) throw new Error("El navegador no pudo procesar la imagen.");
  return blob;
}

export async function optimizar(archivo: File): Promise<File> {
  const bitmap = await decodificar(archivo);
  try {
    const blob = await reencodar(bitmap, LADO_MAXIMO, 0.85);
    return new File([blob], `${archivo.name.replace(/\.[^.]+$/, "")}.webp`, {
      type: "image/webp",
    });
  } finally {
    bitmap.close();
  }
}

export async function miniatura(archivo: File, lado = 360): Promise<string> {
  const bitmap = await decodificar(archivo);
  try {
    return URL.createObjectURL(await reencodar(bitmap, lado, 0.7));
  } finally {
    bitmap.close();
  }
}

export async function subirImagen(archivo: File): Promise<string> {
  const optimizado = await optimizar(archivo);
  const body = new FormData();
  body.append("archivo", optimizado);

  const res = await fetch("/api/admin/upload", { method: "POST", body });
  const datos = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(datos.error ?? "No se pudo subir la imagen.");
  return datos.url as string;
}

export function esImagenProbable(archivo: File): boolean {
  if (archivo.type.startsWith("image/")) return true;
  return /\.(jpe?g|png|webp|avif|heic|heif)$/i.test(archivo.name);
}
