import Link from "next/link";
import { redirect } from "next/navigation";
import { InstructionsModal } from "@/components/InstructionsModal";
import { Leaderboard } from "@/components/Leaderboard";
import { formatCLP } from "@/lib/format";
import { getLeaderboards } from "@/lib/leaderboard";
import { getCurrentGuest, getGuestTotal } from "@/lib/session";
import { salir } from "./actions";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ bienvenida?: string }>;
};

export default async function HomePage({ searchParams }: Props) {
  const guest = await getCurrentGuest();
  if (!guest) redirect("/ingresar");

  const { bienvenida } = await searchParams;
  const [total, { watones, curaos }] = await Promise.all([
    getGuestTotal(guest.id),
    getLeaderboards(),
  ]);

  return (
    <>
      <div className="card card--azul">
        <h1>Hola, {guest.name} 👋</h1>
        <p className="muted">Llevas gastado</p>
        <div className="total">{formatCLP(total)}</div>
      </div>

      <Link href="/escanear" className="btn btn--rojo">
        📷 Escanear QR
      </Link>

      <div className="card card--rojo">
        <Leaderboard
          titulo="🍹 Top 3 Curaos"
          entries={curaos}
          vacioTexto="Nadie ha pedido tragos todavía."
        />
        <Leaderboard
          titulo="🍗 Top 3 Watones"
          entries={watones}
          vacioTexto="Nadie ha pedido comida todavía."
        />
      </div>

      <InstructionsModal abrirAlInicio={bienvenida === "1"} />

      <form action={salir}>
        <button type="submit" className="link" style={{ background: "none", border: "none", cursor: "pointer", width: "100%" }}>
          Cambiar de invitado
        </button>
      </form>
    </>
  );
}
