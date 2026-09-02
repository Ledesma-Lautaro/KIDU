import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { ControlesCatalogo } from "@/components/catalogo/ControlesCatalogo";
import { TarjetaZapatilla } from "@/components/catalogo/TarjetaZapatilla";
import { Paginacion } from "@/components/catalogo/Paginacion";
import { AvisoSinBaseDeDatos } from "@/components/site/AvisoSinBaseDeDatos";
import { Constelacion } from "@/components/marca/Constelacion";
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
    <section className="relative">
      <div className="grano relative overflow-hidden bg-tinta text-white">
        <div
          aria-hidden="true"
          className="anim-latir pointer-events-none absolute -left-24 top-[-10%] size-[38rem] rounded-full bg-violeta-electrico/30 blur-[110px]"
        />
        <div
          aria-hidden="true"
          style={{ animationDelay: "2.5s" }}
          className="anim-latir pointer-events-none absolute -right-32 bottom-[-25%] size-[34rem] rounded-full bg-violeta-profundo/40 blur-[120px]"
        />
        <div
          aria-hidden="true"
          style={{ animationDelay: "1.2s" }}
          className="anim-latir pointer-events-none absolute left-1/2 top-1/3 size-[24rem] rounded-full bg-violeta-neon/15 blur-[100px]"
        />

        <Constelacion />

        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <p className="anim-entrar inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-violeta-neon backdrop-blur">
            <span className="size-1.5 rounded-full bg-violeta-neon" />
            {siteConfig.tagline}
          </p>

          <h1
            className="titulo-display anim-entrar mt-6 max-w-4xl text-[clamp(2.75rem,10vw,7rem)]"
            style={{ animationDelay: "0.1s" }}
          >
            <span className="block">Zapatillas</span>
            <span className="block bg-gradient-to-r from-violeta-neon via-violeta to-violeta-electrico bg-clip-text text-transparent">
              que hablan
            </span>
            <span className="block">por vos</span>
          </h1>

          <p
            className="anim-entrar mt-7 max-w-xl text-base text-white/60 sm:text-lg"
            style={{ animationDelay: "0.2s" }}
          >
            Mirá el catálogo, elegí tu talle y escribinos por WhatsApp. Sin
            vueltas, sin carrito, sin registro.
          </p>

          <dl
            className="anim-entrar mt-12 flex flex-wrap items-center gap-x-10 gap-y-4"
            style={{ animationDelay: "0.3s" }}
          >
            <Dato valor={total} etiqueta={total === 1 ? "modelo" : "modelos"} />
            <Dato valor={marcas} etiqueta={marcas === 1 ? "marca" : "marcas"} />
            <Dato valor="ARS" etiqueta="precios en pesos" />
          </dl>
        </div>

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
      <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.16em] text-white/40">
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
