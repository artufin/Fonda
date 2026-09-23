import { redirect } from "next/navigation";
import { getCurrentGuest, safeNext } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { ingresar } from "./actions";

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

  const guests = await prisma.guest.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="card card--rojo">
      <h1>¡Bienvenido a la fonda!</h1>
      <p>Elige tu nombre de la lista para anotar lo que consumas.</p>

      {params.error && (
        <p className="error">Ese invitado ya no existe. Elige otro de la lista.</p>
      )}

      {guests.length === 0 ? (
        <p className="error">
          Todavía no hay invitados registrados. Pide al anfitrión que te agregue en /admin.
        </p>
      ) : (
        <div className="stack">
          {guests.map((g) => (
            <form key={g.id} action={ingresar}>
              <input type="hidden" name="guestId" value={g.id} />
              <input type="hidden" name="next" value={next} />
              <button type="submit" className="btn btn--blanco">
                {g.name}
              </button>
            </form>
          ))}
        </div>
      )}
    </div>
  );
}
