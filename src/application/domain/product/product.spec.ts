import { describe, it, expect } from 'vitest';
import { Product } from './product';

const validProps = {
  id: 'prod-001',
  description: 'Premium coffee beans',
  price: 29.99,
  imageUrl: 'https://example.com/coffee.png',
  stock: 42,
};

describe('Product', () => {
  it('creates a valid product', () => {
    const result = Product.create(validProps);
    expect(result.isOk()).toBe(true);
    result.match(
      (product) => {
        expect(product.id).toBe('prod-001');
        expect(product.description.value).toBe('Premium coffee beans');
        expect(product.price.value).toBe(29.99);
        expect(product.imageUrl.value).toBe('https://example.com/coffee.png');
        expect(product.stock.value).toBe(42);
      },
      () => fail('Expected Ok'),
    );
  });

  it('returns Err when description is empty', () => {
    const result = Product.create({ ...validProps, description: '' });
    expect(result.isErr()).toBe(true);
  });

  it('returns Err when price is negative', () => {
    const result = Product.create({ ...validProps, price: -5 });
    expect(result.isErr()).toBe(true);
  });

  it('returns Err when imageUrl is invalid', () => {
    const result = Product.create({ ...validProps, imageUrl: 'not-a-url' });
    expect(result.isErr()).toBe(true);
  });

  it('returns Err when stock is negative', () => {
    const result = Product.create({ ...validProps, stock: -1 });
    expect(result.isErr()).toBe(true);
  });

  it('returns Err when stock is not an integer', () => {
    const result = Product.create({ ...validProps, stock: 2.5 });
    expect(result.isErr()).toBe(true);
  });
});

function fail(message: string): never {
  throw new Error(message);
}
