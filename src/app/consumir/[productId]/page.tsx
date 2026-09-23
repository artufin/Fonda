import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { SubmitButton } from "@/components/SubmitButton";
import { formatCLP } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { getCurrentGuest } from "@/lib/session";
import { confirmarConsumo } from "./actions";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ productId: string }>;
};

export default async function ConsumirPage({ params }: Props) {
  const { productId } = await params;

  const guest = await getCurrentGuest();
  if (!guest) redirect(`/ingresar?next=${encodeURIComponent(`/consumir/${productId}`)}`);

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) notFound();

  return (
    <div className="card card--rojo">
      <p className="muted">Hola, {guest.name}</p>
      <h1>¿Confirmas que quieres 1 {product.name}?</h1>
      <div className="precio">{formatCLP(product.price)}</div>
      <form action={confirmarConsumo} className="stack">
        <input type="hidden" name="productId" value={product.id} />
        <SubmitButton pendingText="Anotando...">Sí, confirmar</SubmitButton>
        <Link href="/" className="btn btn--blanco">
          No, cancelar
        </Link>
      </form>
    </div>
  );
}
