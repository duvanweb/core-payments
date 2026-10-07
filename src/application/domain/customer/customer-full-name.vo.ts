import { ValueObject } from '@application/domain/shared/value-object';
import { Result, ok, err } from '@application/domain/shared/result';
import { InvalidCustomerFullNameError } from './customer-errors';

const MAX_LENGTH = 200;

export class CustomerFullName extends ValueObject<string> {
  get value(): string {
    return this.props;
  }

  static create(value: string): Result<CustomerFullName, InvalidCustomerFullNameError> {
    if (value === null || value === undefined || value.trim().length === 0) {
      return err(new InvalidCustomerFullNameError('Customer full name must not be empty'));
    }
    if (value.length > MAX_LENGTH) {
      return err(
        new InvalidCustomerFullNameError(
          `Customer full name must not exceed ${MAX_LENGTH} characters`,
        ),
      );
    }
    return ok(new CustomerFullName(value));
  }
}
