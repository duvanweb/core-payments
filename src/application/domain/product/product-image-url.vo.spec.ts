import { describe, it, expect } from 'vitest';
import { ProductImageUrl } from './product-image-url.vo';

describe('ProductImageUrl', () => {
  it('creates a valid https URL', () => {
    const result = ProductImageUrl.create('https://example.com/coffee.png');
    expect(result.isOk()).toBe(true);
    result.match(
      (vo) => expect(vo.value).toBe('https://example.com/coffee.png'),
      () => fail('Expected Ok'),
    );
  });

  it('creates a valid http URL', () => {
    const result = ProductImageUrl.create('http://localhost:3000/img.png');
    expect(result.isOk()).toBe(true);
  });

  it('rejects a non-URL string', () => {
    const result = ProductImageUrl.create('not a url');
    expect(result.isErr()).toBe(true);
  });

  it('rejects a relative path', () => {
    const result = ProductImageUrl.create('/images/coffee.png');
    expect(result.isErr()).toBe(true);
  });

  it('rejects an empty string', () => {
    const result = ProductImageUrl.create('');
    expect(result.isErr()).toBe(true);
  });
});

function fail(message: string): never {
  throw new Error(message);
}
