import Link from "next/link";
import { redirect } from "next/navigation";
import { Leaderboard } from "@/components/Leaderboard";
import { formatCLP } from "@/lib/format";
import { getLeaderboards } from "@/lib/leaderboard";
import { getCurrentGuest, getGuestTotal } from "@/lib/session";
import { salir } from "./actions";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const guest = await getCurrentGuest();
  if (!guest) redirect("/ingresar");

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

      <div className="card card--rojo">
        <h2>🏆 Ranking de la fiesta</h2>
        <Leaderboard
          titulo="🍗 Top 3 Watones"
          entries={watones}
          vacioTexto="Nadie ha pedido comida todavía."
        />
        <Leaderboard
          titulo="🍹 Top 3 Curaos"
          entries={curaos}
          vacioTexto="Nadie ha pedido tragos todavía."
        />
      </div>

      <Link href="/escanear" className="btn btn--rojo">
        📷 Escanear QR
      </Link>

      <div className="card card--rojo">
        <h2>¿Cómo anotarse?</h2>
        <p>
          Toca <strong>Escanear QR</strong> y apunta al QR del trago o comida que quieras. También
          puedes escanearlo con la cámara normal del celular. Después confirmas y listo.
        </p>
      </div>

      <form action={salir}>
        <button type="submit" className="link" style={{ background: "none", border: "none", cursor: "pointer", width: "100%" }}>
          Cambiar de invitado
        </button>
      </form>
    </>
  );
}
