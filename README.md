# La Fonda 🇨🇱

App web para registrar consumo de tragos y comida en una fiesta. Cada invitado entra con su nombre, escanea el QR del producto con la cámara del celular, confirma, y al final de la noche `/admin` muestra cuánto debe cada uno.

Stack: Next.js 15 (App Router, TypeScript), Prisma, PostgreSQL (Neon), Vercel.

## Flujo

1. El invitado abre cualquier URL de la app. Si no tiene sesión se le pide solo su nombre (queda en una cookie `httpOnly`).
2. Escanea un QR impreso que apunta a `https://<BASE_URL>/consumir/<productId>`.
3. La página muestra nombre y precio y pide confirmación.
4. Al confirmar se guarda el consumo y se muestra "Listo. Llevas $X gastados".
5. `/admin` lista cada invitado con su total (sin login, solo protegido por no compartir la URL).

## Correr localmente

```bash
npm install
cp .env.example .env        # editar DATABASE_URL y NEXT_PUBLIC_BASE_URL
npm run db:push             # crea las tablas en la base
npm run seed                # carga los productos
npm run dev                 # http://localhost:3000
```

Para probar el flujo de QR sin imprimir nada, abre `http://localhost:3000/consumir/terremoto` en el navegador.

## Crear la base en Neon

1. Entra a [neon.tech](https://neon.tech) y crea un proyecto (región cercana, por ejemplo `sa-east-1` o `us-east-1`).
2. En el dashboard, copia la **pooled connection string** (la que tiene `-pooler` en el host). Debe terminar en `?sslmode=require`.
3. Pégala como `DATABASE_URL` en tu `.env` local y luego en Vercel.

## Deploy en Vercel

1. Sube el repo a GitHub y en [vercel.com](https://vercel.com) haz **Import Project**.
2. En **Environment Variables** agrega:
   - `DATABASE_URL`: la connection string de Neon.
   - `NEXT_PUBLIC_BASE_URL`: la URL final del deploy, sin slash al final (por ejemplo `https://fonda.vercel.app`). Si aún no la sabes, agrégala después del primer deploy.
3. Deploy. El comando de build ya corre `prisma generate` antes de `next build`.

## Correr el seed contra la base de producción

Desde tu máquina, apuntando `.env` a la base de Neon:

```bash
npm run db:push   # solo la primera vez, crea las tablas
npm run seed      # carga/actualiza los 6 productos
```

El seed hace `upsert` por id, así que puedes correrlo varias veces sin duplicar. Para cambiar nombres o precios edita [prisma/seed.ts](prisma/seed.ts) y vuelve a correrlo.

Productos precargados:

| id            | Nombre      | Precio |
|---------------|-------------|--------|
| `terremoto`   | Terremoto   | $950   |
| `piscola`     | Piscola     | $450   |
| `michelada`   | Michelada   | $400   |
| `carne`       | Carne       | $700   |
| `choripan`    | Choripán    | $200   |
| `sopaipillas` | Sopaipillas | $300   |

## Generar los QR (cuando ya tengas la URL definitiva)

Con `NEXT_PUBLIC_BASE_URL` y `DATABASE_URL` en `.env`:

```bash
npm run qrs
```

Genera un PNG de 1024x1024 por producto en `./qrs/` (por ejemplo `qrs/terremoto.png`), apuntando a `https://<BASE_URL>/consumir/<productId>`. Imprímelos, escribe el nombre y precio al lado, y pégalos donde se sirve cada cosa.

Si cambias de dominio, actualiza la variable y vuelve a correr el script.

## Cobrar al final

Abre `https://<BASE_URL>/admin`. Muestra cada invitado con detalle de ítems y total, ordenado de mayor a menor, más el total de la fiesta. Recarga para actualizar.
