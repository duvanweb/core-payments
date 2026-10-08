import { ValueObject } from '@application/domain/shared/value-object';
import { Result, ok, err } from '@application/domain/shared/result';
import { InvalidTransactionStatusError } from './transaction-errors';

export class AmountInCents extends ValueObject<number> {
  get value(): number {
    return this.props;
  }

  static create(value: number): Result<AmountInCents, InvalidTransactionStatusError> {
    if (typeof value !== 'number' || !Number.isInteger(value)) {
      return err(new InvalidTransactionStatusError('Amount in cents must be an integer'));
    }
    if (value <= 0) {
      return err(new InvalidTransactionStatusError('Amount in cents must be greater than 0'));
    }
    return ok(new AmountInCents(value));
  }
}
