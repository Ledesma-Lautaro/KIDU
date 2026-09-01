import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { ControlesCatalogo } from "@/components/catalogo/ControlesCatalogo";
import { TarjetaZapatilla } from "@/components/catalogo/TarjetaZapatilla";
import { Paginacion } from "@/components/catalogo/Paginacion";
import { AvisoSinBaseDeDatos } from "@/components/site/AvisoSinBaseDeDatos";
import { buscarZapatillas, obtenerFacetas } from "@/lib/consultas";
import { parsearFiltros } from "@/lib/filtros";
import { siteConfig } from "@/lib/site";
import type { ParamsCrudos } from "@/lib/filtros";

export default async function PaginaCatalogo({
  searchParams,
}: {
  searchParams: Promise<ParamsCrudos>;
}) {
  const filtros = parsearFiltros(await searchParams);

  let datos: Awaited<ReturnType<typeof buscarZapatillas>> | null = null;
  let facetas: Awaited<ReturnType<typeof obtenerFacetas>> | null = null;

  try {
    [datos, facetas] = await Promise.all([
      buscarZapatillas(filtros),
      obtenerFacetas(),
    ]);
  } catch (error) {
    // Todavía sin base de datos conectada (típico en la primera corrida).
    console.error("[catalogo] No se pudo leer la base de datos:", error);
  }

  return (
    <>
      <Header />

      <main>
        <Hero total={datos?.total ?? 0} marcas={facetas?.marcas.length ?? 0} />

        <section
          id="catalogo"
          className="mx-auto max-w-7xl scroll-mt-20 px-4 py-14 sm:px-6 lg:px-8"
        >
          {!datos || !facetas ? (
            <AvisoSinBaseDeDatos />
          ) : (
            <ControlesCatalogo
              facetas={facetas}
              filtros={filtros}
              total={datos.total}
            >
              {datos.zapatillas.length === 0 ? (
                <SinResultados />
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
                    {datos.zapatillas.map((z, i) => (
                      <TarjetaZapatilla
                        key={z.id}
                        zapatilla={z}
                        prioridad={i < 4}
                      />
                    ))}
                  </div>
                  <Paginacion filtros={filtros} paginas={datos.paginas} />
                </>
              )}
            </ControlesCatalogo>
          )}
        </section>
      </main>

      <Footer />
    </>
  );
}

function Hero({ total, marcas }: { total: number; marcas: number }) {
  return (
    <section className="relative overflow-hidden border-b border-borde bg-white">
      {/* Mancha violeta de fondo: da energía sin competir con las fotos. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 -top-32 size-[34rem] rounded-full bg-violeta/20 blur-3xl"
      />

      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <p className="inline-flex items-center gap-2 rounded-full border border-borde bg-white px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-gris">
          <span className="size-1.5 rounded-full bg-violeta" />
          {siteConfig.tagline}
        </p>

        <h1 className="titulo-display mt-6 max-w-4xl text-[clamp(2.5rem,9vw,6.5rem)]">
          Zapatillas que
          <span className="text-violeta"> hablan</span> por vos
        </h1>

        <p className="mt-6 max-w-xl text-base text-gris sm:text-lg">
          Mirá el catálogo, elegí tu talle y escribinos por WhatsApp. Sin
          vueltas, sin carrito, sin registro.
        </p>

        <dl className="mt-10 flex flex-wrap items-center gap-x-10 gap-y-4">
          <Dato valor={total} etiqueta={total === 1 ? "modelo" : "modelos"} />
          <Dato valor={marcas} etiqueta={marcas === 1 ? "marca" : "marcas"} />
          <Dato valor="ARS" etiqueta="precios en pesos" />
        </dl>
      </div>
    </section>
  );
}

function Dato({
  valor,
  etiqueta,
}: {
  valor: number | string;
  etiqueta: string;
}) {
  return (
    <div>
      <dt className="sr-only">{etiqueta}</dt>
      <dd className="titulo-display text-3xl sm:text-4xl">{valor}</dd>
      <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.16em] text-gris">
        {etiqueta}
      </p>
    </div>
  );
}

function SinResultados() {
  return (
    <div className="rounded-marco border border-dashed border-borde px-6 py-20 text-center">
      <p className="titulo-display text-3xl">Sin resultados</p>
      <p className="mx-auto mt-3 max-w-sm text-sm text-gris">
        No encontramos zapatillas con esos filtros. Probá sacando alguno o
        buscando otra marca.
      </p>
    </div>
  );
}
