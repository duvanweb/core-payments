import { ValueObject } from '@application/domain/shared/value-object';
import { Result, ok, err } from '@application/domain/shared/result';
import { InvalidCustomerEmailError } from './customer-errors';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class CustomerEmail extends ValueObject<string> {
  get value(): string {
    return this.props;
  }

  static create(value: string): Result<CustomerEmail, InvalidCustomerEmailError> {
    if (value === null || value === undefined || value.trim().length === 0) {
      return err(new InvalidCustomerEmailError('Customer email must not be empty'));
    }
    if (!EMAIL_REGEX.test(value)) {
      return err(new InvalidCustomerEmailError('Customer email must be a valid email address'));
    }
    return ok(new CustomerEmail(value));
  }
}
