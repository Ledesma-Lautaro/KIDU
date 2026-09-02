const SUELA = [
  "M32 106",
  "H240",
  "C253 106 260 111 260 117",
  "C260 124 252 128 240 128",
  "H54",
  "C33 128 18 120 18 112",
  "C18 106 23 103 32 106 Z",
].join(" ");

const UPPER = [
  "M26 106",
  "C24 92 32 82 46 78",
  "L126 54",
  "C138 50 146 44 150 36",
  "C153 29 163 27 168 32",
  "C172 36 172 40 170 44",
  "L166 50",
  "C176 54 180 58 182 62",
  "C186 68 196 68 202 62",
  "C208 56 214 50 222 50",
  "C234 50 242 66 244 84",
  "C246 94 246 100 246 106",
  "L26 106 Z",
].join(" ");

const PANEL = [
  "M70 100",
  "C104 92 140 76 170 60",
  "C176 57 182 60 182 66",
  "L182 72",
  "C182 78 178 82 172 84",
  "L82 102",
  "C74 104 68 102 70 100 Z",
].join(" ");

const CORDONES = ["M128 58l9 12", "M137 52l9 12", "M146 46l9 12"];

export function Zapa({
  className = "",
  cuerpo = "currentColor",
  suela,
  detalle,
  espejada = false,
}: {
  className?: string;
  cuerpo?: string;
  suela?: string;
  detalle?: string;
  espejada?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 276 146"
      aria-hidden="true"
      className={className}
      style={espejada ? { transform: "scaleX(-1)" } : undefined}
    >
      <path d={UPPER} fill={cuerpo} />
      {detalle && (
        <>
          <path d={PANEL} fill={detalle} opacity={0.85} />
          {CORDONES.map((d) => (
            <path
              key={d}
              d={d}
              stroke={detalle}
              strokeWidth={6}
              strokeLinecap="round"
              fill="none"
            />
          ))}
        </>
      )}
      <path d={SUELA} fill={suela ?? cuerpo} />
    </svg>
  );
}
