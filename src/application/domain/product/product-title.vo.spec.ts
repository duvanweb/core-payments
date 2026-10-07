import { ProductTitle } from './product-title.vo';

describe('ProductTitle', () => {
  it('creates a valid title', () => {
    const result = ProductTitle.create('Premium Coffee Beans');
    expect(result.isOk()).toBe(true);
    result.match(
      (vo) => expect(vo.value).toBe('Premium Coffee Beans'),
      () => fail('Expected Ok'),
    );
  });

  it('rejects an empty string', () => {
    const result = ProductTitle.create('');
    expect(result.isErr()).toBe(true);
  });

  it('rejects a title exceeding 200 characters', () => {
    const result = ProductTitle.create('a'.repeat(201));
    expect(result.isErr()).toBe(true);
  });

  it('accepts a title of exactly 200 characters', () => {
    const result = ProductTitle.create('a'.repeat(200));
    expect(result.isOk()).toBe(true);
  });
});

function fail(message: string): never {
  throw new Error(message);
}
