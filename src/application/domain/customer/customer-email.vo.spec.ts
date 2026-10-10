import { CustomerEmail } from './customer-email.vo';
import { InvalidCustomerEmailError } from './customer-errors';

describe('CustomerEmail', () => {
  it('creates a valid email', () => {
    const result = CustomerEmail.create('user@example.com');
    expect(result.isOk()).toBe(true);
    result.match(
      (vo) => expect(vo.value).toBe('user@example.com'),
      () => fail('Expected Ok'),
    );
  });

  it('creates a valid complex email', () => {
    const result = CustomerEmail.create('user.name+tag@domain.co');
    expect(result.isOk()).toBe(true);
  });

  it('rejects an empty string', () => {
    const result = CustomerEmail.create('');
    expect(result.isErr()).toBe(true);
  });

  it('rejects null', () => {
    const result = CustomerEmail.create(null as unknown as string);
    expect(result.isErr()).toBe(true);
  });

  it('rejects undefined', () => {
    const result = CustomerEmail.create(undefined as unknown as string);
    expect(result.isErr()).toBe(true);
  });

  it('rejects a whitespace-only string', () => {
    const result = CustomerEmail.create('   ');
    expect(result.isErr()).toBe(true);
  });

  it('rejects an email without @', () => {
    const result = CustomerEmail.create('userexample.com');
    expect(result.isErr()).toBe(true);
  });

  it('rejects an email without domain', () => {
    const result = CustomerEmail.create('user@');
    expect(result.isErr()).toBe(true);
  });

  it('rejects an email without TLD', () => {
    const result = CustomerEmail.create('user@domain');
    expect(result.isErr()).toBe(true);
  });

  it('returns InvalidCustomerEmailError on rejection', () => {
    const result = CustomerEmail.create('invalid');
    result.match(
      () => fail('Expected Err'),
      (error) => expect(error).toBeInstanceOf(InvalidCustomerEmailError),
    );
  });
});

function fail(message: string): never {
  throw new Error(message);
}
