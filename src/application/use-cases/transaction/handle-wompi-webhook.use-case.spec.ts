import { HandleWompiWebhookUseCase } from './handle-wompi-webhook.use-case';
import { TransactionRepositoryPort } from '@application/ports/repositories/transaction.repository.port';
import { Transaction } from '@application/domain/transaction/transaction';
import { ResultAsync, okAsync, errAsync } from '@application/domain/shared/result';
import { DomainError } from '@application/domain/shared/domain-error';
import { TransactionRepositoryError } from '@application/domain/transaction/transaction-errors';

class FakeTransactionRepository implements TransactionRepositoryPort {
  constructor(
    private readonly shouldFail: boolean = false,
  ) {}
  save(_transaction: Transaction): ResultAsync<Transaction, DomainError> {
    return okAsync(_transaction);
  }
  findById(_id: string): ResultAsync<Transaction | null, DomainError> {
    return okAsync(null);
  }
  findByReference(_reference: string): ResultAsync<Transaction | null, DomainError> {
    return okAsync(null);
  }
  completeTransaction(_reference: string, _status: string, _wompiTransactionId: string): ResultAsync<Transaction, DomainError> {
    if (this.shouldFail) return errAsync(new TransactionRepositoryError('DB unavailable'));
    return okAsync({} as Transaction);
  }
}

describe('HandleWompiWebhookUseCase', () => {
  it('returns Ok when transaction is updated successfully', async () => {
    const txRepo = new FakeTransactionRepository();
    const useCase = new HandleWompiWebhookUseCase(txRepo);

    const result = await useCase.execute({
      reference: 'ref-001',
      status: 'APPROVED',
      wompiTransactionId: 'wompi-tx-001',
    });

    expect(result.isOk()).toBe(true);
  });

  it('returns Err when repository fails', async () => {
    const txRepo = new FakeTransactionRepository(true);
    const useCase = new HandleWompiWebhookUseCase(txRepo);

    const result = await useCase.execute({
      reference: 'ref-001',
      status: 'APPROVED',
      wompiTransactionId: 'wompi-tx-001',
    });

    expect(result.isErr()).toBe(true);
  });
});
