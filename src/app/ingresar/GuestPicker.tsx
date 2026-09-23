"use client";

import { useMemo, useRef, useState } from "react";
import { ingresar } from "./actions";

type Guest = { id: string; name: string };

type Props = {
  guests: Guest[];
  next: string;
};

/** Minúsculas y sin tildes, para que "jose" encuentre "José". */
function normalizar(s: string) {
  return s
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

/** Resalta la parte del nombre que coincide con la búsqueda (si calza tal cual). */
function resaltar(nombre: string, query: string) {
  if (!query) return nombre;
  const i = nombre.toLowerCase().indexOf(query.toLowerCase());
  if (i === -1) return nombre;
  return (
    <>
      {nombre.slice(0, i)}
      <mark>{nombre.slice(i, i + query.length)}</mark>
      {nombre.slice(i + query.length)}
    </>
  );
}

export function GuestPicker({ guests, next }: Props) {
  const [query, setQuery] = useState("");
  const [seleccionado, setSeleccionado] = useState<Guest | null>(null);
  const [nombreEditado, setNombreEditado] = useState("");
  const formRefs = useRef(new Map<string, HTMLFormElement>());

  const filtrados = useMemo(() => {
    const q = normalizar(query.trim());
    if (!q) return guests;
    return guests.filter((g) => normalizar(g.name).includes(q));
  }, [guests, query]);

  const seleccionar = (g: Guest) => {
    setSeleccionado(g);
    setNombreEditado(g.name);
  };

  return (
    <div className="combo">
      <input
        className="input"
        type="text"
        inputMode="text"
        autoComplete="off"
        placeholder="Escribe para buscar"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => {
          // Si queda un solo resultado, Enter abre la confirmación de ese nombre.
          if (e.key === "Enter" && filtrados.length === 1) {
            e.preventDefault();
            seleccionar(filtrados[0]);
          }
        }}
        autoFocus
      />
      <div className="combo__lista">
        {filtrados.length === 0 ? (
          <p className="combo__vacio">No está ese nombre. Pregúntale a Arturo que wea.</p>
        ) : (
          filtrados.map((g) => (
            <form
              key={g.id}
              action={ingresar}
              ref={(el) => {
                if (el) formRefs.current.set(g.id, el);
                else formRefs.current.delete(g.id);
              }}
            >
              <input type="hidden" name="guestId" value={g.id} />
              <input type="hidden" name="next" value={next} />
              <input
                type="hidden"
                name="name"
                value={seleccionado?.id === g.id ? nombreEditado : g.name}
              />
              <button
                type="submit"
                className="combo__opcion"
                onClick={(e) => {
                  // Con JS, primero se puede corregir el nombre; sin JS, entra directo.
                  e.preventDefault();
                  seleccionar(g);
                }}
              >
                {resaltar(g.name, query)}
              </button>
            </form>
          ))
        )}
      </div>

      {seleccionado && (
        <div className="modal-fondo" onClick={() => setSeleccionado(null)}>
          <div
            className="modal-caja card card--rojo"
            role="dialog"
            aria-modal="true"
            aria-labelledby="editar-titulo"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="editar-titulo">¿Tu nombre está bien escrito?</h2>
            <p className="muted">Puedes corregirlo antes de entrar.</p>
            <input
              className="input"
              type="text"
              value={nombreEditado}
              onChange={(e) => setNombreEditado(e.target.value)}
              maxLength={40}
              autoFocus
            />
            <div className="stack" style={{ marginTop: 16 }}>
              <button
                type="button"
                className="btn btn--rojo"
                disabled={nombreEditado.trim().length < 2}
                onClick={() => formRefs.current.get(seleccionado.id)?.requestSubmit()}
              >
                Entrar
              </button>
              <button
                type="button"
                className="btn btn--blanco"
                onClick={() => setSeleccionado(null)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
