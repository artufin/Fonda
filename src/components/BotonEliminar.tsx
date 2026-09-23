"use client";

import { useFormStatus } from "react-dom";

type Props = {
  nombre: string;
  cantidad: number;
};

export function BotonEliminar({ nombre, cantidad }: Props) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      className="btn-x"
      disabled={pending}
      aria-label={`Eliminar a ${nombre}`}
      onClick={(e) => {
        const mensaje =
          cantidad > 0
            ? `¿Eliminar a ${nombre}? También se borrarán sus ${cantidad} consumo(s). Esta acción no se puede deshacer.`
            : `¿Eliminar a ${nombre}? Esta acción no se puede deshacer.`;
        if (!window.confirm(mensaje)) {
          e.preventDefault();
        }
      }}
    >
      {pending ? "…" : "✕"}
    </button>
  );
}
