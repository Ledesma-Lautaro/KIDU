"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { iniciarSesion } from "@/app/admin/actions";

function BotonEntrar() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-xl bg-violeta px-4 py-3 font-semibold text-white transition hover:bg-violeta-oscuro disabled:opacity-60"
    >
      {pending ? "Entrando…" : "Entrar"}
    </button>
  );
}

export function FormularioLogin() {
  const [error, accion] = useActionState(iniciarSesion, null);

  return (
    <form action={accion} className="space-y-4">
      <div>
        <label
          htmlFor="usuario"
          className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.16em] text-gris"
        >
          Usuario
        </label>
        <input
          id="usuario"
          name="usuario"
          type="text"
          autoComplete="username"
          required
          autoFocus
          className="w-full rounded-xl border border-borde px-4 py-3 outline-none transition focus:border-violeta"
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.16em] text-gris"
        >
          Contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="w-full rounded-xl border border-borde px-4 py-3 outline-none transition focus:border-violeta"
        />
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </p>
      )}

      <BotonEntrar />
    </form>
  );
}
