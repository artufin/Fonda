import { cookies } from "next/headers";
import { prisma } from "./prisma";

export const GUEST_COOKIE = "fonda_guest";

const ONE_YEAR = 60 * 60 * 24 * 365;

export async function setGuestCookie(guestId: string) {
  const store = await cookies();
  store.set(GUEST_COOKIE, guestId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ONE_YEAR,
  });
}

export async function clearGuestCookie() {
  const store = await cookies();
  store.delete(GUEST_COOKIE);
}

/** Devuelve el invitado de la cookie, o null si no hay sesión válida. */
export async function getCurrentGuest() {
  const store = await cookies();
  const id = store.get(GUEST_COOKIE)?.value;
  if (!id) return null;
  return prisma.guest.findUnique({ where: { id } });
}

/** Suma de todos los consumos de un invitado. */
export async function getGuestTotal(guestId: string) {
  const consumptions = await prisma.consumption.findMany({
    where: { guestId },
    select: { product: { select: { price: true } } },
  });
  return consumptions.reduce((sum, c) => sum + c.product.price, 0);
}

/** Solo permite redirecciones internas (evita open redirect). */
export function safeNext(next: unknown, fallback = "/") {
  if (typeof next !== "string") return fallback;
  if (!next.startsWith("/") || next.startsWith("//")) return fallback;
  return next;
}
