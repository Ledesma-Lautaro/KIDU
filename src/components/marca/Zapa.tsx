const CUERPO =
  "M18 86c0-14 6-22 20-26l54-16c12-4 20-10 26-20l8-12c4-7 11-10 19-8l43 12c14 4 22 14 22 28v40c0 4-3 6-7 6H24c-4 0-6-1-6-4Z";
const SUELA =
  "M10 86h204c10 0 18 7 18 16 0 10-8 16-18 16H30c-12 0-22-10-22-21 0-7 0-11 2-11Z";
const PANEL =
  "M96 66l42-32c6-5 14-4 18 2l2 30c1 8-4 14-12 14h-42c-9 0-14-8-8-14Z";
const CORDONES = [
  "M104 56l30-22",
  "M112 66l30-22",
  "M120 76l30-22",
];

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
      viewBox="0 0 240 130"
      aria-hidden="true"
      className={className}
      style={espejada ? { transform: "scaleX(-1)" } : undefined}
    >
      <path d={CUERPO} fill={cuerpo} />
      {detalle && (
        <>
          <path d={PANEL} fill={detalle} opacity={0.9} />
          {CORDONES.map((d) => (
            <path
              key={d}
              d={d}
              stroke={detalle}
              strokeWidth={4}
              strokeLinecap="round"
              fill="none"
              opacity={0.75}
            />
          ))}
        </>
      )}
      <path d={SUELA} fill={suela ?? cuerpo} />
    </svg>
  );
}
