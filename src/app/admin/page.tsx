import { formatCLP } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { SubmitButton } from "@/components/SubmitButton";
import { BotonEliminar } from "@/components/BotonEliminar";
import { crearInvitado, eliminarInvitado } from "./actions";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ error?: string }>;
};

export default async function AdminPage({ searchParams }: Props) {
  const { error } = await searchParams;

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
    <>
      <div className="card card--rojo">
        <h2>Agregar invitado</h2>
        <form action={crearInvitado} className="stack">
          <input
            className="input"
            type="text"
            name="name"
            placeholder="Nombre del invitado"
            autoFocus
            required
            minLength={2}
            maxLength={40}
          />
          {error === "nombre" && <p className="error">Escribe un nombre de al menos 2 letras.</p>}
          <SubmitButton pendingText="Agregando..." color="azul">
            Agregar
          </SubmitButton>
        </form>
      </div>

      <div className="card card--azul">
        <h1>Resumen para cobrar</h1>
        <p className="muted">
          {rows.length} invitado{rows.length === 1 ? "" : "s"} · actualizado al recargar
        </p>
        {rows.length === 0 ? (
          <p>Todavía no hay invitados. Agrégalos arriba.</p>
        ) : (
          <table className="tabla">
            <thead>
              <tr>
                <th>Invitado</th>
                <th className="num">Ítems</th>
                <th className="num">Total</th>
                <th />
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
                  <td>
                    <form action={eliminarInvitado}>
                      <input type="hidden" name="guestId" value={r.id} />
                      <BotonEliminar nombre={r.name} cantidad={r.count} />
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td>Total fiesta</td>
                <td className="num">{rows.reduce((s, r) => s + r.count, 0)}</td>
                <td className="num">{formatCLP(granTotal)}</td>
                <td />
              </tr>
            </tfoot>
          </table>
        )}
      </div>
    </>
  );
}
