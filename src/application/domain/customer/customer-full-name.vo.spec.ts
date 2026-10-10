import { CustomerFullName } from './customer-full-name.vo';
import { InvalidCustomerFullNameError } from './customer-errors';

describe('CustomerFullName', () => {
  it('creates a valid full name', () => {
    const result = CustomerFullName.create('John Doe');
    expect(result.isOk()).toBe(true);
    result.match(
      (vo) => expect(vo.value).toBe('John Doe'),
      () => fail('Expected Ok'),
    );
  });

  it('rejects an empty string', () => {
    const result = CustomerFullName.create('');
    expect(result.isErr()).toBe(true);
  });

  it('rejects null', () => {
    const result = CustomerFullName.create(null as unknown as string);
    expect(result.isErr()).toBe(true);
  });

  it('rejects undefined', () => {
    const result = CustomerFullName.create(undefined as unknown as string);
    expect(result.isErr()).toBe(true);
  });

  it('rejects a whitespace-only string', () => {
    const result = CustomerFullName.create('   ');
    expect(result.isErr()).toBe(true);
  });

  it('accepts a name of exactly 200 characters', () => {
    const result = CustomerFullName.create('a'.repeat(200));
    expect(result.isOk()).toBe(true);
  });

  it('rejects a name exceeding 200 characters', () => {
    const result = CustomerFullName.create('a'.repeat(201));
    expect(result.isErr()).toBe(true);
  });

  it('returns InvalidCustomerFullNameError on rejection', () => {
    const result = CustomerFullName.create('');
    result.match(
      () => fail('Expected Err'),
      (error) => expect(error).toBeInstanceOf(InvalidCustomerFullNameError),
    );
  });
});

function fail(message: string): never {
  throw new Error(message);
}
