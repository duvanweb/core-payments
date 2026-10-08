import { ValueObject } from '@application/domain/shared/value-object';
import { Result, ok, err } from '@application/domain/shared/result';
import { InvalidDeliveryStatusError } from './delivery-errors';

export class TrackingNumber extends ValueObject<string> {
  get value(): string {
    return this.props;
  }

  static create(value: string): Result<TrackingNumber, InvalidDeliveryStatusError> {
    if (typeof value !== 'string' || value.trim().length === 0) {
      return err(new InvalidDeliveryStatusError('Tracking number must be a non-empty string'));
    }
    return ok(new TrackingNumber(value.trim()));
  }
}
