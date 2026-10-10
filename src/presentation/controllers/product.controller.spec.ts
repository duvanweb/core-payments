import { ok, err, okAsync, errAsync } from '@application/domain/shared/result';
import { DomainError } from '@application/domain/shared/domain-error';
import { Product } from '@application/domain/product/product';
import { ProductController } from './product.controller';

class FakeGetProductsUseCase {
  result: any = okAsync([]);
  execute() {
    return this.result;
  }
}

class FakeGetProductByIdUseCase {
  result: any = okAsync(null);
  execute(_id: string) {
    return this.result;
  }
}

class TestError extends DomainError {
  constructor() {
    super('PRODUCT_NOT_FOUND', 'Product not found');
  }
}

function makeProduct(): Product {
  const result = Product.create({
    id: 'prod-1',
    title: 'Test Product',
    description: 'A test product',
    price: 29.99,
    image: 'test.jpg',
    stock: 10,
  });
  return result.match(
    (p) => p,
    () => { throw new Error('Invalid product'); },
  );
}

function makeReq() {
  return {
    protocol: 'http',
    get: (key: string) => (key === 'host' ? 'localhost:3000' : ''),
  } as any;
}

describe('ProductController', () => {
  it('getProducts returns DTOs with correct imageUrl', async () => {
    const getProducts = new FakeGetProductsUseCase();
    const getProductById = new FakeGetProductByIdUseCase();
    getProducts.result = okAsync([makeProduct()]);
    const controller = new ProductController(getProducts as any, getProductById as any);

    const result = await controller.getProducts(makeReq());
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      id: 'prod-1',
      title: 'Test Product',
      description: 'A test product',
      price: 29.99,
      imageUrl: 'http://localhost:3000/images/test.jpg',
      stock: 10,
    });
  });

  it('getProducts throws on error', async () => {
    const getProducts = new FakeGetProductsUseCase();
    const getProductById = new FakeGetProductByIdUseCase();
    getProducts.result = errAsync(new TestError());
    const controller = new ProductController(getProducts as any, getProductById as any);

    await expect(controller.getProducts(makeReq())).rejects.toThrow();
  });

  it('getProductById returns DTO with correct imageUrl', async () => {
    const getProducts = new FakeGetProductsUseCase();
    const getProductById = new FakeGetProductByIdUseCase();
    getProductById.result = okAsync(makeProduct());
    const controller = new ProductController(getProducts as any, getProductById as any);

    const result = await controller.getProductById('prod-1', makeReq());
    expect(result.id).toBe('prod-1');
    expect(result.imageUrl).toBe('http://localhost:3000/images/test.jpg');
  });

  it('getProductById throws on error', async () => {
    const getProducts = new FakeGetProductsUseCase();
    const getProductById = new FakeGetProductByIdUseCase();
    getProductById.result = errAsync(new TestError());
    const controller = new ProductController(getProducts as any, getProductById as any);

    await expect(controller.getProductById('prod-1', makeReq())).rejects.toThrow();
  });
});
