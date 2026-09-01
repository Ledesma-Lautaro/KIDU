/**
 * Se muestra cuando la app no puede leer la base de datos.
 * Sirve de checklist para la primera puesta en marcha; en producción, con la
 * DB conectada, nunca aparece.
 */
export function AvisoSinBaseDeDatos() {
  const pasos = [
    "Creá una base Postgres (Vercel → Storage → Postgres, o neon.tech gratis).",
    "Copiá la connection string en DATABASE_URL y DIRECT_URL dentro de .env",
    "Corré: npm run db:push — crea las tablas.",
    "Opcional: npm run db:seed — carga 8 modelos de ejemplo para ver el diseño.",
  ];

  return (
    <div className="rounded-marco border border-borde bg-humo p-8 sm:p-12">
      <p className="inline-flex items-center gap-2 rounded-full bg-violeta/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-violeta-oscuro">
        Falta un paso
      </p>

      <h2 className="titulo-display mt-4 text-3xl sm:text-4xl">
        Conectá la base de datos
      </h2>
      <p className="mt-3 max-w-lg text-sm text-gris">
        La app está lista, pero todavía no puede leer el catálogo. Seguí estos
        pasos una sola vez:
      </p>

      <ol className="mt-8 space-y-4">
        {pasos.map((paso, i) => (
          <li key={paso} className="flex gap-4">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-tinta text-xs font-bold text-white">
              {i + 1}
            </span>
            <span className="pt-1 text-sm text-tinta">{paso}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
