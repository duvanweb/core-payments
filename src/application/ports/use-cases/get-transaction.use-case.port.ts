import { UseCase } from '@application/ports/use-cases/use-case.port';
import { Transaction } from '@application/domain/transaction/transaction';
import { DomainError } from '@application/domain/shared/domain-error';

export const GET_TRANSACTION_USE_CASE = Symbol('GET_TRANSACTION_USE_CASE');

export interface GetTransactionUseCasePort extends UseCase<string, Transaction, DomainError> {}
