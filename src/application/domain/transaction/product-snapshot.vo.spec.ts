import { ProductSnapshot } from './product-snapshot.vo';
import { InvalidProductSnapshotError } from './transaction-errors';

const validProps = {
  id: 'prod-1',
  title: 'Test Product',
  price: 29.99,
  image: 'test.jpg',
  description: 'A test product',
};

describe('ProductSnapshot', () => {
  it('creates a valid snapshot', () => {
    const result = ProductSnapshot.create(validProps);
    expect(result.isOk()).toBe(true);
    result.match(
      (vo) => {
        expect(vo.id).toBe('prod-1');
        expect(vo.title).toBe('Test Product');
        expect(vo.price).toBe(29.99);
        expect(vo.image).toBe('test.jpg');
        expect(vo.description).toBe('A test product');
      },
      () => fail('Expected Ok'),
    );
  });

  it('rejects empty id', () => {
    const result = ProductSnapshot.create({ ...validProps, id: '' });
    expect(result.isErr()).toBe(true);
  });

  it('rejects empty title', () => {
    const result = ProductSnapshot.create({ ...validProps, title: '' });
    expect(result.isErr()).toBe(true);
  });

  it('rejects negative price', () => {
    const result = ProductSnapshot.create({ ...validProps, price: -1 });
    expect(result.isErr()).toBe(true);
  });

  it('rejects non-number price', () => {
    const result = ProductSnapshot.create({ ...validProps, price: 'abc' as unknown as number });
    expect(result.isErr()).toBe(true);
  });

  it('rejects empty image', () => {
    const result = ProductSnapshot.create({ ...validProps, image: '' });
    expect(result.isErr()).toBe(true);
  });

  it('rejects empty description', () => {
    const result = ProductSnapshot.create({ ...validProps, description: '' });
    expect(result.isErr()).toBe(true);
  });

  it('returns InvalidProductSnapshotError on rejection', () => {
    const result = ProductSnapshot.create({ ...validProps, id: '' });
    result.match(
      () => fail('Expected Err'),
      (error) => expect(error).toBeInstanceOf(InvalidProductSnapshotError),
    );
  });

  it('toJSON returns the props', () => {
    const result = ProductSnapshot.create(validProps);
    result.match(
      (vo) => expect(vo.toJSON()).toEqual(validProps),
      () => fail('Expected Ok'),
    );
  });
});

function fail(message: string): never {
  throw new Error(message);
}
