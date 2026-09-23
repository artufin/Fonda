"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export async function crearInvitado(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim().slice(0, 40);

  if (name.length < 2) {
    redirect("/admin?error=nombre");
  }

  await prisma.guest.create({ data: { name } });
  redirect("/admin");
}

export async function eliminarInvitado(formData: FormData) {
  const guestId = String(formData.get("guestId") ?? "");

  try {
    // onDelete: Cascade en el esquema borra también sus Consumption asociados.
    await prisma.guest.delete({ where: { id: guestId } });
  } catch (e) {
    const notFound = typeof e === "object" && e !== null && "code" in e && e.code === "P2025";
    if (!notFound) throw e;
  }

  redirect("/admin");
}
