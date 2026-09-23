import { formatCLP } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const guests = await prisma.guest.findMany({
    include: { consumptions: { include: { product: true } } },
    orderBy: { createdAt: "asc" },
  });

  const rows = guests
    .map((g) => {
      const total = g.consumptions.reduce((sum, c) => sum + c.product.price, 0);
      // Resumen tipo "2x Terremoto, 1x Choripán"
      const porProducto = new Map<string, number>();
      for (const c of g.consumptions) {
        porProducto.set(c.product.name, (porProducto.get(c.product.name) ?? 0) + 1);
      }
      const detalle = [...porProducto.entries()].map(([name, n]) => `${n}x ${name}`).join(", ");
      return { id: g.id, name: g.name, count: g.consumptions.length, total, detalle };
    })
    .sort((a, b) => b.total - a.total);

  const granTotal = rows.reduce((sum, r) => sum + r.total, 0);

  return (
    <div className="card card--azul">
      <h1>Resumen para cobrar</h1>
      <p className="muted">
        {rows.length} invitado{rows.length === 1 ? "" : "s"} · actualizado al recargar
      </p>
      {rows.length === 0 ? (
        <p>Todavía no hay consumos.</p>
      ) : (
        <table className="tabla">
          <thead>
            <tr>
              <th>Invitado</th>
              <th className="num">Ítems</th>
              <th className="num">Total</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>
                  {r.name}
                  {r.detalle && <div className="detalle">{r.detalle}</div>}
                </td>
                <td className="num">{r.count}</td>
                <td className="num monto">{formatCLP(r.total)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td>Total fiesta</td>
              <td className="num">{rows.reduce((s, r) => s + r.count, 0)}</td>
              <td className="num">{formatCLP(granTotal)}</td>
            </tr>
          </tfoot>
        </table>
      )}
    </div>
  );
}
