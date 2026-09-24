"use client";

import { useEffect, useState } from "react";

type Props = {
  /** true cuando venimos de un login recién hecho: abre el modal una sola vez. */
  abrirAlInicio: boolean;
};

export function InstructionsModal({ abrirAlInicio }: Props) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!abrirAlInicio) return;
    setOpen(true);
    // Limpia el parámetro de la URL sin disparar una navegación de Next,
    // así un refresh de la página no vuelve a abrir el modal.
    window.history.replaceState(null, "", window.location.pathname);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [abrirAlInicio]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  if (!open) return null;

  return (
    <div className="modal-fondo" onClick={() => setOpen(false)}>
      <div
        className="modal-caja card card--rojo"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-titulo"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="modal-titulo">¿Cómo anotarse?</h2>
        <p>
          Toca <strong>Escanear QR</strong> y apunta al QR del trago o comida que quieras. También
          puedes escanearlo con la cámara normal del celular. Después confirmas y listo.
        </p>
        <button type="button" className="btn btn--rojo" onClick={() => setOpen(false)}>
          Entendido
        </button>
      </div>
    </div>
  );
}
