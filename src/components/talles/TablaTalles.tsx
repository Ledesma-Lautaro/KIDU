import { formatearPlantilla, TABLA_TALLES } from "@/lib/talles";

export function TablaTalles({ resaltado }: { resaltado?: number | null }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-separate border-spacing-y-1.5 text-center">
        <caption className="sr-only">
          Equivalencias entre talles brasileños, argentinos y europeos
        </caption>
        <thead>
          <tr>
            {["BR", "ARG", "EUR", "Plantilla"].map((h) => (
              <th
                key={h}
                scope="col"
                className="rounded-lg bg-violeta px-3 py-2 text-[11px] font-bold uppercase tracking-[0.14em] text-white"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {TABLA_TALLES.map((f) => {
            const activo = resaltado === f.br;
            return (
              <tr key={f.br}>
                <th
                  scope="row"
                  className={`rounded-l-lg px-3 py-2.5 text-sm font-bold ${
                    activo
                      ? "bg-violeta text-white"
                      : "bg-violeta-tenue text-tinta"
                  }`}
                >
                  {f.br}
                </th>
                <td
                  className={`px-3 py-2.5 text-sm font-semibold ${
                    activo
                      ? "bg-violeta text-white"
                      : "bg-violeta-tenue text-tinta"
                  }`}
                >
                  {f.arg}
                </td>
                <td
                  className={`px-3 py-2.5 text-sm ${
                    activo
                      ? "bg-violeta text-white"
                      : "bg-violeta-tenue text-tinta"
                  }`}
                >
                  {f.eur}
                </td>
                <td
                  className={`rounded-r-lg px-3 py-2.5 text-sm ${
                    activo
                      ? "bg-violeta text-white"
                      : "bg-violeta-tenue text-tinta"
                  }`}
                >
                  {formatearPlantilla(f.plantilla)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <p className="mt-4 text-xs leading-relaxed text-gris">
        Los talles del catálogo están en <strong className="text-tinta">BR</strong>,
        que es el número marcado en la zapatilla. La{" "}
        <strong className="text-tinta">plantilla</strong> es el largo interno:
        medí tu pie apoyado contra una pared y buscá el más cercano hacia arriba.
      </p>
    </div>
  );
}
