import { timingSafeEqual } from "node:crypto";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

function coincide(a: string, b: string): boolean {
  const bufA = Buffer.from(a, "utf8");
  const bufB = Buffer.from(b, "utf8");
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 7 },
  pages: { signIn: "/admin/login" },
  providers: [
    Credentials({
      name: "Credenciales",
      credentials: {
        usuario: { label: "Usuario", type: "text" },
        password: { label: "Contraseña", type: "password" },
      },
      authorize(credentials) {
        const usuarioEsperado = process.env.ADMIN_USER;
        const passwordEsperada = process.env.ADMIN_PASSWORD;

        if (!usuarioEsperado || !passwordEsperada) {
          console.error(
            "[auth] Falta configurar ADMIN_USER y/o ADMIN_PASSWORD."
          );
          return null;
        }

        const usuario = String(credentials?.usuario ?? "");
        const password = String(credentials?.password ?? "");

        const ok =
          coincide(usuario, usuarioEsperado) &&
          coincide(password, passwordEsperada);

        return ok ? { id: "admin", name: usuarioEsperado } : null;
      },
    }),
  ],
});
