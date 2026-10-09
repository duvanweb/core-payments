import { UseCase } from '@application/ports/use-cases/use-case.port';
import { Delivery } from '@application/domain/delivery/delivery';
import { DomainError } from '@application/domain/shared/domain-error';

export const GET_DELIVERY_USE_CASE = Symbol('GET_DELIVERY_USE_CASE');

export interface GetDeliveryInput {
  id?: string;
  transactionId?: string;
}

export interface GetDeliveryUseCasePort extends UseCase<GetDeliveryInput, Delivery, DomainError> {}
