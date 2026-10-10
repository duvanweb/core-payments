import { ValueObject } from '@application/domain/shared/value-object';
import { Result, ok, err } from '@application/domain/shared/result';
import { InvalidDeliveryStatusError } from './delivery-errors';

const ALLOWED_STATUSES = ['PENDING', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED'] as const;
export type DeliveryStatusValue = (typeof ALLOWED_STATUSES)[number];

const VALID_TRANSITIONS: Record<DeliveryStatusValue, DeliveryStatusValue[]> = {
  PENDING: ['IN_TRANSIT', 'CANCELLED'],
  IN_TRANSIT: ['DELIVERED', 'CANCELLED'],
  DELIVERED: [],
  CANCELLED: [],
};

export class DeliveryStatus extends ValueObject<DeliveryStatusValue> {
  get value(): DeliveryStatusValue {
    return this.props;
  }

  static create(value: string): Result<DeliveryStatus, InvalidDeliveryStatusError> {
    if (!ALLOWED_STATUSES.includes(value as DeliveryStatusValue)) {
      return err(
        new InvalidDeliveryStatusError(
          `Delivery status must be one of: ${ALLOWED_STATUSES.join(', ')}`,
        ),
      );
    }
    return ok(new DeliveryStatus(value as DeliveryStatusValue));
  }

  static pending(): DeliveryStatus {
    return new DeliveryStatus('PENDING');
  }

  canTransitionTo(next: DeliveryStatusValue): boolean {
    return VALID_TRANSITIONS[this.props].includes(next);
  }
}
