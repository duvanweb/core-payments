import { Delivery } from '@application/domain/delivery/delivery';
import { DomainError } from '@application/domain/shared/domain-error';
import { ResultAsync } from '@application/domain/shared/result';

export const DELIVERY_REPOSITORY = Symbol('DELIVERY_REPOSITORY');

export interface DeliveryRepositoryPort {
  save(delivery: Delivery): ResultAsync<Delivery, DomainError>;
  findById(id: string): ResultAsync<Delivery | null, DomainError>;
  findByTransactionId(transactionId: string): ResultAsync<Delivery | null, DomainError>;
  updateStatus(
    id: string,
    status: string,
    carrier?: string,
    trackingNumber?: string,
  ): ResultAsync<Delivery, DomainError>;
}
