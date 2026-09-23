"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { QrScanner } from "@/components/QrScanner";

/** Extrae el productId de un QR que apunte a /consumir/<id>, o null si no es de la fonda. */
function parseProductId(text: string): string | null {
  try {
    const url = new URL(text, window.location.origin);
    const match = url.pathname.match(/^\/consumir\/([^/]+)\/?$/);
    return match ? decodeURIComponent(match[1]) : null;
  } catch {
    return null;
  }
}

export function Escaner() {
  const router = useRouter();
  const [invalido, setInvalido] = useState(false);
  const [leido, setLeido] = useState(false);

  const onResult = useCallback(
    (text: string) => {
      const productId = parseProductId(text);
      if (!productId) {
        setInvalido(true);
        return false; // sigue escaneando
      }
      setLeido(true);
      router.push(`/consumir/${encodeURIComponent(productId)}`);
      return true;
    },
    [router],
  );

  return (
    <>
      <QrScanner onResult={onResult} />
      {leido ? (
        <p className="muted" style={{ textAlign: "center" }}>
          QR leído, abriendo producto...
        </p>
      ) : invalido ? (
        <p className="error" style={{ textAlign: "center" }}>
          Ese QR no es de la fonda. Apunta al QR de un trago o comida.
        </p>
      ) : (
        <p className="muted" style={{ textAlign: "center" }}>
          Apunta la cámara al QR del producto.
        </p>
      )}
    </>
  );
}
