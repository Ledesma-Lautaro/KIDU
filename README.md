# KIDU — Catálogo de zapatillas

Catálogo web de zapatillas con panel de administración privado. No hay carrito
ni checkout: el contacto se resuelve mandando al comprador a WhatsApp con un
mensaje ya escrito.

- **Catálogo público** (`/`): grilla, buscador, filtros por marca, categoría,
  rango de precio y talle disponible, y paginación.
- **Detalle** (`/zapatilla/[id]`): galería, talles con disponibilidad, precio y
  botón grande de WhatsApp.
- **Panel** (`/admin`): ABM completo, subida de imágenes y gestión de stock por
  talle. Protegido con usuario y contraseña.

---

## Stack

| Pieza | Qué se usa |
|---|---|
| Framework | Next.js 15 (App Router) + TypeScript |
| Estilos | Tailwind CSS v4 (tokens en `src/app/globals.css`) |
| Base de datos | PostgreSQL (Vercel Postgres / Neon) + Prisma |
| Imágenes | Vercel Blob |
| Auth del panel | NextAuth v5, credenciales fijas por variables de entorno |
| Deploy | Vercel |

---

## Puesta en marcha

### 1. Instalar dependencias

```bash
npm install
```

### 2. Crear la base de datos

Necesitás una Postgres. La opción gratis más rápida es [Neon](https://neon.tech):
creás un proyecto y te da una *connection string*. En Vercel también podés
hacerlo desde **Storage → Postgres**.

Copiá `.env.example` a `.env` y completá:

```bash
cp .env.example .env
```

- `DATABASE_URL` → la connection string **pooled** (la que dice `-pooler`).
- `DIRECT_URL` → la connection string **directa**. Prisma la usa para las
  migraciones; si tu proveedor te da una sola, poné la misma en las dos.

### 3. Crear las tablas

```bash
npm run db:push
```

### 4. (Opcional) Cargar datos de ejemplo

Para ver el catálogo funcionando antes de tener las fotos reales:

```bash
npm run db:seed
```

Carga 8 modelos que empiezan con `DEMO `, con imágenes de placeholder incluidas
en el repo. Volver a correrlo los reemplaza; para sacarlos, borralos desde
`/admin`.

### 5. Configurar el resto de las variables

| Variable | Para qué |
|---|---|
| `AUTH_SECRET` | Firma la sesión del panel. Generalo con `npx auth secret`. |
| `ADMIN_USER` / `ADMIN_PASSWORD` | Las credenciales de `/admin`. No hay registro público. |
| `BLOB_READ_WRITE_TOKEN` | Subida de imágenes. Vercel → Storage → Blob. |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Número del vendedor, formato internacional sin `+` ni espacios (ej. `5491122334455`). |
| `NEXT_PUBLIC_SITE_URL` | URL pública del sitio; se usa para armar el link que va en el mensaje de WhatsApp. |

Si falta el número de WhatsApp, el botón se muestra deshabilitado en vez de
abrir un link roto.

### 6. Levantar el server

```bash
npm run dev
```

---

## Cosas que vas a querer cambiar

| Qué | Dónde |
|---|---|
| Nombre de la marca, tagline, descripción | `src/lib/site.ts` |
| Texto del mensaje de WhatsApp | `mensajeWhatsApp()` en `src/lib/site.ts` |
| Lista de categorías | `src/lib/categorias.ts` (no requiere migración) |
| Colores y tipografías | `@theme` en `src/app/globals.css` |
| Cuántos modelos por página | `POR_PAGINA` en `src/lib/filtros.ts` |
| Talles del "agregado rápido" del admin | `PRESETS` en `src/components/admin/EditorTalles.tsx` |

> **Sobre las categorías:** si sacás una categoría del array y ya había
> zapatillas usándola, esos modelos conservan el valor viejo en la base. Editalos
> desde `/admin` para reasignarlos.

---

## Deploy en Vercel

1. Subí el repo a GitHub e importalo en Vercel.
2. Cargá **todas** las variables de la tabla de arriba en
   *Settings → Environment Variables*.
3. Deploy. El `build` corre `prisma generate` automáticamente.
4. La primera vez, creá las tablas apuntando `DATABASE_URL` a la base de
   producción y corriendo `npm run db:push` desde tu máquina.

Para conectar un dominio propio más adelante: compralo en cualquier registrador
y agregalo en *Settings → Domains*. Acordate de actualizar
`NEXT_PUBLIC_SITE_URL` para que los links de WhatsApp apunten al dominio nuevo.

---

## Estructura

```
prisma/
  schema.prisma          modelo de datos (Zapatilla, Talle)
  seed.mjs               datos de ejemplo
src/
  auth.ts                configuración de NextAuth
  app/
    page.tsx             catálogo público
    zapatilla/[id]/      página de detalle
    admin/
      login/             pantalla de acceso
      (panel)/           listado, alta y edición (protegido)
      actions.ts         server actions del ABM
    api/admin/upload/    subida a Vercel Blob
  components/            UI, agrupada por sección
  lib/
    site.ts              nombre, textos y mensaje de WhatsApp
    categorias.ts        lista cerrada de categorías
    filtros.ts           filtros del catálogo <-> URL
    consultas.ts         queries de Prisma
    validaciones.ts      schemas de zod
    format.ts            precios en ARS y talles
```

---

## Notas de implementación

- **Precios**: se guardan como enteros en pesos, sin decimales, y se muestran
  con `Intl.NumberFormat('es-AR')` → `$ 150.000`.
- **Stock por talle**: los talles agotados se muestran tachados y no se pueden
  seleccionar, pero no se ocultan.
- **Baja de modelos**: el interruptor del listado hace *soft delete* (`activo`),
  que es lo recomendado. "Eliminar" borra la fila y sus imágenes del Blob para
  siempre.
- **Imágenes**: se redimensionan a 1600px y se reencodan a WebP en el navegador
  antes de subir, así una foto de celular de 8 MB no rompe el límite de 4.5 MB
  de request de Vercel.
- **Imágenes huérfanas**: si quitás una imagen del formulario, el archivo queda
  en el Blob. No molesta ni se cobra casi nada; si algún día querés limpiarlas,
  se listan desde el dashboard de Vercel.
- **Carga en tandas**: en el alta, "Guardar y cargar otra" deja el formulario
  vacío pero conserva marca y categoría, que son las que más se repiten.
  `Ctrl + Enter` guarda sin ir hasta el botón.
- **Protección del panel**: la verificación de sesión vive en el layout de
  `admin/(panel)` y en cada server action, no en un middleware. Es una barrera
  real, no cosmética.
