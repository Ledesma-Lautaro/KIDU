import Link from "next/link";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";

export default function NoEncontrado() {
  return (
    <>
      <Header />
      <main className="mx-auto flex max-w-2xl flex-col items-center px-4 py-32 text-center">
        <p className="titulo-display text-[clamp(4rem,18vw,10rem)] text-violeta">
          404
        </p>
        <h1 className="titulo-display mt-2 text-3xl">Esto no está</h1>
        <p className="mt-4 max-w-sm text-sm text-gris">
          El modelo que buscás no existe o lo sacamos del catálogo.
        </p>
        <Link
          href="/"
          className="mt-8 rounded-xl bg-violeta px-6 py-3 font-semibold text-white transition hover:bg-violeta-oscuro"
        >
          Volver al catálogo
        </Link>
      </main>
      <Footer />
    </>
  );
}
