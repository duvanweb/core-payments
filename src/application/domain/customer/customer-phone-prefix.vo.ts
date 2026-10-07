import { ValueObject } from '@application/domain/shared/value-object';
import { Result, ok, err } from '@application/domain/shared/result';
import { InvalidCustomerPhonePrefixError } from './customer-errors';

const PREFIX_REGEX = /^\+\d{1,4}$/;

export class CustomerPhonePrefix extends ValueObject<string> {
  get value(): string {
    return this.props;
  }

  static create(value: string): Result<CustomerPhonePrefix, InvalidCustomerPhonePrefixError> {
    if (value === null || value === undefined || value.trim().length === 0) {
      return err(new InvalidCustomerPhonePrefixError('Customer phone prefix must not be empty'));
    }
    if (!PREFIX_REGEX.test(value)) {
      return err(
        new InvalidCustomerPhonePrefixError(
          'Customer phone prefix must start with + followed by 1 to 4 digits (e.g. +57)',
        ),
      );
    }
    return ok(new CustomerPhonePrefix(value));
  }
}
