import { PrismaClient } from "@prisma/client";

// En dev, Next hace hot-reload y crearía un PrismaClient nuevo en cada recarga,
// agotando el pool de conexiones. Lo guardamos en globalThis.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
