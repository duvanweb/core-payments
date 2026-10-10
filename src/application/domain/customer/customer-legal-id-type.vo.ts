import { ValueObject } from '@application/domain/shared/value-object';
import { Result, ok, err } from '@application/domain/shared/result';
import { InvalidCustomerLegalIdTypeError } from './customer-errors';

const ALLOWED_TYPES = ['CC', 'CE', 'NIT', 'PP', 'TI', 'DNI', 'RG', 'OTHER'] as const;
export type LegalIdType = (typeof ALLOWED_TYPES)[number];

export class CustomerLegalIdType extends ValueObject<LegalIdType> {
  get value(): LegalIdType {
    return this.props;
  }

  static create(value: string): Result<CustomerLegalIdType, InvalidCustomerLegalIdTypeError> {
    if (!ALLOWED_TYPES.includes(value as LegalIdType)) {
      return err(
        new InvalidCustomerLegalIdTypeError(
          `Customer legal id type must be one of: ${ALLOWED_TYPES.join(', ')}`,
        ),
      );
    }
    return ok(new CustomerLegalIdType(value as LegalIdType));
  }
}
