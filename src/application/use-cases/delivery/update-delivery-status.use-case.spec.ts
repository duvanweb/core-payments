import { UpdateDeliveryStatusUseCase } from './update-delivery-status.use-case';
import { DeliveryRepositoryPort } from '@application/ports/repositories/delivery.repository.port';
import { Delivery } from '@application/domain/delivery/delivery';
import { ResultAsync, okAsync } from '@application/domain/shared/result';
import { DomainError } from '@application/domain/shared/domain-error';
import {
  DeliveryNotFoundError,
  InvalidDeliveryStatusError,
} from '@application/domain/delivery/delivery-errors';

function makeDelivery(status: string = 'PENDING'): Delivery {
  return Delivery.create({
    id: 'del-001',
    transactionId: 'tx-001',
    status,
    carrier: null,
    trackingNumber: null,
  }).match(
    (d) => d,
    () => { throw new Error('Failed to create test delivery'); },
  );
}

class FakeDeliveryRepository implements DeliveryRepositoryPort {
  updatedDelivery: Delivery | null = null;
  constructor(private readonly delivery: Delivery | null) {}
  save(_d: Delivery): ResultAsync<Delivery, DomainError> { return okAsync(_d); }
  findById(id: string): ResultAsync<Delivery | null, DomainError> {
    return okAsync(this.delivery && this.delivery.id === id ? this.delivery : null);
  }
  findByTransactionId(_tid: string): ResultAsync<Delivery | null, DomainError> { return okAsync(null); }
  updateStatus(id: string, status: string, carrier?: string, trackingNumber?: string): ResultAsync<Delivery, DomainError> {
    this.updatedDelivery = Delivery.create({
      id,
      transactionId: this.delivery!.transactionId,
      status,
      carrier: carrier ?? null,
      trackingNumber: trackingNumber ?? null,
    }).match(
      (d) => d,
      () => { throw new Error('Failed to create updated delivery'); },
    );
    return okAsync(this.updatedDelivery);
  }
}

describe('UpdateDeliveryStatusUseCase', () => {
  it('returns Ok with updated delivery on valid transition PENDING → IN_TRANSIT', async () => {
    const delivery = makeDelivery('PENDING');
    const repo = new FakeDeliveryRepository(delivery);
    const useCase = new UpdateDeliveryStatusUseCase(repo);

    const result = await useCase.execute({
      id: 'del-001',
      status: 'IN_TRANSIT',
      carrier: 'DHL',
      trackingNumber: 'TRACK123',
    });

    expect(result.isOk()).toBe(true);
    expect(repo.updatedDelivery).not.toBeNull();
  });

  it('returns Ok on valid transition IN_TRANSIT → DELIVERED', async () => {
    const delivery = makeDelivery('IN_TRANSIT');
    const repo = new FakeDeliveryRepository(delivery);
    const useCase = new UpdateDeliveryStatusUseCase(repo);

    const result = await useCase.execute({ id: 'del-001', status: 'DELIVERED' });

    expect(result.isOk()).toBe(true);
  });

  it('returns Ok on valid transition PENDING → CANCELLED', async () => {
    const delivery = makeDelivery('PENDING');
    const repo = new FakeDeliveryRepository(delivery);
    const useCase = new UpdateDeliveryStatusUseCase(repo);

    const result = await useCase.execute({ id: 'del-001', status: 'CANCELLED' });

    expect(result.isOk()).toBe(true);
  });

  it('returns Err with InvalidDeliveryStatusError on invalid transition DELIVERED → IN_TRANSIT', async () => {
    const delivery = makeDelivery('DELIVERED');
    const repo = new FakeDeliveryRepository(delivery);
    const useCase = new UpdateDeliveryStatusUseCase(repo);

    const result = await useCase.execute({ id: 'del-001', status: 'IN_TRANSIT' });

    expect(result.isErr()).toBe(true);
    result.match(
      () => fail('Expected Err'),
      (error) => expect(error).toBeInstanceOf(InvalidDeliveryStatusError),
    );
  });

  it('returns Err with DeliveryNotFoundError when delivery not found', async () => {
    const repo = new FakeDeliveryRepository(null);
    const useCase = new UpdateDeliveryStatusUseCase(repo);

    const result = await useCase.execute({ id: 'nonexistent', status: 'IN_TRANSIT' });

    expect(result.isErr()).toBe(true);
    result.match(
      () => fail('Expected Err'),
      (error) => expect(error).toBeInstanceOf(DeliveryNotFoundError),
    );
  });
});

function fail(message: string): never { throw new Error(message); }
