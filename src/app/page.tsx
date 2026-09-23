import Link from "next/link";
import { redirect } from "next/navigation";
import { formatCLP } from "@/lib/format";
import { getCurrentGuest, getGuestTotal } from "@/lib/session";
import { salir } from "./actions";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const guest = await getCurrentGuest();
  if (!guest) redirect("/ingresar");

  const total = await getGuestTotal(guest.id);

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
        <h2>¿Cómo pedir?</h2>
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
