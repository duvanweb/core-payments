import { describe, it, expect } from 'vitest';
import { ProductPrice } from './product-price.vo';

describe('ProductPrice', () => {
  it('creates a valid positive price', () => {
    const result = ProductPrice.create(29.99);
    expect(result.isOk()).toBe(true);
    result.match(
      (vo) => expect(vo.value).toBe(29.99),
      () => fail('Expected Ok'),
    );
  });

  it('accepts a price of zero', () => {
    const result = ProductPrice.create(0);
    expect(result.isOk()).toBe(true);
  });

  it('rejects a negative price', () => {
    const result = ProductPrice.create(-1);
    expect(result.isErr()).toBe(true);
  });

  it('rejects NaN', () => {
    const result = ProductPrice.create(Number.NaN);
    expect(result.isErr()).toBe(true);
  });

  it('rejects Infinity', () => {
    const result = ProductPrice.create(Number.POSITIVE_INFINITY);
    expect(result.isErr()).toBe(true);
  });
});

function fail(message: string): never {
  throw new Error(message);
}
