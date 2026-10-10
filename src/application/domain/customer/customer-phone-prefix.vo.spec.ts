import { CustomerPhonePrefix } from './customer-phone-prefix.vo';
import { InvalidCustomerPhonePrefixError } from './customer-errors';

describe('CustomerPhonePrefix', () => {
  it('creates a valid prefix +57', () => {
    const result = CustomerPhonePrefix.create('+57');
    expect(result.isOk()).toBe(true);
    result.match(
      (vo) => expect(vo.value).toBe('+57'),
      () => fail('Expected Ok'),
    );
  });

  it('creates a valid prefix +1 (minimum digits)', () => {
    const result = CustomerPhonePrefix.create('+1');
    expect(result.isOk()).toBe(true);
  });

  it('creates a valid prefix +1234 (maximum 4 digits)', () => {
    const result = CustomerPhonePrefix.create('+1234');
    expect(result.isOk()).toBe(true);
  });

  it('rejects a prefix without +', () => {
    const result = CustomerPhonePrefix.create('57');
    expect(result.isErr()).toBe(true);
  });

  it('rejects a prefix with more than 4 digits', () => {
    const result = CustomerPhonePrefix.create('+12345');
    expect(result.isErr()).toBe(true);
  });

  it('rejects a prefix with no digits after +', () => {
    const result = CustomerPhonePrefix.create('+');
    expect(result.isErr()).toBe(true);
  });

  it('rejects null', () => {
    const result = CustomerPhonePrefix.create(null as unknown as string);
    expect(result.isErr()).toBe(true);
  });

  it('rejects undefined', () => {
    const result = CustomerPhonePrefix.create(undefined as unknown as string);
    expect(result.isErr()).toBe(true);
  });

  it('rejects an empty string', () => {
    const result = CustomerPhonePrefix.create('');
    expect(result.isErr()).toBe(true);
  });

  it('rejects letters after +', () => {
    const result = CustomerPhonePrefix.create('+ab');
    expect(result.isErr()).toBe(true);
  });

  it('returns InvalidCustomerPhonePrefixError on rejection', () => {
    const result = CustomerPhonePrefix.create('invalid');
    result.match(
      () => fail('Expected Err'),
      (error) => expect(error).toBeInstanceOf(InvalidCustomerPhonePrefixError),
    );
  });
});

function fail(message: string): never {
  throw new Error(message);
}
