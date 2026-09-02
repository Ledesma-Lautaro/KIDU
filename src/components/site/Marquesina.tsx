const FRASES = [
  "DRIP CERTIFICADO",
  "ENTREGA EN EL DÍA",
  "100% ORIGINALES",
  "CONSULTÁ POR WHATSAPP",
  "TALLES DEL 35 AL 46",
];

export function Marquesina({
  invertida = false,
}: {
  invertida?: boolean;
}) {
  const tanda = [...FRASES, ...FRASES];

  return (
    <div
      aria-hidden="true"
      className={`relative flex overflow-hidden border-y py-3 ${
        invertida
          ? "border-white/10 bg-violeta text-white"
          : "border-tinta/10 bg-tinta text-white"
      }`}
    >
      <div className="anim-marquesina flex shrink-0 items-center gap-8 whitespace-nowrap pr-8">
        {tanda.map((f, i) => (
          <span key={i} className="flex items-center gap-8">
            <span className="titulo-display text-lg tracking-tight sm:text-xl">
              {f}
            </span>
            <span
              className={`text-xl ${invertida ? "text-white/60" : "text-violeta"}`}
            >
              ✦
            </span>
          </span>
        ))}
      </div>
      <div
        className="anim-marquesina flex shrink-0 items-center gap-8 whitespace-nowrap pr-8"
        aria-hidden="true"
      >
        {tanda.map((f, i) => (
          <span key={i} className="flex items-center gap-8">
            <span className="titulo-display text-lg tracking-tight sm:text-xl">
              {f}
            </span>
            <span
              className={`text-xl ${invertida ? "text-white/60" : "text-violeta"}`}
            >
              ✦
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
