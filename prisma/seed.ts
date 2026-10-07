import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const products = [
  {
    description: 'Premium Coffee Beans 1kg',
    price: 29.99,
    imageUrl: 'https://images.example.com/coffee-1kg.png',
    stock: 42,
  },
  {
    description: 'Organic Tea Selection',
    price: 19.5,
    imageUrl: 'https://images.example.com/tea-selection.png',
    stock: 15,
  },
  {
    description: 'Chocolate Gift Box',
    price: 45.0,
    imageUrl: 'https://images.example.com/chocolate-box.png',
    stock: 8,
  },
  {
    description: 'Ceramic Mug Set',
    price: 24.99,
    imageUrl: 'https://images.example.com/mug-set.png',
    stock: 0,
  },
  {
    description: 'Stainless Steel Thermos',
    price: 34.95,
    imageUrl: 'https://images.example.com/thermos.png',
    stock: 23,
  },
];

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
