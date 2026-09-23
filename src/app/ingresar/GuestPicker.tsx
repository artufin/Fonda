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
  const singleFormRef = useRef<HTMLFormElement>(null);

  const filtrados = useMemo(() => {
    const q = normalizar(query.trim());
    if (!q) return guests;
    return guests.filter((g) => normalizar(g.name).includes(q));
  }, [guests, query]);

  return (
    <div className="combo">
      <input
        className="input"
        type="text"
        inputMode="text"
        autoComplete="off"
        placeholder="Escribe o busca tu nombre..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => {
          // Si queda un solo resultado, Enter lo selecciona directo.
          if (e.key === "Enter" && filtrados.length === 1) {
            e.preventDefault();
            singleFormRef.current?.requestSubmit();
          }
        }}
        autoFocus
      />
      <div className="combo__lista">
        {filtrados.length === 0 ? (
          <p className="combo__vacio">
            No encontramos ese nombre. Pide al anfitrión que te agregue en /admin.
          </p>
        ) : (
          filtrados.map((g) => (
            <form
              key={g.id}
              action={ingresar}
              ref={filtrados.length === 1 ? singleFormRef : undefined}
            >
              <input type="hidden" name="guestId" value={g.id} />
              <input type="hidden" name="next" value={next} />
              <button type="submit" className="combo__opcion">
                {resaltar(g.name, query)}
              </button>
            </form>
          ))
        )}
      </div>
    </div>
  );
}
