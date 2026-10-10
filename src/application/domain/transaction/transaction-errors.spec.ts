import { DomainError } from '@application/domain/shared/domain-error';
import {
  TransactionRepositoryError,
  TransactionNotFoundError,
  InvalidTransactionStatusError,
  InsufficientStockError,
  WompiApiError,
  InvalidWebhookSignatureError,
  InvalidShippingAddressError,
  PriceMismatchError,
  InvalidProductSnapshotError,
  InvalidCustomerSnapshotError,
} from './transaction-errors';

describe('Transaction Errors', () => {
  const errors = [
    { Class: TransactionRepositoryError, code: 'TRANSACTION_REPOSITORY_ERROR', defaultMsg: 'Transaction repository error' },
    { Class: TransactionNotFoundError, code: 'TRANSACTION_NOT_FOUND', defaultMsg: 'Transaction not found' },
    { Class: InvalidTransactionStatusError, code: 'INVALID_TRANSACTION_STATUS', defaultMsg: 'Invalid transaction status' },
    { Class: InsufficientStockError, code: 'INSUFFICIENT_STOCK', defaultMsg: 'Insufficient stock' },
    { Class: WompiApiError, code: 'WOMPI_API_ERROR', defaultMsg: 'Wompi API error' },
    { Class: InvalidWebhookSignatureError, code: 'INVALID_WEBHOOK_SIGNATURE', defaultMsg: 'Invalid webhook signature' },
    { Class: InvalidShippingAddressError, code: 'INVALID_SHIPPING_ADDRESS', defaultMsg: 'Invalid shipping address' },
    { Class: PriceMismatchError, code: 'PRICE_MISMATCH', defaultMsg: 'Price mismatch' },
    { Class: InvalidProductSnapshotError, code: 'INVALID_PRODUCT_SNAPSHOT', defaultMsg: 'Invalid product snapshot' },
    { Class: InvalidCustomerSnapshotError, code: 'INVALID_CUSTOMER_SNAPSHOT', defaultMsg: 'Invalid customer snapshot' },
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
