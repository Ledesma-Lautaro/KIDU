import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { siteConfig } from "@/lib/site";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url.replace(/\/$/, "");

  const zapatillas = await prisma.zapatilla
    .findMany({
      where: { activo: true },
      select: { id: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
    })
    .catch(() => []);

  return [
    { url: base, lastModified: new Date(), priority: 1 },
    ...zapatillas.map((z) => ({
      url: `${base}/zapatilla/${z.id}`,
      lastModified: z.updatedAt,
      priority: 0.7,
    })),
  ];
}
