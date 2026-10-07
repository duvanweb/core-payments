import { Transaction } from '@application/domain/transaction/transaction';
import { DomainError } from '@application/domain/shared/domain-error';
import { ResultAsync } from '@application/domain/shared/result';

export const TRANSACTION_REPOSITORY = Symbol('TRANSACTION_REPOSITORY');

export interface TransactionRepositoryPort {
  save(transaction: Transaction): ResultAsync<Transaction, DomainError>;
  findById(id: string): ResultAsync<Transaction | null, DomainError>;
  findByReference(reference: string): ResultAsync<Transaction | null, DomainError>;
  completeTransaction(
    reference: string,
    status: string,
    wompiTransactionId: string,
  ): ResultAsync<Transaction, DomainError>;
}
