import { CustomerLegalId } from './customer-legal-id.vo';
import { InvalidCustomerLegalIdError } from './customer-errors';

describe('CustomerLegalId', () => {
  it('creates a valid legal id', () => {
    const result = CustomerLegalId.create('123456789');
    expect(result.isOk()).toBe(true);
    result.match(
      (vo) => expect(vo.value).toBe('123456789'),
      () => fail('Expected Ok'),
    );
  });

  it('rejects null', () => {
    const result = CustomerLegalId.create(null);
    expect(result.isErr()).toBe(true);
  });

  it('rejects undefined', () => {
    const result = CustomerLegalId.create(undefined);
    expect(result.isErr()).toBe(true);
  });

  it('rejects an empty string', () => {
    const result = CustomerLegalId.create('');
    expect(result.isErr()).toBe(true);
  });

  it('rejects a whitespace-only string', () => {
    const result = CustomerLegalId.create('   ');
    expect(result.isErr()).toBe(true);
  });

  it('returns InvalidCustomerLegalIdError on rejection', () => {
    const result = CustomerLegalId.create('');
    result.match(
      () => fail('Expected Err'),
      (error) => expect(error).toBeInstanceOf(InvalidCustomerLegalIdError),
    );
  });
});

function fail(message: string): never {
  throw new Error(message);
}
