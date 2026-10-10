import { Entity } from '@application/domain/shared/entity';
import { Result } from '@application/domain/shared/result';
import { DomainError } from '@application/domain/shared/domain-error';
import { DeliveryStatus } from './delivery-status.vo';

export interface DeliveryProps {
  id: string;
  transactionId: string;
  status: string;
  carrier: string | null;
  trackingNumber: string | null;
}

export class Delivery extends Entity<string> {
  constructor(
    id: string,
    readonly transactionId: string,
    readonly status: DeliveryStatus,
    readonly carrier: string | null,
    readonly trackingNumber: string | null,
  ) {
    super(id);
  }

  static create(props: DeliveryProps): Result<Delivery, DomainError> {
    return DeliveryStatus.create(props.status).map(
      (status) =>
        new Delivery(
          props.id,
          props.transactionId,
          status,
          props.carrier,
          props.trackingNumber,
        ),
    );
  }
}
