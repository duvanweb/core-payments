import { UseCase } from '@application/ports/use-cases/use-case.port';
import { Delivery } from '@application/domain/delivery/delivery';
import { DomainError } from '@application/domain/shared/domain-error';

export const UPDATE_DELIVERY_STATUS_USE_CASE = Symbol('UPDATE_DELIVERY_STATUS_USE_CASE');

export interface UpdateDeliveryStatusInput {
  id: string;
  status: string;
  carrier?: string;
  trackingNumber?: string;
}

export interface UpdateDeliveryStatusUseCasePort
  extends UseCase<UpdateDeliveryStatusInput, Delivery, DomainError> {}
