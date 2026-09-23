import { prisma } from "./prisma";

export type LeaderboardEntry = { id: string; name: string };

/**
 * Top 3 "watones" (más gastado en comida) y top 3 "curaos" (más gastado en
 * tragos), ponderado por precio. Solo entran invitados con gasto > 0 en esa
 * categoría; no se expone el monto, solo el nombre y el puesto.
 */
export async function getLeaderboards(): Promise<{
  watones: LeaderboardEntry[];
  curaos: LeaderboardEntry[];
}> {
  const consumptions = await prisma.consumption.findMany({
    select: {
      guestId: true,
      guest: { select: { name: true } },
      product: { select: { price: true, category: true } },
    },
  });

  const totales = new Map<string, { name: string; comida: number; trago: number }>();

  for (const c of consumptions) {
    const entry = totales.get(c.guestId) ?? { name: c.guest.name, comida: 0, trago: 0 };
    if (c.product.category === "COMIDA") {
      entry.comida += c.product.price;
    } else {
      entry.trago += c.product.price;
    }
    totales.set(c.guestId, entry);
  }

  const lista = [...totales.entries()].map(([id, v]) => ({ id, ...v }));

  const top3 = (campo: "comida" | "trago"): LeaderboardEntry[] =>
    lista
      .filter((g) => g[campo] > 0)
      .sort((a, b) => b[campo] - a[campo])
      .slice(0, 3)
      .map((g) => ({ id: g.id, name: g.name }));

  return { watones: top3("comida"), curaos: top3("trago") };
}
