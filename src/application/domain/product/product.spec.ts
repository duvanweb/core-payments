import { Product } from './product';

const validProps = {
  id: 'prod-001',
  title: 'Premium coffee beans',
  description: 'Premium coffee beans description',
  price: 29.99,
  image: 'coffee-1kg.jpg',
  stock: 42,
};

describe('Product', () => {
  it('creates a valid product', () => {
    const result = Product.create(validProps);
    expect(result.isOk()).toBe(true);
    result.match(
      (product) => {
        expect(product.id).toBe('prod-001');
        expect(product.title.value).toBe('Premium coffee beans');
        expect(product.description.value).toBe('Premium coffee beans description');
        expect(product.price.value).toBe(29.99);
        expect(product.image.value).toBe('coffee-1kg.jpg');
        expect(product.stock.value).toBe(42);
      },
      () => fail('Expected Ok'),
    );
  });

  it('returns Err when title is empty', () => {
    const result = Product.create({ ...validProps, title: '' });
    expect(result.isErr()).toBe(true);
  });

  it('returns Err when description is empty', () => {
    const result = Product.create({ ...validProps, description: '' });
    expect(result.isErr()).toBe(true);
  });

  it('returns Err when price is negative', () => {
    const result = Product.create({ ...validProps, price: -5 });
    expect(result.isErr()).toBe(true);
  });

  it('returns Err when image is empty', () => {
    const result = Product.create({ ...validProps, image: '' });
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
