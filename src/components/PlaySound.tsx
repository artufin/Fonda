"use client";

import { useEffect } from "react";

type Props = {
  src: string;
};

/**
 * Reproduce un sonido una sola vez, apenas se monta la pantalla. No dibuja
 * nada. Si el navegador bloquea el autoplay con sonido (falta de gesto del
 * usuario), falla en silencio sin romper la página.
 */
export function PlaySound({ src }: Props) {
  useEffect(() => {
    const audio = new Audio(src);
    audio.play().catch(() => {});
    return () => {
      audio.pause();
    };
  }, [src]);

  return null;
}
