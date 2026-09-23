import Link from "next/link";
import { redirect } from "next/navigation";
import { InstructionsModal } from "@/components/InstructionsModal";
import { PartyEffect } from "@/components/PartyEffect";
import { Leaderboard } from "@/components/Leaderboard";
import { formatCLP } from "@/lib/format";
import { getLeaderboards } from "@/lib/leaderboard";
import { getCurrentGuest, getGuestTotal } from "@/lib/session";

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
    <div className="pantalla-principal">
      <div className="card card--azul">
        <h1>Hola, {guest.name} 👋</h1>
        <p className="muted">Llevas gastado</p>
        <div className="total">{formatCLP(total)}</div>
      </div>

      <Link href="/escanear" className="btn btn--rojo">
        📷 Escanear QR
      </Link>

      <div className="card card--rojo">
        <div className="ranking-columnas">
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
      </div>

      <Link href="/premios" className="btn btn--azul btn--compacto">
        ⭐ Duro Puntos
      </Link>

      <InstructionsModal abrirAlInicio={bienvenida === "1"} />

      {/* Para agregar otro efecto: pega el archivo en /public y suma otra línea aquí. */}
      <PartyEffect
        video="/videos/esqueleto.mp4"
        sound="/audio/bad-to-the-bone.mp3"
        intervalMs={300000}
      />
    </div>
  );
}
