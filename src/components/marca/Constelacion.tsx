import { Zapa } from "./Zapa";

type Pieza = {
  clase: string;
  giro: string;
  demora: string;
  duracion: string;
  cuerpo: string;
  suela: string;
  detalle?: string;
  espejada?: boolean;
};

const PIEZAS: Pieza[] = [
  {
    clase: "right-[3%] top-[10%] w-[30%] opacity-45 sm:w-[26%]",
    giro: "-10deg",
    demora: "0s",
    duracion: "8s",
    cuerpo: "var(--color-violeta)",
    suela: "var(--color-violeta-neon)",
    detalle: "var(--color-violeta-noche)",
    espejada: true,
  },
  {
    clase: "right-[26%] top-[48%] hidden w-[17%] opacity-30 lg:block",
    giro: "8deg",
    demora: "1.4s",
    duracion: "9.5s",
    cuerpo: "var(--color-violeta-electrico)",
    suela: "var(--color-violeta-claro)",
    detalle: "var(--color-violeta-noche)",
  },
  {
    clase: "right-[8%] bottom-[6%] w-[20%] opacity-25 sm:w-[16%]",
    giro: "6deg",
    demora: "2.6s",
    duracion: "7.5s",
    cuerpo: "var(--color-violeta-neon)",
    suela: "var(--color-violeta-oscuro)",
    detalle: "var(--color-violeta-profundo)",
    espejada: true,
  },
  {
    clase: "left-[-4%] bottom-[-6%] hidden w-[18%] opacity-20 lg:block",
    giro: "-6deg",
    demora: "0.8s",
    duracion: "10.5s",
    cuerpo: "var(--color-violeta-profundo)",
    suela: "var(--color-violeta)",
    detalle: "var(--color-violeta-noche)",
  },
];

export function Constelacion() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      {PIEZAS.map((p, i) => (
        <div
          key={i}
          className={`anim-flotar absolute ${p.clase}`}
          style={
            {
              "--giro": p.giro,
              animationDelay: p.demora,
              animationDuration: p.duracion,
            } as React.CSSProperties
          }
        >
          <Zapa
            className="h-auto w-full drop-shadow-[0_18px_50px_rgba(138,80,245,0.45)]"
            cuerpo={p.cuerpo}
            suela={p.suela}
            detalle={p.detalle}
            espejada={p.espejada}
          />
        </div>
      ))}

      <div className="absolute inset-y-0 left-0 w-full bg-gradient-to-r from-tinta via-tinta/80 to-transparent lg:w-3/5" />
    </div>
  );
}
