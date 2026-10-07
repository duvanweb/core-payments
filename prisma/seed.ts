import { PrismaClient } from '@prisma/client';
import { initialData } from './seed-data';

const prisma = new PrismaClient();

const products = initialData.products.map((p) => ({
  title: p.title,
  description: p.description,
  price: p.price,
  image: p.images[0],
  stock: p.stock,
}));

async function main() {
  console.log('Seeding products...');
  await prisma.product.deleteMany();
  await prisma.product.createMany({ data: products });
  console.log(`Seeded ${products.length} products.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
