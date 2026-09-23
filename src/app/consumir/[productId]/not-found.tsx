import Link from "next/link";

export default function ProductoNoEncontrado() {
  return (
    <div className="card card--rojo">
      <h1>Ese producto no existe</h1>
      <p>Puede que el QR esté dañado o sea de otra fiesta. Prueba con otro.</p>
      <Link href="/" className="btn btn--azul">
        Volver al inicio
      </Link>
    </div>
  );
}
