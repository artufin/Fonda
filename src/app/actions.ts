"use server";

import { redirect } from "next/navigation";
import { clearGuestCookie } from "@/lib/session";

export async function salir() {
  await clearGuestCookie();
  redirect("/ingresar");
}
