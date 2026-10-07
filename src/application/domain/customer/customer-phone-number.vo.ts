import { ValueObject } from '@application/domain/shared/value-object';
import { Result, ok, err } from '@application/domain/shared/result';
import { InvalidCustomerPhoneNumberError } from './customer-errors';

export class CustomerPhoneNumber extends ValueObject<string> {
  get value(): string {
    return this.props;
  }

  static create(value: string): Result<CustomerPhoneNumber, InvalidCustomerPhoneNumberError> {
    if (value === null || value === undefined || value.trim().length === 0) {
      return err(new InvalidCustomerPhoneNumberError('Customer phone number must not be empty'));
    }
    return ok(new CustomerPhoneNumber(value));
  }
}
