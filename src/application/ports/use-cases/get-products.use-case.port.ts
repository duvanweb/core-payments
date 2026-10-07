import { UseCase } from './use-case.port';
import { Product } from '@application/domain/product/product';
import { DomainError } from '@application/domain/shared/domain-error';

export const GET_PRODUCTS_USE_CASE = Symbol('GET_PRODUCTS_USE_CASE');

export interface GetProductsUseCasePort extends UseCase<void, Product[], DomainError> {}
