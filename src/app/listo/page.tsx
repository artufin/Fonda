import Link from "next/link";
import { redirect } from "next/navigation";
import { formatCLP } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { getCurrentGuest, getGuestTotal } from "@/lib/session";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ p?: string }>;
};

export default async function ListoPage({ searchParams }: Props) {
  const guest = await getCurrentGuest();
  if (!guest) redirect("/ingresar");

  const { p } = await searchParams;
  const [total, product] = await Promise.all([
    getGuestTotal(guest.id),
    p ? prisma.product.findUnique({ where: { id: p } }) : null,
  ]);

  return (
    <div className="card card--azul">
      <div className="check">🍻</div>
      <h1 style={{ textAlign: "center" }}>Listo{product ? `, ${product.name} anotado` : ""}.</h1>
      <p className="muted" style={{ textAlign: "center" }}>
        Llevas gastados
      </p>
      <div className="total" style={{ textAlign: "center" }}>
        {formatCLP(total)}
      </div>
      <div className="stack" style={{ marginTop: 16 }}>
        <Link href="/escanear" className="btn btn--rojo">
          📷 Dame más
        </Link>
        <Link href="/" className="btn btn--blanco">
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
