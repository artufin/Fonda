import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Los ids son slugs fijos para que las URLs de los QR sean legibles y estables.
const products = [
  { id: "terremoto", name: "Terremoto", price: 950 },
  { id: "piscola", name: "Piscola", price: 450 },
  { id: "michelada", name: "Michelada", price: 400 },
  { id: "carne", name: "Carne", price: 700 },
  { id: "choripan", name: "Choripán", price: 200 },
  { id: "sopaipilla", name: "Sopaipilla", price: 300 },
];

async function main() {
  for (const p of products) {
    await prisma.product.upsert({
      where: { id: p.id },
      update: { name: p.name, price: p.price },
      create: p,
    });
    console.log(`✔ ${p.name} ($${p.price})`);
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
