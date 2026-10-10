import { GetDeliveryUseCase } from './get-delivery.use-case';
import { DeliveryRepositoryPort } from '@application/ports/repositories/delivery.repository.port';
import { Delivery } from '@application/domain/delivery/delivery';
import { ResultAsync, okAsync } from '@application/domain/shared/result';
import { DomainError } from '@application/domain/shared/domain-error';
import { DeliveryNotFoundError } from '@application/domain/delivery/delivery-errors';

function makeDelivery(): Delivery {
  return Delivery.create({
    id: 'del-001',
    transactionId: 'tx-001',
    status: 'PENDING',
    carrier: null,
    trackingNumber: null,
  }).match(
    (d) => d,
    () => { throw new Error('Failed to create test delivery'); },
  );
}

class FakeDeliveryRepository implements DeliveryRepositoryPort {
  constructor(private readonly delivery: Delivery | null) {}
  save(_d: Delivery): ResultAsync<Delivery, DomainError> { return okAsync(_d); }
  findById(id: string): ResultAsync<Delivery | null, DomainError> {
    return okAsync(this.delivery && this.delivery.id === id ? this.delivery : null);
  }
  findByTransactionId(tid: string): ResultAsync<Delivery | null, DomainError> {
    return okAsync(this.delivery && this.delivery.transactionId === tid ? this.delivery : null);
  }
  updateStatus(_id: string, _s: string, _c?: string, _t?: string): ResultAsync<Delivery, DomainError> {
    return okAsync(this.delivery!);
  }
}

describe('GetDeliveryUseCase', () => {
  it('returns Ok with delivery when found by id', async () => {
    const delivery = makeDelivery();
    const repo = new FakeDeliveryRepository(delivery);
    const useCase = new GetDeliveryUseCase(repo);

    const result = await useCase.execute({ id: 'del-001' });

    expect(result.isOk()).toBe(true);
    result.match(
      (d) => expect(d.id).toBe('del-001'),
      () => fail('Expected Ok'),
    );
  });

  it('returns Ok with delivery when found by transactionId', async () => {
    const delivery = makeDelivery();
    const repo = new FakeDeliveryRepository(delivery);
    const useCase = new GetDeliveryUseCase(repo);

    const result = await useCase.execute({ transactionId: 'tx-001' });

    expect(result.isOk()).toBe(true);
  });

  it('returns Err with DeliveryNotFoundError when not found', async () => {
    const repo = new FakeDeliveryRepository(null);
    const useCase = new GetDeliveryUseCase(repo);

    const result = await useCase.execute({ id: 'nonexistent' });

    expect(result.isErr()).toBe(true);
    result.match(
      () => fail('Expected Err'),
      (error) => expect(error).toBeInstanceOf(DeliveryNotFoundError),
    );
  });

  it('returns Err when neither id nor transactionId provided', async () => {
    const repo = new FakeDeliveryRepository(null);
    const useCase = new GetDeliveryUseCase(repo);

    const result = await useCase.execute({});

    expect(result.isErr()).toBe(true);
  });
});

function fail(message: string): never { throw new Error(message); }
