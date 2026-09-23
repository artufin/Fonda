import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fonda Doña Dani",
  description: "Registro de consumos de la fiesta",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0039a6",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <header className="header">
          <Link href="/">
            <span className="estrella">★</span>La Fonda
          </Link>
        </header>
        <main className="main">{children}</main>
      </body>
    </html>
  );
}
