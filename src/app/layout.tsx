import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "./globals.css";
import { salir } from "./actions";
import { getCurrentGuest } from "@/lib/session";

export const metadata: Metadata = {
  title: "Fonda Doña Dani",
  description: "Registro de consumos de la fiesta",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0039a6",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const guest = await getCurrentGuest();

  return (
    <html lang="es">
      <body>
        <header className="header">
          <div className="header__espaciador" aria-hidden />
          <Link href="/" className="header__titulo">
            <span className="title">🇨🇱 Fonda Doña Dani 🇨🇱</span>
          </Link>
          {guest ? (
            <form action={salir}>
              <button type="submit" className="header__salir" aria-label="Salir">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </button>
            </form>
          ) : (
            <div className="header__espaciador" aria-hidden />
          )}
        </header>
        <main className="main">{children}</main>
      </body>
    </html>
  );
}
