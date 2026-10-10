import { Customer } from '@application/domain/customer/customer';
import { DomainError } from '@application/domain/shared/domain-error';
import { ResultAsync } from '@application/domain/shared/result';

export const CUSTOMER_REPOSITORY = Symbol('CUSTOMER_REPOSITORY');

export interface CustomerRepositoryPort {
  save(customer: Customer): ResultAsync<Customer, DomainError>;
}
