import { CustomerPhoneNumber } from './customer-phone-number.vo';
import { InvalidCustomerPhoneNumberError } from './customer-errors';

describe('CustomerPhoneNumber', () => {
  it('creates a valid phone number', () => {
    const result = CustomerPhoneNumber.create('3001234567');
    expect(result.isOk()).toBe(true);
    result.match(
      (vo) => expect(vo.value).toBe('3001234567'),
      () => fail('Expected Ok'),
    );
  });

  it('rejects null', () => {
    const result = CustomerPhoneNumber.create(null as unknown as string);
    expect(result.isErr()).toBe(true);
  });

  it('rejects undefined', () => {
    const result = CustomerPhoneNumber.create(undefined as unknown as string);
    expect(result.isErr()).toBe(true);
  });

  it('rejects an empty string', () => {
    const result = CustomerPhoneNumber.create('');
    expect(result.isErr()).toBe(true);
  });

  it('rejects a whitespace-only string', () => {
    const result = CustomerPhoneNumber.create('   ');
    expect(result.isErr()).toBe(true);
  });

  it('returns InvalidCustomerPhoneNumberError on rejection', () => {
    const result = CustomerPhoneNumber.create('');
    result.match(
      () => fail('Expected Err'),
      (error) => expect(error).toBeInstanceOf(InvalidCustomerPhoneNumberError),
    );
  });
});

function fail(message: string): never {
  throw new Error(message);
}
