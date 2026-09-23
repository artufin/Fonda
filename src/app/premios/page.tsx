import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentGuest, getGuestTotal } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function PremiosPage() {
  const guest = await getCurrentGuest();
  if (!guest) redirect("/ingresar");

  // Por ahora los Duro Puntos son el mismo total gastado, solo que se pueden
  // canjear por premios en vez de sumar la cuenta a pagar.
  const [duroPuntos, premios] = await Promise.all([
    getGuestTotal(guest.id),
    prisma.prize.findMany({ orderBy: { price: "asc" } }),
  ]);

  return (
    <div className="card card--azul">
      <h1>⭐ Duro Puntos</h1>
      <p className="muted">Tienes</p>
      <div className="total">{duroPuntos} pts</div>

      {premios.length > 0 && (
        <div className="stack" style={{ marginTop: 20 }}>
          {premios.map((premio) => (
            <div key={premio.id} className="card card--rojo">
              <h2>{premio.name}</h2>
              <p className="muted" style={{ margin: 0 }}>
                {premio.price} pts
              </p>
            </div>
          ))}
        </div>
      )}

      <Link href="/" className="btn btn--blanco" style={{ marginTop: 20 }}>
        Volver al inicio
      </Link>
    </div>
  );
}
