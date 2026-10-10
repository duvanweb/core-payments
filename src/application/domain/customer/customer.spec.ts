import { Customer } from './customer';
import { InvalidCustomerEmailError } from './customer-errors';

describe('Customer', () => {
  const validProps = {
    id: 'customer-1',
    email: 'user@example.com',
    fullName: 'John Doe',
    phoneNumber: '3001234567',
    phoneNumberPrefix: '+57',
  };

  it('creates a valid customer without optional legalId/legalIdType', () => {
    const result = Customer.create(validProps);
    expect(result.isOk()).toBe(true);
    result.match(
      (customer) => {
        expect(customer.id).toBe('customer-1');
        expect(customer.email.value).toBe('user@example.com');
        expect(customer.fullName.value).toBe('John Doe');
        expect(customer.phoneNumber.value).toBe('3001234567');
        expect(customer.phoneNumberPrefix.value).toBe('+57');
        expect(customer.legalId).toBeNull();
        expect(customer.legalIdType).toBeNull();
      },
      () => fail('Expected Ok'),
    );
  });

  it('creates a valid customer with optional legalId and legalIdType', () => {
    const result = Customer.create({
      ...validProps,
      legalId: '123456789',
      legalIdType: 'CC',
    });
    expect(result.isOk()).toBe(true);
    result.match(
      (customer) => {
        expect(customer.legalId!.value).toBe('123456789');
        expect(customer.legalIdType!.value).toBe('CC');
      },
      () => fail('Expected Ok'),
    );
  });

  it('rejects an invalid email', () => {
    const result = Customer.create({ ...validProps, email: 'invalid' });
    expect(result.isErr()).toBe(true);
    result.match(
      () => fail('Expected Err'),
      (error) => expect(error).toBeInstanceOf(InvalidCustomerEmailError),
    );
  });

  it('rejects an invalid fullName', () => {
    const result = Customer.create({ ...validProps, fullName: '' });
    expect(result.isErr()).toBe(true);
  });

  it('rejects an invalid phoneNumber', () => {
    const result = Customer.create({ ...validProps, phoneNumber: '' });
    expect(result.isErr()).toBe(true);
  });

  it('rejects an invalid phoneNumberPrefix', () => {
    const result = Customer.create({ ...validProps, phoneNumberPrefix: '57' });
    expect(result.isErr()).toBe(true);
  });

  it('rejects an invalid legalId when provided', () => {
    const result = Customer.create({ ...validProps, legalId: '   ' });
    expect(result.isErr()).toBe(true);
  });

  it('rejects an invalid legalIdType when provided', () => {
    const result = Customer.create({ ...validProps, legalIdType: 'INVALID' });
    expect(result.isErr()).toBe(true);
  });
});

function fail(message: string): never {
  throw new Error(message);
}
