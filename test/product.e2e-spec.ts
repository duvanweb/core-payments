import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import request from 'supertest';
import { AppModule } from '../src/app.module';

interface ProductResponseBody {
  id: string;
  title: string;
  description: string;
  price: number;
  imageUrl: string;
  stock: number;
}

const testProducts = [
  { title: 'Test Product A', description: 'Desc A', price: 10.0, image: 'test-a.jpg', stock: 5 },
  { title: 'Test Product B', description: 'Desc B', price: 20.5, image: 'test-b.jpg', stock: 10 },
  { title: 'Test Product C', description: 'Desc C', price: 30.99, image: 'test-c.jpg', stock: 0 },
];

describe('Products (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaClient;

  beforeAll(async () => {
    prisma = new PrismaClient();
    await prisma.product.deleteMany();
    await prisma.product.createMany({ data: testProducts });

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterAll(async () => {
    await prisma.product.deleteMany();
    await prisma.$disconnect();
    await app.close();
  });

  it('GET /api/products → 200 with seeded products', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/products')
      .expect(200);

    const body = response.body as ProductResponseBody[];
    expect(body).toHaveLength(testProducts.length);

    for (const product of body) {
      expect(typeof product.id).toBe('string');
      expect(typeof product.title).toBe('string');
      expect(typeof product.description).toBe('string');
      expect(typeof product.price).toBe('number');
      expect(typeof product.imageUrl).toBe('string');
      expect(product.imageUrl).toMatch(/^https?:\/\/.+\/images\/.+$/);
      expect(typeof product.stock).toBe('number');
    }
  });

  it('returns products with the expected titles', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/products')
      .expect(200);

    const body = response.body as ProductResponseBody[];
    const titles = body.map((p) => p.title).sort();
    expect(titles).toEqual(['Test Product A', 'Test Product B', 'Test Product C']);
  });
});
