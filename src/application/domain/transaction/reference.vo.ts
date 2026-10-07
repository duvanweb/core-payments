import { ValueObject } from '@application/domain/shared/value-object';
import { Result, ok, err } from '@application/domain/shared/result';
import { InvalidTransactionStatusError } from './transaction-errors';

export class Reference extends ValueObject<string> {
  get value(): string {
    return this.props;
  }

  static create(value: string): Result<Reference, InvalidTransactionStatusError> {
    if (value === null || value === undefined || value.trim().length === 0) {
      return err(new InvalidTransactionStatusError('Reference must not be empty'));
    }
    return ok(new Reference(value));
  }
}
