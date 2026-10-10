import { DomainError } from '@application/domain/shared/domain-error';

export class TransactionRepositoryError extends DomainError {
  constructor(message: string = 'Transaction repository error') {
    super('TRANSACTION_REPOSITORY_ERROR', message);
  }
}

export class TransactionNotFoundError extends DomainError {
  constructor(message: string = 'Transaction not found') {
    super('TRANSACTION_NOT_FOUND', message);
  }
}

export class InvalidTransactionStatusError extends DomainError {
  constructor(message: string = 'Invalid transaction status') {
    super('INVALID_TRANSACTION_STATUS', message);
  }
}

export class InsufficientStockError extends DomainError {
  constructor(message: string = 'Insufficient stock') {
    super('INSUFFICIENT_STOCK', message);
  }
}

export class WompiApiError extends DomainError {
  constructor(message: string = 'Wompi API error') {
    super('WOMPI_API_ERROR', message);
  }
}

export class InvalidWebhookSignatureError extends DomainError {
  constructor(message: string = 'Invalid webhook signature') {
    super('INVALID_WEBHOOK_SIGNATURE', message);
  }
}

export class InvalidShippingAddressError extends DomainError {
  constructor(message: string = 'Invalid shipping address') {
    super('INVALID_SHIPPING_ADDRESS', message);
  }
}

export class PriceMismatchError extends DomainError {
  constructor(message: string = 'Price mismatch') {
    super('PRICE_MISMATCH', message);
  }
}

export class InvalidProductSnapshotError extends DomainError {
  constructor(message: string = 'Invalid product snapshot') {
    super('INVALID_PRODUCT_SNAPSHOT', message);
  }
}

export class InvalidCustomerSnapshotError extends DomainError {
  constructor(message: string = 'Invalid customer snapshot') {
    super('INVALID_CUSTOMER_SNAPSHOT', message);
  }
}
