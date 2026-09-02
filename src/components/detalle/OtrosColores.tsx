import Image from "next/image";
import Link from "next/link";

export type ColorHermano = {
  id: string;
  color: string | null;
  imagenes: string[];
};

export function OtrosColores({
  actual,
  hermanos,
}: {
  actual: string | null;
  hermanos: ColorHermano[];
}) {
  if (hermanos.length === 0) return null;

  return (
    <section>
      <h2 className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-gris">
        Otros colores
      </h2>

      <ul className="flex flex-wrap gap-3">
        <li>
          <span
            aria-current="true"
            className="flex w-20 flex-col items-center gap-1.5"
          >
            <span className="relative block size-20 overflow-hidden rounded-xl border-2 border-violeta bg-humo">
              <span className="flex h-full items-center justify-center text-[10px] font-bold uppercase text-violeta">
                Este
              </span>
            </span>
            <span className="line-clamp-1 text-center text-xs font-semibold text-tinta">
              {actual ?? "Actual"}
            </span>
          </span>
        </li>

        {hermanos.map((h) => (
          <li key={h.id}>
            <Link
              href={`/zapatilla/${h.id}`}
              className="group flex w-20 flex-col items-center gap-1.5"
            >
              <span className="relative block size-20 overflow-hidden rounded-xl border-2 border-transparent bg-humo transition group-hover:border-tinta">
                {h.imagenes[0] ? (
                  <Image
                    src={h.imagenes[0]}
                    alt={h.color ?? "Otro color"}
                    fill
                    sizes="80px"
                    className="object-contain"
                  />
                ) : (
                  <span className="flex h-full items-center justify-center text-[9px] uppercase text-gris">
                    Sin foto
                  </span>
                )}
              </span>
              <span className="line-clamp-1 text-center text-xs text-gris transition group-hover:text-tinta">
                {h.color ?? "Ver"}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
