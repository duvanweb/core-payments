import { describe, it, expect } from 'vitest';
import { GetProductByIdUseCase } from './get-product-by-id.use-case';
import { ProductRepositoryPort } from '@application/ports/repositories/product.repository.port';
import { Product } from '@application/domain/product/product';
import { ResultAsync, okAsync, errAsync } from '@application/domain/shared/result';
import {
  ProductRepositoryError,
  ProductNotFoundError,
} from '@application/domain/product/product-errors';

class FakeProductRepository implements ProductRepositoryPort {
  constructor(
    private readonly product: Product | null,
    private readonly fail: boolean = false,
  ) {}

  findAll(): ResultAsync<Product[], ProductRepositoryError> {
    if (this.fail) return errAsync(new ProductRepositoryError('DB unavailable'));
    return okAsync(this.product ? [this.product] : []);
  }

  findById(id: string): ResultAsync<Product | null, ProductRepositoryError> {
    if (this.fail) return errAsync(new ProductRepositoryError('DB unavailable'));
    return okAsync(this.product && this.product.id === id ? this.product : null);
  }
}

function makeProduct(): Product {
  const result = Product.create({
    id: 'prod-001',
    title: 'Premium coffee beans',
    description: 'Premium coffee beans description',
    price: 29.99,
    image: 'coffee-1kg.jpg',
    stock: 42,
  });
  return result.match(
    (p) => p,
    () => {
      throw new Error('Failed to create test product');
    },
  );
}

describe('GetProductByIdUseCase', () => {
  it('returns Ok with the product when found', async () => {
    const product = makeProduct();
    const useCase = new GetProductByIdUseCase(new FakeProductRepository(product));

    const result = await useCase.execute('prod-001');

    expect(result.isOk()).toBe(true);
    result.match(
      (value) => expect(value.id).toBe('prod-001'),
      () => fail('Expected Ok'),
    );
  });

  it('returns Err with ProductNotFoundError when not found', async () => {
    const useCase = new GetProductByIdUseCase(new FakeProductRepository(null));

    const result = await useCase.execute('nonexistent');

    expect(result.isErr()).toBe(true);
    result.match(
      () => fail('Expected Err'),
      (error) => expect(error).toBeInstanceOf(ProductNotFoundError),
    );
  });

  it('propagates Err when the repository fails', async () => {
    const useCase = new GetProductByIdUseCase(new FakeProductRepository(null, true));

    const result = await useCase.execute('prod-001');

    expect(result.isErr()).toBe(true);
  });
});

function fail(message: string): never {
  throw new Error(message);
}
