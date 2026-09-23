import { redirect } from "next/navigation";
import { getCurrentGuest, safeNext } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { GuestPicker } from "./GuestPicker";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ next?: string; error?: string }>;
};

export default async function IngresarPage({ searchParams }: Props) {
  const params = await searchParams;
  const next = safeNext(params.next);

  // Si ya tiene sesión válida, no hace falta elegir de nuevo.
  const guest = await getCurrentGuest();
  if (guest) redirect(next);

  const guests = await prisma.guest.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div className="card card--rojo">
      <h1>¡Bienvenid@!</h1>
      <p>Busca tu nombre en la lista para anotar lo que consumas.</p>

      {params.error && (
        <p className="error">Ese invitado ya no existe. Búscalo de nuevo en la lista.</p>
      )}

      {guests.length === 0 ? (
        <p className="error">
          Todavía no hay invitados registrados. Pide al anfitrión que te agregue en /admin.
        </p>
      ) : (
        <GuestPicker guests={guests} next={next} />
      )}
    </div>
  );
}
