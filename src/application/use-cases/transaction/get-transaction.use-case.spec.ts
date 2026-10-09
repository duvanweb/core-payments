import { GetTransactionUseCase } from './get-transaction.use-case';
import { TransactionRepositoryPort } from '@application/ports/repositories/transaction.repository.port';
import { Transaction } from '@application/domain/transaction/transaction';
import { ResultAsync, okAsync, errAsync, ok, err } from '@application/domain/shared/result';
import { DomainError } from '@application/domain/shared/domain-error';
import {
  TransactionNotFoundError,
  WompiApiError,
} from '@application/domain/transaction/transaction-errors';
import {
  WompiApiPort,
  WompiTransactionData,
} from '@application/ports/gateways/wompi-api.port';
import {
  HandleWompiWebhookUseCasePort,
  WebhookInput,
} from '@application/ports/use-cases/handle-wompi-webhook.use-case.port';

function makeTransaction(status: string = 'PENDING'): Transaction {
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
    status,
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
  private completeCalled = false;
  constructor(
    private readonly transaction: Transaction | null,
    private readonly updatedTransaction: Transaction | null = null,
  ) {}
  save(_transaction: Transaction): ResultAsync<Transaction, DomainError> {
    return okAsync(_transaction);
  }
  findById(id: string): ResultAsync<Transaction | null, DomainError> {
    if (this.completeCalled && this.updatedTransaction) {
      return okAsync(this.updatedTransaction.id === id ? this.updatedTransaction : null);
    }
    return okAsync(this.transaction && this.transaction.id === id ? this.transaction : null);
  }
  findByReference(_reference: string): ResultAsync<Transaction | null, DomainError> {
    return okAsync(this.transaction);
  }
  completeTransaction(_reference: string, _status: string, _wompiTransactionId: string): ResultAsync<Transaction, DomainError> {
    this.completeCalled = true;
    return okAsync(this.updatedTransaction ?? this.transaction!);
  }
}

class FakeWompiApi implements WompiApiPort {
  private getByIdCalls = 0;
  private getByRefCalls = 0;
  constructor(
    private readonly responses: WompiTransactionData[] | null[],
    private readonly error: WompiApiError | null = null,
  ) {}
  getTransactionById(_id: string): ResultAsync<WompiTransactionData | null, WompiApiError> {
    const response = this.error ?? this.responses[this.getByIdCalls++] ?? null;
    if (response instanceof WompiApiError) return errAsync(response);
    return okAsync(response as WompiTransactionData | null);
  }
  getTransactionByReference(_reference: string): ResultAsync<WompiTransactionData | null, WompiApiError> {
    const response = this.error ?? this.responses[this.getByRefCalls++] ?? null;
    if (response instanceof WompiApiError) return errAsync(response);
    return okAsync(response as WompiTransactionData | null);
  }
}

class FakeHandleWebhook implements HandleWompiWebhookUseCasePort {
  readonly calls: WebhookInput[] = [];
  constructor(private readonly repo?: FakeTransactionRepository) {}
  execute(input: WebhookInput): ResultAsync<void, DomainError> {
    this.calls.push(input);
    if (this.repo) {
      return this.repo
        .completeTransaction(input.reference, input.status, input.wompiTransactionId)
        .map(() => undefined);
    }
    return okAsync(undefined);
  }
}

const defaultConfig = { maxRetries: 3, retryDelayMs: 0 };

describe('GetTransactionUseCase', () => {
  it('returns Ok with the transaction when found and terminal', async () => {
    const tx = makeTransaction('APPROVED');
    const useCase = new GetTransactionUseCase(
      new FakeTransactionRepository(tx),
      new FakeWompiApi([]),
      new FakeHandleWebhook(),
      defaultConfig,
    );

    const result = await useCase.execute('tx-001');

    expect(result.isOk()).toBe(true);
    result.match(
      (value) => expect(value.id).toBe('tx-001'),
      () => fail('Expected Ok'),
    );
  });

  it('returns Err with TransactionNotFoundError when not found', async () => {
    const useCase = new GetTransactionUseCase(
      new FakeTransactionRepository(null),
      new FakeWompiApi([]),
      new FakeHandleWebhook(),
      defaultConfig,
    );

    const result = await useCase.execute('nonexistent');

    expect(result.isErr()).toBe(true);
    result.match(
      () => fail('Expected Err'),
      (error) => expect(error).toBeInstanceOf(TransactionNotFoundError),
    );
  });

  it('syncs from Wompi when PENDING and Wompi returns APPROVED', async () => {
    const pendingTx = makeTransaction('PENDING');
    const approvedTx = makeTransaction('APPROVED');
    const repo = new FakeTransactionRepository(pendingTx, approvedTx);
    const wompiApi = new FakeWompiApi([
      { id: 'wompi-1', status: 'APPROVED', reference: 'ref-001' },
    ]);
    const handleWebhook = new FakeHandleWebhook(repo);
    const useCase = new GetTransactionUseCase(repo, wompiApi, handleWebhook, defaultConfig);

    const result = await useCase.execute('tx-001');

    expect(result.isOk()).toBe(true);
    result.match(
      (value) => expect(value.status.value).toBe('APPROVED'),
      () => fail('Expected Ok'),
    );
    expect(handleWebhook.calls).toHaveLength(1);
    expect(handleWebhook.calls[0]).toEqual({
      reference: 'ref-001',
      status: 'APPROVED',
      wompiTransactionId: 'wompi-1',
    });
  });

  it('returns PENDING when Wompi returns PENDING on all attempts', async () => {
    const pendingTx = makeTransaction('PENDING');
    const wompiApi = new FakeWompiApi([
      { id: 'wompi-1', status: 'PENDING', reference: 'ref-001' },
      { id: 'wompi-1', status: 'PENDING', reference: 'ref-001' },
      { id: 'wompi-1', status: 'PENDING', reference: 'ref-001' },
    ]);
    const handleWebhook = new FakeHandleWebhook();
    const useCase = new GetTransactionUseCase(
      new FakeTransactionRepository(pendingTx),
      wompiApi,
      handleWebhook,
      defaultConfig,
    );

    const result = await useCase.execute('tx-001');

    expect(result.isOk()).toBe(true);
    result.match(
      (value) => expect(value.status.value).toBe('PENDING'),
      () => fail('Expected Ok with PENDING'),
    );
    expect(handleWebhook.calls).toHaveLength(0);
  });

  it('returns PENDING when Wompi returns errors on all attempts', async () => {
    const pendingTx = makeTransaction('PENDING');
    const wompiApi = new FakeWompiApi(
      [],
      new WompiApiError('Wompi unavailable'),
    );
    const handleWebhook = new FakeHandleWebhook();
    const useCase = new GetTransactionUseCase(
      new FakeTransactionRepository(pendingTx),
      wompiApi,
      handleWebhook,
      defaultConfig,
    );

    const result = await useCase.execute('tx-001');

    expect(result.isOk()).toBe(true);
    result.match(
      (value) => expect(value.status.value).toBe('PENDING'),
      () => fail('Expected Ok with PENDING'),
    );
  });

  it('returns APPROVED when Wompi returns PENDING then APPROVED', async () => {
    const pendingTx = makeTransaction('PENDING');
    const approvedTx = makeTransaction('APPROVED');
    const repo = new FakeTransactionRepository(pendingTx, approvedTx);
    const wompiApi = new FakeWompiApi([
      { id: 'wompi-1', status: 'PENDING', reference: 'ref-001' },
      { id: 'wompi-1', status: 'APPROVED', reference: 'ref-001' },
    ]);
    const handleWebhook = new FakeHandleWebhook(repo);
    const useCase = new GetTransactionUseCase(repo, wompiApi, handleWebhook, defaultConfig);

    const result = await useCase.execute('tx-001');

    expect(result.isOk()).toBe(true);
    result.match(
      (value) => expect(value.status.value).toBe('APPROVED'),
      () => fail('Expected Ok with APPROVED'),
    );
    expect(handleWebhook.calls).toHaveLength(1);
  });

  it('maps VOIDED status from Wompi to DECLINED', async () => {
    const pendingTx = makeTransaction('PENDING');
    const declinedTx = makeTransaction('DECLINED');
    const repo = new FakeTransactionRepository(pendingTx, declinedTx);
    const wompiApi = new FakeWompiApi([
      { id: 'wompi-1', status: 'VOIDED', reference: 'ref-001' },
    ]);
    const handleWebhook = new FakeHandleWebhook();
    const useCase = new GetTransactionUseCase(repo, wompiApi, handleWebhook, defaultConfig);

    await useCase.execute('tx-001');

    expect(handleWebhook.calls[0]?.status).toBe('DECLINED');
  });
});

function fail(message: string): never {
  throw new Error(message);
}
