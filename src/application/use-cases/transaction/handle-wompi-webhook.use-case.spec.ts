import { HandleWompiWebhookUseCase } from './handle-wompi-webhook.use-case';
import { TransactionRepositoryPort } from '@application/ports/repositories/transaction.repository.port';
import { Transaction } from '@application/domain/transaction/transaction';
import { ResultAsync, okAsync, errAsync } from '@application/domain/shared/result';
import { DomainError } from '@application/domain/shared/domain-error';
import { TransactionRepositoryError } from '@application/domain/transaction/transaction-errors';
import { CreateDeliveryUseCasePort } from '@application/ports/use-cases/create-delivery.use-case.port';
import { Delivery } from '@application/domain/delivery/delivery';

class FakeTransactionRepository implements TransactionRepositoryPort {
  constructor(
    private readonly shouldFail: boolean = false,
    private readonly status: string = 'APPROVED',
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
    return okAsync({
      status: { value: this.status },
    } as unknown as Transaction);
  }
}

class FakeCreateDeliveryUseCase implements CreateDeliveryUseCasePort {
  wasCalled = false;
  execute(_input: { transactionId: string }): ResultAsync<Delivery, DomainError> {
    this.wasCalled = true;
    return okAsync({} as Delivery);
  }
}

describe('HandleWompiWebhookUseCase', () => {
  it('returns Ok when transaction is updated and delivery created on APPROVED', async () => {
    const txRepo = new FakeTransactionRepository(false, 'APPROVED');
    const createDelivery = new FakeCreateDeliveryUseCase();
    const useCase = new HandleWompiWebhookUseCase(txRepo, createDelivery);

    const result = await useCase.execute({
      reference: 'ref-001',
      status: 'APPROVED',
      wompiTransactionId: 'wompi-tx-001',
    });

    expect(result.isOk()).toBe(true);
    expect(createDelivery.wasCalled).toBe(true);
  });

  it('returns Ok when transaction is DECLINED and does not create delivery', async () => {
    const txRepo = new FakeTransactionRepository(false, 'DECLINED');
    const createDelivery = new FakeCreateDeliveryUseCase();
    const useCase = new HandleWompiWebhookUseCase(txRepo, createDelivery);

    const result = await useCase.execute({
      reference: 'ref-001',
      status: 'DECLINED',
      wompiTransactionId: 'wompi-tx-001',
    });

    expect(result.isOk()).toBe(true);
    expect(createDelivery.wasCalled).toBe(false);
  });

  it('returns Err when repository fails', async () => {
    const txRepo = new FakeTransactionRepository(true);
    const createDelivery = new FakeCreateDeliveryUseCase();
    const useCase = new HandleWompiWebhookUseCase(txRepo, createDelivery);

    const result = await useCase.execute({
      reference: 'ref-001',
      status: 'APPROVED',
      wompiTransactionId: 'wompi-tx-001',
    });

    expect(result.isErr()).toBe(true);
  });
});
