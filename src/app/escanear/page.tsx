import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentGuest } from "@/lib/session";
import { Escaner } from "./Escaner";

export const dynamic = "force-dynamic";

export default async function EscanearPage() {
  const guest = await getCurrentGuest();
  if (!guest) redirect("/ingresar?next=%2Fescanear");

  return (
    <div className="card card--rojo">
      <h1>Escanea el QR</h1>
      <Escaner />
      <Link href="/" className="btn btn--blanco" style={{ marginTop: 16 }}>
        Volver
      </Link>
    </div>
  );
}
