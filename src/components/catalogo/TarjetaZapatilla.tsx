import Image from "next/image";
import Link from "next/link";
import { BotonWhatsApp } from "@/components/BotonWhatsApp";
import { labelCategoria } from "@/lib/categorias";
import { formatearPrecio, formatearTalle } from "@/lib/format";
import type { ZapatillaConTalles } from "@/lib/tipos";

export function TarjetaZapatilla({
  zapatilla,
  prioridad = false,
}: {
  zapatilla: ZapatillaConTalles;
  prioridad?: boolean;
}) {
  const { id, marca, modelo, categoria, color, precio, imagenes, talles } =
    zapatilla;
  const portada = imagenes[0];
  const disponibles = talles.filter((t) => t.stock);
  const agotada = talles.length > 0 && disponibles.length === 0;

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-marco border border-borde bg-white transition duration-300 hover:-translate-y-1 hover:border-violeta/40 hover:shadow-[0_18px_40px_-20px_rgba(138,80,245,0.45)]">
      <div className="relative aspect-square overflow-hidden bg-humo">
        {portada ? (
          <Image
            src={portada}
            alt={`${marca} ${modelo}`}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            priority={prioridad}
            className="object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs uppercase tracking-widest text-gris">
            Sin imagen
          </div>
        )}

        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-tinta backdrop-blur">
          {labelCategoria(categoria)}
        </span>

        {agotada && (
          <span className="absolute right-3 top-3 rounded-full bg-tinta px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-white">
            Sin stock
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex-1">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-gris">
            {marca}
          </p>
          <h3 className="mt-1 line-clamp-2 text-base font-semibold leading-snug text-tinta">
            {modelo}
          </h3>
          {color && <p className="mt-0.5 text-sm text-gris">{color}</p>}
        </div>

        <p className="titulo-display text-2xl text-tinta">
          {formatearPrecio(precio)}
        </p>

        {disponibles.length > 0 && (
          <p className="text-xs text-gris">
            Talles BR:{" "}
            <span className="text-tinta">
              {disponibles
                .slice(0, 6)
                .map((t) => formatearTalle(t.talle))
                .join(" · ")}
              {disponibles.length > 6 ? " …" : ""}
            </span>
          </p>
        )}

        <BotonWhatsApp
          marca={marca}
          modelo={modelo}
          color={color}
          path={`/zapatilla/${id}`}
        />
      </div>

      <Link
        href={`/zapatilla/${id}`}
        className="absolute inset-0 z-0"
        aria-label={`Ver ${marca} ${modelo}`}
      >
        <span className="sr-only">Ver detalle</span>
      </Link>
    </article>
  );
}
