import "dotenv/config";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import QRCode from "qrcode";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/+$/, "");
  if (!baseUrl) {
    throw new Error("Falta NEXT_PUBLIC_BASE_URL en el entorno (.env). Ej: https://tu-app.vercel.app");
  }

  const products = await prisma.product.findMany({ orderBy: { name: "asc" } });
  if (products.length === 0) {
    throw new Error("No hay productos en la base. Corre primero: npm run seed");
  }

  const outDir = path.join(process.cwd(), "qrs");
  await mkdir(outDir, { recursive: true });

  for (const p of products) {
    const url = `${baseUrl}/consumir/${p.id}`;
    const file = path.join(outDir, `${p.id}.png`);
    const png = await QRCode.toBuffer(url, {
      type: "png",
      width: 1024,
      margin: 2,
      errorCorrectionLevel: "M",
      color: { dark: "#0039a6", light: "#ffffff" },
    });
    await writeFile(file, png);
    console.log(`✔ ${p.name.padEnd(14)} $${p.price}  ->  ${url}  (${path.relative(process.cwd(), file)})`);
  }

  console.log(`\nListo: ${products.length} QR generados en ./qrs`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e.message ?? e);
    await prisma.$disconnect();
    process.exit(1);
  });
