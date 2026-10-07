import { describe, it, expect } from 'vitest';
import { ProductImage } from './product-image.vo';

describe('ProductImage', () => {
  it('creates a valid image filename', () => {
    const result = ProductImage.create('1740176-00-A_0_2000.jpg');
    expect(result.isOk()).toBe(true);
    result.match(
      (vo) => expect(vo.value).toBe('1740176-00-A_0_2000.jpg'),
      () => fail('Expected Ok'),
    );
  });

  it('rejects an empty string', () => {
    const result = ProductImage.create('');
    expect(result.isErr()).toBe(true);
  });

  it('rejects a whitespace-only string', () => {
    const result = ProductImage.create('   ');
    expect(result.isErr()).toBe(true);
  });
});

function fail(message: string): never {
  throw new Error(message);
}
