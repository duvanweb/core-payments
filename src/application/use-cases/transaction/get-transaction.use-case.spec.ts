import { GetTransactionUseCase } from './get-transaction.use-case';
import { TransactionRepositoryPort } from '@application/ports/repositories/transaction.repository.port';
import { Transaction } from '@application/domain/transaction/transaction';
import { ResultAsync, okAsync } from '@application/domain/shared/result';
import { DomainError } from '@application/domain/shared/domain-error';
import { TransactionNotFoundError } from '@application/domain/transaction/transaction-errors';

function makeTransaction(): Transaction {
  const result = Transaction.create({
    id: 'tx-001',
    productId: 'prod-001',
    customerId: null,
    quantity: 1,
    unitPriceInCents: 9500,
    baseFeeInCents: 250000,
    shippingFeeInCents: 300000,
    totalAmountInCents: 559500,
    currency: 'COP',
    status: 'PENDING',
    wompiTransactionId: null,
    reference: 'ref-001',
    productData: { id: 'prod-001', title: 'Coffee', price: 95.0, image: 'coffee.jpg', description: 'Good coffee' },
    customerData: { email: 'test@example.com', fullName: 'Test', phoneNumber: '300123', phoneNumberPrefix: '+57' },
    shippingAddress: { addressLine1: 'Calle 1', country: 'CO', city: 'Bogotá', phoneNumber: '300123', region: 'Cundinamarca' },
  });
  return result.match(
    (t) => t,
    () => { throw new Error('Failed to create test transaction'); },
  );
}

class FakeTransactionRepository implements TransactionRepositoryPort {
  constructor(private readonly transaction: Transaction | null) {}
  save(_transaction: Transaction): ResultAsync<Transaction, DomainError> {
    return okAsync(_transaction);
  }
  findById(id: string): ResultAsync<Transaction | null, DomainError> {
    return okAsync(this.transaction && this.transaction.id === id ? this.transaction : null);
  }
  findByReference(_reference: string): ResultAsync<Transaction | null, DomainError> {
    return okAsync(null);
  }
  completeTransaction(_reference: string, _status: string, _wompiTransactionId: string): ResultAsync<Transaction, DomainError> {
    return okAsync(this.transaction!);
  }
}

describe('GetTransactionUseCase', () => {
  it('returns Ok with the transaction when found', async () => {
    const tx = makeTransaction();
    const useCase = new GetTransactionUseCase(new FakeTransactionRepository(tx));

    const result = await useCase.execute('tx-001');

    expect(result.isOk()).toBe(true);
    result.match(
      (value) => expect(value.id).toBe('tx-001'),
      () => fail('Expected Ok'),
    );
  });

  it('returns Err with TransactionNotFoundError when not found', async () => {
    const useCase = new GetTransactionUseCase(new FakeTransactionRepository(null));

    const result = await useCase.execute('nonexistent');

    expect(result.isErr()).toBe(true);
    result.match(
      () => fail('Expected Err'),
      (error) => expect(error).toBeInstanceOf(TransactionNotFoundError),
    );
  });
});

function fail(message: string): never {
  throw new Error(message);
}
