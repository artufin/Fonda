"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { safeNext, setGuestCookie } from "@/lib/session";

export async function ingresar(formData: FormData) {
  const guestId = String(formData.get("guestId") ?? "");
  const next = safeNext(formData.get("next"));

  const guest = await prisma.guest.findUnique({ where: { id: guestId } });
  if (!guest) {
    redirect(`/ingresar?error=1&next=${encodeURIComponent(next)}`);
  }

  await setGuestCookie(guest.id);
  redirect(next);
}
