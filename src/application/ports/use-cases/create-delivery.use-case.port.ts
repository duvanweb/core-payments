import { UseCase } from '@application/ports/use-cases/use-case.port';
import { Delivery } from '@application/domain/delivery/delivery';
import { DomainError } from '@application/domain/shared/domain-error';

export const CREATE_DELIVERY_USE_CASE = Symbol('CREATE_DELIVERY_USE_CASE');

export interface CreateDeliveryInput {
  transactionId: string;
}

export interface CreateDeliveryUseCasePort extends UseCase<CreateDeliveryInput, Delivery, DomainError> {}
