import { ValueObject } from '@application/domain/shared/value-object';
import { Result, ok, err } from '@application/domain/shared/result';
import { InvalidDeliveryStatusError } from './delivery-errors';

export class Carrier extends ValueObject<string> {
  get value(): string {
    return this.props;
  }

  static create(value: string): Result<Carrier, InvalidDeliveryStatusError> {
    if (typeof value !== 'string' || value.trim().length === 0) {
      return err(new InvalidDeliveryStatusError('Carrier must be a non-empty string'));
    }
    return ok(new Carrier(value.trim()));
  }
}
