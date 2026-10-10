import { DomainError } from '@application/domain/shared/domain-error';
import {
  InvalidProductDescriptionError,
  InvalidProductPriceError,
  InvalidProductImageError,
  InvalidProductTitleError,
  InvalidStockError,
  ProductRepositoryError,
  ProductNotFoundError,
} from './product-errors';

describe('Product Errors', () => {
  const errors = [
    { Class: InvalidProductDescriptionError, code: 'INVALID_PRODUCT_DESCRIPTION', defaultMsg: 'Invalid product description' },
    { Class: InvalidProductPriceError, code: 'INVALID_PRODUCT_PRICE', defaultMsg: 'Invalid product price' },
    { Class: InvalidProductImageError, code: 'INVALID_PRODUCT_IMAGE', defaultMsg: 'Invalid product image' },
    { Class: InvalidProductTitleError, code: 'INVALID_PRODUCT_TITLE', defaultMsg: 'Invalid product title' },
    { Class: InvalidStockError, code: 'INVALID_STOCK', defaultMsg: 'Invalid stock' },
    { Class: ProductRepositoryError, code: 'PRODUCT_REPOSITORY_ERROR', defaultMsg: 'Product repository error' },
    { Class: ProductNotFoundError, code: 'PRODUCT_NOT_FOUND', defaultMsg: 'Product not found' },
  ];

  errors.forEach(({ Class, code, defaultMsg }) => {
    describe(Class.name, () => {
      it('has correct code and default message', () => {
        const error = new Class();
        expect(error.code).toBe(code);
        expect(error.message).toBe(defaultMsg);
        expect(error).toBeInstanceOf(DomainError);
      });

      it('accepts a custom message', () => {
        const error = new Class('custom message');
        expect(error.message).toBe('custom message');
      });
    });
  });
});
