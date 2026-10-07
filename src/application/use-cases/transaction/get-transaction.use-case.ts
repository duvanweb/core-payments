import { Result, ok, err } from '@application/domain/shared/result';
import { DomainError } from '@application/domain/shared/domain-error';
import { Transaction } from '@application/domain/transaction/transaction';
import { TransactionNotFoundError } from '@application/domain/transaction/transaction-errors';
import { TransactionRepositoryPort } from '@application/ports/repositories/transaction.repository.port';
import { GetTransactionUseCasePort } from '@application/ports/use-cases/get-transaction.use-case.port';

export class GetTransactionUseCase implements GetTransactionUseCasePort {
  constructor(private readonly transactionRepository: TransactionRepositoryPort) {}

  execute(id: string): ReturnType<GetTransactionUseCasePort['execute']> {
    return this.transactionRepository.findById(id).andThen(
      (transaction): Result<Transaction, DomainError> => {
        if (transaction === null) {
          return err(new TransactionNotFoundError(`Transaction with id ${id} not found`));
        }
        return ok(transaction);
      },
    );
  }
}
