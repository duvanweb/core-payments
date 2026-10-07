import { ProductDescription } from './product-description.vo';

describe('ProductDescription', () => {
  it('creates a valid description', () => {
    const result = ProductDescription.create('Premium coffee beans');
    expect(result.isOk()).toBe(true);
    result.match(
      (vo) => expect(vo.value).toBe('Premium coffee beans'),
      () => fail('Expected Ok'),
    );
  });

  it('rejects an empty string', () => {
    const result = ProductDescription.create('');
    expect(result.isErr()).toBe(true);
  });

  it('rejects a whitespace-only string', () => {
    const result = ProductDescription.create('   ');
    expect(result.isErr()).toBe(true);
  });

  it('rejects a description exceeding 500 characters', () => {
    const result = ProductDescription.create('a'.repeat(501));
    expect(result.isErr()).toBe(true);
  });

  it('accepts a description of exactly 500 characters', () => {
    const result = ProductDescription.create('a'.repeat(500));
    expect(result.isOk()).toBe(true);
  });
});

function fail(message: string): never {
  throw new Error(message);
}
