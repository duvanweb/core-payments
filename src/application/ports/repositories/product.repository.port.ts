import { Product } from '@application/domain/product/product';
import { DomainError } from '@application/domain/shared/domain-error';
import { ResultAsync } from '@application/domain/shared/result';

export const PRODUCT_REPOSITORY = Symbol('PRODUCT_REPOSITORY');

export interface ProductRepositoryPort {
  findAll(): ResultAsync<Product[], DomainError>;
  findById(id: string): ResultAsync<Product | null, DomainError>;
}
