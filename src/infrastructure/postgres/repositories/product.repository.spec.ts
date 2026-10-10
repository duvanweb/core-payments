import { PrismaProductRepository } from './product.repository';
import { ProductRepositoryError } from '@application/domain/product/product-errors';

function makePrismaRow(overrides: Partial<any> = {}) {
  return {
    id: 'prod-1',
    title: 'Test Product',
    description: 'A test product',
    price: 29.99,
    image: 'test.jpg',
    stock: 10,
    ...overrides,
  };
}

function makePrisma(rows: any[] = []) {
  return {
    product: {
      findMany: jest.fn().mockResolvedValue(rows),
      findUnique: jest.fn().mockResolvedValue(rows[0] ?? null),
    },
  };
}

describe('PrismaProductRepository', () => {
  it('findAll returns domain products on success', async () => {
    const prisma = makePrisma([makePrismaRow()]);
    const repo = new PrismaProductRepository(prisma as any);

    const result = await repo.findAll();
    result.match(
      (products) => {
        expect(products).toHaveLength(1);
        expect(products[0].id).toBe('prod-1');
        expect(products[0].title.value).toBe('Test Product');
      },
      () => fail('Expected Ok'),
    );
  });

  it('findAll returns empty array when no rows', async () => {
    const prisma = makePrisma([]);
    const repo = new PrismaProductRepository(prisma as any);

    const result = await repo.findAll();
    result.match(
      (products) => expect(products).toHaveLength(0),
      () => fail('Expected Ok'),
    );
  });

  it('findAll returns error on prisma failure', async () => {
    const prisma = makePrisma();
    prisma.product.findMany.mockRejectedValue(new Error('DB error'));
    const repo = new PrismaProductRepository(prisma as any);

    const result = await repo.findAll();
    result.match(
      () => fail('Expected Err'),
      (error) => expect(error).toBeInstanceOf(ProductRepositoryError),
    );
  });

  it('findById returns product when found', async () => {
    const prisma = makePrisma([makePrismaRow()]);
    const repo = new PrismaProductRepository(prisma as any);

    const result = await repo.findById('prod-1');
    result.match(
      (product) => {
        expect(product).not.toBeNull();
        expect(product!.id).toBe('prod-1');
      },
      () => fail('Expected Ok'),
    );
  });

  it('findById returns null when not found', async () => {
    const prisma = makePrisma();
    const repo = new PrismaProductRepository(prisma as any);

    const result = await repo.findById('not-found');
    result.match(
      (product) => expect(product).toBeNull(),
      () => fail('Expected Ok'),
    );
  });

  it('findById returns error on prisma failure', async () => {
    const prisma = makePrisma();
    prisma.product.findUnique.mockRejectedValue(new Error('DB error'));
    const repo = new PrismaProductRepository(prisma as any);

    const result = await repo.findById('prod-1');
    result.match(
      () => fail('Expected Err'),
      (error) => expect(error).toBeInstanceOf(ProductRepositoryError),
    );
  });
});

function fail(message: string): never {
  throw new Error(message);
}
