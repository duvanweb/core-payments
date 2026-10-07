import { UseCase } from './use-case.port';
import { Product } from '@application/domain/product/product';
import { DomainError } from '@application/domain/shared/domain-error';

export const GET_PRODUCT_BY_ID_USE_CASE = Symbol('GET_PRODUCT_BY_ID_USE_CASE');

export interface GetProductByIdUseCasePort extends UseCase<string, Product, DomainError> {}
