"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { safeNext, setGuestCookie } from "@/lib/session";

export async function ingresar(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim().slice(0, 40);
  const next = safeNext(formData.get("next"));

  if (name.length < 2) {
    redirect(`/ingresar?error=1&next=${encodeURIComponent(next)}`);
  }

  const guest = await prisma.guest.create({ data: { name } });
  await setGuestCookie(guest.id);
  redirect(next);
}
