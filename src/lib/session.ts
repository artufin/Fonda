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

const PESOS_POR_PUNTO = 500;

/**
 * Duro Puntos disponibles: los ganados por consumo (1 cada $500 gastados en
 * total) menos los ya gastados en canjes de premios. Siempre se calcula desde
 * el historial real (Consumption y Exchange), nunca desde un contador
 * guardado, para que canjear un premio y luego seguir comprando no "revierta"
 * puntos ya gastados.
 */
export async function getGuestPoints(guestId: string) {
  const [totalGastado, canjes] = await Promise.all([
    getGuestTotal(guestId),
    prisma.exchange.findMany({
      where: { guestId },
      select: { prize: { select: { price: true } } },
    }),
  ]);

  const puntosGanados = Math.floor(totalGastado / PESOS_POR_PUNTO);
  const puntosCanjeados = canjes.reduce((sum, e) => sum + e.prize.price, 0);

  return Math.max(0, puntosGanados - puntosCanjeados);
}

/** Solo permite redirecciones internas (evita open redirect). */
export function safeNext(next: unknown, fallback = "/") {
  if (typeof next !== "string") return fallback;
  if (!next.startsWith("/") || next.startsWith("//")) return fallback;
  return next;
}

/** Agrega (o reemplaza) un parámetro de query a un path interno ya validado. */
export function withParam(path: string, key: string, value: string) {
  const [base, query] = path.split("?");
  const params = new URLSearchParams(query);
  params.set(key, value);
  return `${base}?${params.toString()}`;
}
