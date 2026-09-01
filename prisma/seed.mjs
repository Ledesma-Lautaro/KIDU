/**
 * Carga datos de ejemplo para poder ver el catálogo funcionando antes de tener
 * las fotos reales. Es seguro correrlo varias veces: borra los modelos de demo
 * anteriores (los que empiezan con "DEMO ") y los vuelve a crear.
 *
 *   npm run db:seed
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const img = (n) => `/demo/${n}.svg`;

const MODELOS = [
  {
    marca: "Nike",
    modelo: "DEMO Air Max 90",
    categoria: "urbana",
    precio: 189000,
    descripcion:
      "Clásico absoluto. Unidad Air visible, cuero y malla, horma cómoda para todo el día.",
    imagenes: [img(1), img(2)],
    talles: [38, 39, 40, 41, 42, 43],
    agotados: [38, 43],
  },
  {
    marca: "Nike",
    modelo: "DEMO Pegasus 40",
    categoria: "running",
    precio: 215000,
    descripcion: "Amortiguación React para entrenamientos diarios.",
    imagenes: [img(3)],
    talles: [39, 40, 41, 42, 43, 44],
    agotados: [44],
  },
  {
    marca: "Adidas",
    modelo: "DEMO Samba OG",
    categoria: "lifestyle",
    precio: 165000,
    descripcion: "La silueta del momento. Cuero, gamuza en la puntera y suela goma.",
    imagenes: [img(4), img(5), img(6)],
    talles: [37, 38, 39, 40, 41, 42],
    agotados: [37],
  },
  {
    marca: "Adidas",
    modelo: "DEMO Forum Low",
    categoria: "basketball",
    precio: 178000,
    descripcion: null,
    imagenes: [img(2)],
    talles: [40, 41, 42, 43, 44, 45],
    agotados: [],
  },
  {
    marca: "New Balance",
    modelo: "DEMO 550 White Green",
    categoria: "lifestyle",
    precio: 235000,
    descripcion: "Reedición del básquet ochentoso, en cuero.",
    imagenes: [img(6), img(1)],
    talles: [39, 40, 41, 42],
    agotados: [39, 40],
  },
  {
    marca: "Vans",
    modelo: "DEMO Old Skool",
    categoria: "skate",
    precio: 132000,
    descripcion: "Lona y gamuza, suela waffle. El caballito de batalla del skate.",
    imagenes: [img(5)],
    talles: [36, 37, 38, 39, 40, 41, 42, 43],
    agotados: [36],
  },
  {
    marca: "Puma",
    modelo: "DEMO Suede Classic",
    categoria: "urbana",
    precio: 124000,
    descripcion: null,
    imagenes: [img(3), img(4)],
    talles: [38, 39, 40, 41],
    agotados: [],
  },
  {
    marca: "Asics",
    modelo: "DEMO Gel-Kayano 14",
    categoria: "running",
    precio: 298000,
    descripcion: "Estética Y2K con tecnología GEL. Muy pedidas.",
    imagenes: [img(1), img(3), img(5)],
    talles: [40, 41, 42, 43, 44],
    agotados: [40, 44],
  },
];

async function main() {
  const borradas = await prisma.zapatilla.deleteMany({
    where: { modelo: { startsWith: "DEMO " } },
  });
  if (borradas.count > 0) {
    console.log(`Se borraron ${borradas.count} modelos de demo anteriores.`);
  }

  for (const m of MODELOS) {
    await prisma.zapatilla.create({
      data: {
        marca: m.marca,
        modelo: m.modelo,
        categoria: m.categoria,
        precio: m.precio,
        descripcion: m.descripcion,
        imagenes: m.imagenes,
        activo: true,
        talles: {
          create: m.talles.map((talle) => ({
            talle,
            stock: !m.agotados.includes(talle),
          })),
        },
      },
    });
  }

  console.log(`Listo: ${MODELOS.length} modelos de ejemplo cargados.`);
  console.log('Para sacarlos después: borralos desde /admin o volvé a correr el seed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
