import { Stock } from './stock.vo';

describe('Stock', () => {
  it('creates valid stock of zero', () => {
    const result = Stock.create(0);
    expect(result.isOk()).toBe(true);
    result.match(
      (vo) => expect(vo.value).toBe(0),
      () => fail('Expected Ok'),
    );
  });

  it('creates a valid positive integer', () => {
    const result = Stock.create(42);
    expect(result.isOk()).toBe(true);
  });

  it('rejects a negative value', () => {
    const result = Stock.create(-1);
    expect(result.isErr()).toBe(true);
  });

  it('rejects a non-integer', () => {
    const result = Stock.create(3.5);
    expect(result.isErr()).toBe(true);
  });
});

function fail(message: string): never {
  throw new Error(message);
}
