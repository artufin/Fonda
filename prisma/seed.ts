import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Los ids son slugs fijos para que las URLs de los QR sean legibles y estables.
// La categoría determina en qué ranking del inicio cuenta cada consumo.
const products = [
  { id: "terremoto", name: "Terremoto", price: 950, category: "TRAGO" as const },
  { id: "piscola", name: "Piscola", price: 450, category: "TRAGO" as const },
  { id: "michelada", name: "Michelada", price: 400, category: "TRAGO" as const },
  { id: "carne", name: "Carne", price: 700, category: "COMIDA" as const },
  { id: "choripan", name: "Choripán", price: 200, category: "COMIDA" as const },
  { id: "sopaipilla", name: "Sopaipilla", price: 300, category: "COMIDA" as const },
];

async function main() {
  for (const p of products) {
    await prisma.product.upsert({
      where: { id: p.id },
      update: { name: p.name, price: p.price, category: p.category },
      create: p,
    });
    console.log(`✔ ${p.name} ($${p.price}) [${p.category}]`);
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
