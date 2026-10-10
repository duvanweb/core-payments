import { GetProductsUseCase } from './get-products.use-case';
import { ProductRepositoryPort } from '@application/ports/repositories/product.repository.port';
import { Product } from '@application/domain/product/product';
import { ResultAsync, okAsync, errAsync } from '@application/domain/shared/result';
import { ProductRepositoryError } from '@application/domain/product/product-errors';

class FakeProductRepository implements ProductRepositoryPort {
  constructor(private readonly products: Product[] | null) {}

  findAll(): ResultAsync<Product[], ProductRepositoryError> {
    if (this.products === null) {
      return errAsync(new ProductRepositoryError('DB unavailable'));
    }
    return okAsync(this.products);
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

describe('GetProductsUseCase', () => {
  it('returns Ok with products from the repository', async () => {
    const products = [makeProduct()];
    const useCase = new GetProductsUseCase(new FakeProductRepository(products));

    const result = await useCase.execute();

    expect(result.isOk()).toBe(true);
    result.match(
      (value) => expect(value).toHaveLength(1),
      () => fail('Expected Ok'),
    );
  });

  it('returns Ok with an empty array when no products exist', async () => {
    const useCase = new GetProductsUseCase(new FakeProductRepository([]));

    const result = await useCase.execute();

    expect(result.isOk()).toBe(true);
    result.match(
      (value) => expect(value).toHaveLength(0),
      () => fail('Expected Ok'),
    );
  });

  it('propagates Err when the repository fails', async () => {
    const useCase = new GetProductsUseCase(new FakeProductRepository(null));

    const result = await useCase.execute();

    expect(result.isErr()).toBe(true);
  });
});

function fail(message: string): never {
  throw new Error(message);
}
