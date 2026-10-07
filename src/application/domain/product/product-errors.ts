import { DomainError } from '@application/domain/shared/domain-error';

export class InvalidProductDescriptionError extends DomainError {
  constructor(message: string = 'Invalid product description') {
    super('INVALID_PRODUCT_DESCRIPTION', message);
  }
}

export class InvalidProductPriceError extends DomainError {
  constructor(message: string = 'Invalid product price') {
    super('INVALID_PRODUCT_PRICE', message);
  }
}

export class InvalidProductImageUrlError extends DomainError {
  constructor(message: string = 'Invalid product image URL') {
    super('INVALID_PRODUCT_IMAGE_URL', message);
  }
}

export class InvalidStockError extends DomainError {
  constructor(message: string = 'Invalid stock') {
    super('INVALID_STOCK', message);
  }
}

export class ProductRepositoryError extends DomainError {
  constructor(message: string = 'Product repository error') {
    super('PRODUCT_REPOSITORY_ERROR', message);
  }
}
