import { CustomerLegalIdType } from './customer-legal-id-type.vo';
import { InvalidCustomerLegalIdTypeError } from './customer-errors';

describe('CustomerLegalIdType', () => {
  const validTypes = ['CC', 'CE', 'NIT', 'PP', 'TI', 'DNI', 'RG', 'OTHER'];

  validTypes.forEach((type) => {
    it(`creates a valid type: ${type}`, () => {
      const result = CustomerLegalIdType.create(type);
      expect(result.isOk()).toBe(true);
      result.match(
        (vo) => expect(vo.value).toBe(type),
        () => fail('Expected Ok'),
      );
    });
  });

  it('rejects an invalid type string', () => {
    const result = CustomerLegalIdType.create('INVALID');
    expect(result.isErr()).toBe(true);
  });

  it('rejects an empty string', () => {
    const result = CustomerLegalIdType.create('');
    expect(result.isErr()).toBe(true);
  });

  it('rejects lowercase variants (case-sensitive)', () => {
    const result = CustomerLegalIdType.create('cc');
    expect(result.isErr()).toBe(true);
  });

  it('returns InvalidCustomerLegalIdTypeError on rejection', () => {
    const result = CustomerLegalIdType.create('INVALID');
    result.match(
      () => fail('Expected Err'),
      (error) => expect(error).toBeInstanceOf(InvalidCustomerLegalIdTypeError),
    );
  });
});

function fail(message: string): never {
  throw new Error(message);
}
