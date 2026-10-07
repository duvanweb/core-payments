import { ValueObject } from '@application/domain/shared/value-object';
import { Result, ok, err } from '@application/domain/shared/result';
import { InvalidCustomerLegalIdError } from './customer-errors';

export class CustomerLegalId extends ValueObject<string> {
  get value(): string {
    return this.props;
  }

  static create(value: string | null | undefined): Result<CustomerLegalId, InvalidCustomerLegalIdError> {
    if (value === null || value === undefined || value.trim().length === 0) {
      return err(new InvalidCustomerLegalIdError('Customer legal id must not be empty'));
    }
    return ok(new CustomerLegalId(value));
  }
}
