import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Galeria } from "@/components/detalle/Galeria";
import { PanelContacto } from "@/components/detalle/PanelContacto";
import { TarjetaZapatilla } from "@/components/catalogo/TarjetaZapatilla";
import { obtenerRelacionadas, obtenerZapatilla } from "@/lib/consultas";
import { labelCategoria } from "@/lib/categorias";
import { formatearPrecio } from "@/lib/format";

type Props = { params: Promise<{ id: string }> };

async function buscarSegura(id: string) {
  try {
    return await obtenerZapatilla(id);
  } catch (error) {
    console.error("[detalle] No se pudo leer la base de datos:", error);
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const z = await buscarSegura(id);
  if (!z) return { title: "Zapatilla no encontrada" };

  return {
    title: `${z.marca} ${z.modelo}`,
    description:
      z.descripcion ?? `${z.marca} ${z.modelo} — ${formatearPrecio(z.precio)}`,
    openGraph: {
      title: `${z.marca} ${z.modelo}`,
      description: z.descripcion ?? formatearPrecio(z.precio),
      images: z.imagenes[0] ? [{ url: z.imagenes[0] }] : undefined,
    },
  };
}

export default async function PaginaDetalle({ params }: Props) {
  const { id } = await params;
  const zapatilla = await buscarSegura(id);
  if (!zapatilla) notFound();

  const relacionadas = await obtenerRelacionadas(
    zapatilla.id,
    zapatilla.categoria
  ).catch(() => []);

  const disponibles = zapatilla.talles.filter((t) => t.stock).length;

  return (
    <>
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <nav aria-label="Miga de pan" className="mb-8 text-sm text-gris">
          <Link href="/" className="hover:text-tinta">
            Catálogo
          </Link>
          <span className="mx-2">/</span>
          <Link
            href={`/?categoria=${zapatilla.categoria}#catalogo`}
            className="hover:text-tinta"
          >
            {labelCategoria(zapatilla.categoria)}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-tinta">{zapatilla.modelo}</span>
        </nav>

        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <Galeria
            imagenes={zapatilla.imagenes}
            alt={`${zapatilla.marca} ${zapatilla.modelo}`}
          />

          <div className="lg:pt-4">
            <div className="flex items-center gap-3">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-gris">
                {zapatilla.marca}
              </p>
              <span className="rounded-full bg-violeta/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-violeta-oscuro">
                {labelCategoria(zapatilla.categoria)}
              </span>
            </div>

            <h1 className="titulo-display mt-3 text-[clamp(2rem,6vw,3.5rem)]">
              {zapatilla.modelo}
            </h1>

            <p className="titulo-display mt-6 text-4xl text-violeta">
              {formatearPrecio(zapatilla.precio)}
            </p>

            {zapatilla.talles.length > 0 && (
              <p className="mt-2 text-sm text-gris">
                {disponibles > 0
                  ? `${disponibles} ${disponibles === 1 ? "talle disponible" : "talles disponibles"}`
                  : "Sin talles disponibles"}
              </p>
            )}

            {zapatilla.descripcion && (
              <p className="mt-8 max-w-prose whitespace-pre-line text-base leading-relaxed text-tinta/80">
                {zapatilla.descripcion}
              </p>
            )}

            <div className="mt-10">
              <PanelContacto
                id={zapatilla.id}
                marca={zapatilla.marca}
                modelo={zapatilla.modelo}
                talles={zapatilla.talles}
              />
            </div>

            <p className="mt-4 text-center text-xs text-gris">
              Te respondemos por WhatsApp con disponibilidad y formas de pago.
            </p>
          </div>
        </div>

        {relacionadas.length > 0 && (
          <section className="mt-24">
            <h2 className="titulo-display text-3xl">También te puede gustar</h2>
            <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
              {relacionadas.map((z) => (
                <TarjetaZapatilla key={z.id} zapatilla={z} />
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </>
  );
}
