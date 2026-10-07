import { DomainError } from '@application/domain/shared/domain-error';

export class InvalidCustomerEmailError extends DomainError {
  constructor(message: string = 'Invalid customer email') {
    super('INVALID_CUSTOMER_EMAIL', message);
  }
}

export class InvalidCustomerFullNameError extends DomainError {
  constructor(message: string = 'Invalid customer full name') {
    super('INVALID_CUSTOMER_FULL_NAME', message);
  }
}

export class InvalidCustomerPhoneNumberError extends DomainError {
  constructor(message: string = 'Invalid customer phone number') {
    super('INVALID_CUSTOMER_PHONE_NUMBER', message);
  }
}

export class InvalidCustomerPhonePrefixError extends DomainError {
  constructor(message: string = 'Invalid customer phone prefix') {
    super('INVALID_CUSTOMER_PHONE_PREFIX', message);
  }
}

export class InvalidCustomerLegalIdError extends DomainError {
  constructor(message: string = 'Invalid customer legal id') {
    super('INVALID_CUSTOMER_LEGAL_ID', message);
  }
}

export class InvalidCustomerLegalIdTypeError extends DomainError {
  constructor(message: string = 'Invalid customer legal id type') {
    super('INVALID_CUSTOMER_LEGAL_ID_TYPE', message);
  }
}

export class CustomerRepositoryError extends DomainError {
  constructor(message: string = 'Customer repository error') {
    super('CUSTOMER_REPOSITORY_ERROR', message);
  }
}
