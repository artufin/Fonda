import { redirect } from "next/navigation";
import { SubmitButton } from "@/components/SubmitButton";
import { getCurrentGuest, safeNext } from "@/lib/session";
import { ingresar } from "./actions";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ next?: string; error?: string }>;
};

export default async function IngresarPage({ searchParams }: Props) {
  const params = await searchParams;
  const next = safeNext(params.next);

  // Si ya tiene sesión válida, no hace falta pedir el nombre de nuevo.
  const guest = await getCurrentGuest();
  if (guest) redirect(next);

  return (
    <div className="card card--rojo">
      <h1>¡Bienvenido a la fonda!</h1>
      <p>Dinos tu nombre para anotar lo que consumas.</p>
      <form action={ingresar} className="stack">
        <input type="hidden" name="next" value={next} />
        <input
          className="input"
          type="text"
          name="name"
          placeholder="Tu nombre"
          autoComplete="name"
          autoFocus
          required
          minLength={2}
          maxLength={40}
        />
        {params.error && <p className="error">Escribe un nombre de al menos 2 letras.</p>}
        <SubmitButton pendingText="Entrando...">Entrar</SubmitButton>
      </form>
    </div>
  );
}
