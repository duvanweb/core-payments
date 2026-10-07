import { ValueObject } from '@application/domain/shared/value-object';
import { Result, ok, err } from '@application/domain/shared/result';
import { InvalidTransactionStatusError } from './transaction-errors';

export class Quantity extends ValueObject<number> {
  get value(): number {
    return this.props;
  }

  static create(value: number): Result<Quantity, InvalidTransactionStatusError> {
    if (typeof value !== 'number' || !Number.isInteger(value)) {
      return err(new InvalidTransactionStatusError('Quantity must be an integer'));
    }
    if (value < 1) {
      return err(new InvalidTransactionStatusError('Quantity must be at least 1'));
    }
    return ok(new Quantity(value));
  }
}
