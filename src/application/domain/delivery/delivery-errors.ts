import { DomainError } from '@application/domain/shared/domain-error';

export class DeliveryRepositoryError extends DomainError {
  constructor(message: string = 'Delivery repository error') {
    super('DELIVERY_REPOSITORY_ERROR', message);
  }
}

export class DeliveryNotFoundError extends DomainError {
  constructor(message: string = 'Delivery not found') {
    super('DELIVERY_NOT_FOUND', message);
  }
}

export class InvalidDeliveryStatusError extends DomainError {
  constructor(message: string = 'Invalid delivery status') {
    super('INVALID_DELIVERY_STATUS', message);
  }
}

export class DeliveryAlreadyExistsError extends DomainError {
  constructor(message: string = 'Delivery already exists for this transaction') {
    super('DELIVERY_ALREADY_EXISTS', message);
  }
}
