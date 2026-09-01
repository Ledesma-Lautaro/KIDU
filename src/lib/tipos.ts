import type { Prisma } from "@prisma/client";

export type ZapatillaConTalles = Prisma.ZapatillaGetPayload<{
  include: { talles: true };
}>;
