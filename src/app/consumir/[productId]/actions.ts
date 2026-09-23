"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentGuest } from "@/lib/session";

export async function confirmarConsumo(formData: FormData) {
  const productId = String(formData.get("productId") ?? "");

  const guest = await getCurrentGuest();
  if (!guest) {
    redirect(`/ingresar?next=${encodeURIComponent(`/consumir/${productId}`)}`);
  }

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) redirect("/");

  await prisma.consumption.create({
    data: { guestId: guest.id, productId: product.id },
  });

  redirect(`/listo?p=${encodeURIComponent(product.id)}`);
}
