import { DomainError } from '@application/domain/shared/domain-error';
import {
  DeliveryRepositoryError,
  DeliveryNotFoundError,
  InvalidDeliveryStatusError,
  DeliveryAlreadyExistsError,
} from './delivery-errors';

describe('Delivery Errors', () => {
  describe('DeliveryRepositoryError', () => {
    it('has correct code and default message', () => {
      const error = new DeliveryRepositoryError();
      expect(error.code).toBe('DELIVERY_REPOSITORY_ERROR');
      expect(error.message).toBe('Delivery repository error');
      expect(error).toBeInstanceOf(DomainError);
    });

    it('accepts a custom message', () => {
      const error = new DeliveryRepositoryError('custom');
      expect(error.message).toBe('custom');
    });
  });

  describe('DeliveryNotFoundError', () => {
    it('has correct code and default message', () => {
      const error = new DeliveryNotFoundError();
      expect(error.code).toBe('DELIVERY_NOT_FOUND');
      expect(error.message).toBe('Delivery not found');
      expect(error).toBeInstanceOf(DomainError);
    });

    it('accepts a custom message', () => {
      const error = new DeliveryNotFoundError('custom');
      expect(error.message).toBe('custom');
    });
  });

  describe('InvalidDeliveryStatusError', () => {
    it('has correct code and default message', () => {
      const error = new InvalidDeliveryStatusError();
      expect(error.code).toBe('INVALID_DELIVERY_STATUS');
      expect(error.message).toBe('Invalid delivery status');
      expect(error).toBeInstanceOf(DomainError);
    });

    it('accepts a custom message', () => {
      const error = new InvalidDeliveryStatusError('custom');
      expect(error.message).toBe('custom');
    });
  });

  describe('DeliveryAlreadyExistsError', () => {
    it('has correct code and default message', () => {
      const error = new DeliveryAlreadyExistsError();
      expect(error.code).toBe('DELIVERY_ALREADY_EXISTS');
      expect(error.message).toBe('Delivery already exists for this transaction');
      expect(error).toBeInstanceOf(DomainError);
    });

    it('accepts a custom message', () => {
      const error = new DeliveryAlreadyExistsError('custom');
      expect(error.message).toBe('custom');
    });
  });
});
