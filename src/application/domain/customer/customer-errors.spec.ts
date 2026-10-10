import { DomainError } from '@application/domain/shared/domain-error';
import {
  InvalidCustomerEmailError,
  InvalidCustomerFullNameError,
  InvalidCustomerPhoneNumberError,
  InvalidCustomerPhonePrefixError,
  InvalidCustomerLegalIdError,
  InvalidCustomerLegalIdTypeError,
  CustomerRepositoryError,
} from './customer-errors';

describe('Customer Errors', () => {
  describe('InvalidCustomerEmailError', () => {
    it('has correct code and default message', () => {
      const error = new InvalidCustomerEmailError();
      expect(error.code).toBe('INVALID_CUSTOMER_EMAIL');
      expect(error.message).toBe('Invalid customer email');
      expect(error).toBeInstanceOf(DomainError);
    });

    it('accepts a custom message', () => {
      const error = new InvalidCustomerEmailError('custom');
      expect(error.message).toBe('custom');
    });
  });

  describe('InvalidCustomerFullNameError', () => {
    it('has correct code and default message', () => {
      const error = new InvalidCustomerFullNameError();
      expect(error.code).toBe('INVALID_CUSTOMER_FULL_NAME');
      expect(error.message).toBe('Invalid customer full name');
      expect(error).toBeInstanceOf(DomainError);
    });

    it('accepts a custom message', () => {
      const error = new InvalidCustomerFullNameError('custom');
      expect(error.message).toBe('custom');
    });
  });

  describe('InvalidCustomerPhoneNumberError', () => {
    it('has correct code and default message', () => {
      const error = new InvalidCustomerPhoneNumberError();
      expect(error.code).toBe('INVALID_CUSTOMER_PHONE_NUMBER');
      expect(error.message).toBe('Invalid customer phone number');
      expect(error).toBeInstanceOf(DomainError);
    });
  });

  describe('InvalidCustomerPhonePrefixError', () => {
    it('has correct code and default message', () => {
      const error = new InvalidCustomerPhonePrefixError();
      expect(error.code).toBe('INVALID_CUSTOMER_PHONE_PREFIX');
      expect(error.message).toBe('Invalid customer phone prefix');
      expect(error).toBeInstanceOf(DomainError);
    });
  });

  describe('InvalidCustomerLegalIdError', () => {
    it('has correct code and default message', () => {
      const error = new InvalidCustomerLegalIdError();
      expect(error.code).toBe('INVALID_CUSTOMER_LEGAL_ID');
      expect(error.message).toBe('Invalid customer legal id');
      expect(error).toBeInstanceOf(DomainError);
    });
  });

  describe('InvalidCustomerLegalIdTypeError', () => {
    it('has correct code and default message', () => {
      const error = new InvalidCustomerLegalIdTypeError();
      expect(error.code).toBe('INVALID_CUSTOMER_LEGAL_ID_TYPE');
      expect(error.message).toBe('Invalid customer legal id type');
      expect(error).toBeInstanceOf(DomainError);
    });
  });

  describe('CustomerRepositoryError', () => {
    it('has correct code and default message', () => {
      const error = new CustomerRepositoryError();
      expect(error.code).toBe('CUSTOMER_REPOSITORY_ERROR');
      expect(error.message).toBe('Customer repository error');
      expect(error).toBeInstanceOf(DomainError);
    });
  });
});
