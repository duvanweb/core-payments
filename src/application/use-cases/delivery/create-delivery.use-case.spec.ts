import { CreateDeliveryUseCase } from './create-delivery.use-case';
import { TransactionRepositoryPort } from '@application/ports/repositories/transaction.repository.port';
import { DeliveryRepositoryPort } from '@application/ports/repositories/delivery.repository.port';
import { Transaction } from '@application/domain/transaction/transaction';
import { Delivery } from '@application/domain/delivery/delivery';
import { ResultAsync, okAsync } from '@application/domain/shared/result';
import { DomainError } from '@application/domain/shared/domain-error';
import { TransactionNotFoundError } from '@application/domain/transaction/transaction-errors';
import {
  InvalidDeliveryStatusError,
  DeliveryAlreadyExistsError,
} from '@application/domain/delivery/delivery-errors';

class FakeTransactionRepository implements TransactionRepositoryPort {
  constructor(
    private readonly transaction: Transaction | null,
    private readonly status: string = 'APPROVED',
  ) {}
  save(_tx: Transaction): ResultAsync<Transaction, DomainError> { return okAsync(_tx); }
  findById(id: string): ResultAsync<Transaction | null, DomainError> {
    return okAsync(this.transaction && this.transaction.id === id ? this.transaction : null);
  }
  findByReference(_r: string): ResultAsync<Transaction | null, DomainError> { return okAsync(null); }
  completeTransaction(_r: string, _s: string, _w: string): ResultAsync<Transaction, DomainError> {
    return okAsync(this.transaction!);
  }
}

class FakeDeliveryRepository implements DeliveryRepositoryPort {
  existingDelivery: Delivery | null = null;
  savedDelivery: Delivery | null = null;
  save(delivery: Delivery): ResultAsync<Delivery, DomainError> {
    this.savedDelivery = delivery;
    return okAsync(delivery);
  }
  findById(_id: string): ResultAsync<Delivery | null, DomainError> { return okAsync(null); }
  findByTransactionId(_tid: string): ResultAsync<Delivery | null, DomainError> {
    return okAsync(this.existingDelivery);
  }
  updateStatus(_id: string, _s: string, _c?: string, _t?: string): ResultAsync<Delivery, DomainError> {
    return okAsync(this.savedDelivery!);
  }
}

function makeTransaction(status: string = 'APPROVED'): Transaction {
  return {
    id: 'tx-001',
    status: { value: status },
  } as unknown as Transaction;
}

describe('CreateDeliveryUseCase', () => {
  it('returns Ok with delivery when transaction is APPROVED and no existing delivery', async () => {
    const tx = makeTransaction('APPROVED');
    const txRepo = new FakeTransactionRepository(tx);
    const deliveryRepo = new FakeDeliveryRepository();
    const useCase = new CreateDeliveryUseCase(txRepo, deliveryRepo);

    const result = await useCase.execute({ transactionId: 'tx-001' });

    expect(result.isOk()).toBe(true);
    expect(deliveryRepo.savedDelivery).not.toBeNull();
  });

  it('returns Err with TransactionNotFoundError when transaction not found', async () => {
    const txRepo = new FakeTransactionRepository(null);
    const deliveryRepo = new FakeDeliveryRepository();
    const useCase = new CreateDeliveryUseCase(txRepo, deliveryRepo);

    const result = await useCase.execute({ transactionId: 'nonexistent' });

    expect(result.isErr()).toBe(true);
    result.match(
      () => fail('Expected Err'),
      (error) => expect(error).toBeInstanceOf(TransactionNotFoundError),
    );
  });

  it('returns Err with InvalidDeliveryStatusError when transaction is not APPROVED', async () => {
    const tx = makeTransaction('PENDING');
    const txRepo = new FakeTransactionRepository(tx);
    const deliveryRepo = new FakeDeliveryRepository();
    const useCase = new CreateDeliveryUseCase(txRepo, deliveryRepo);

    const result = await useCase.execute({ transactionId: 'tx-001' });

    expect(result.isErr()).toBe(true);
    result.match(
      () => fail('Expected Err'),
      (error) => expect(error).toBeInstanceOf(InvalidDeliveryStatusError),
    );
  });

  it('returns Err with DeliveryAlreadyExistsError when delivery already exists', async () => {
    const tx = makeTransaction('APPROVED');
    const txRepo = new FakeTransactionRepository(tx);
    const deliveryRepo = new FakeDeliveryRepository();
    deliveryRepo.existingDelivery = { id: 'del-001' } as Delivery;
    const useCase = new CreateDeliveryUseCase(txRepo, deliveryRepo);

    const result = await useCase.execute({ transactionId: 'tx-001' });

    expect(result.isErr()).toBe(true);
    result.match(
      () => fail('Expected Err'),
      (error) => expect(error).toBeInstanceOf(DeliveryAlreadyExistsError),
    );
  });
});

function fail(message: string): never { throw new Error(message); }
