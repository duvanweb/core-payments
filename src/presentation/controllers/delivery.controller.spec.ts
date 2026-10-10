import { ok, err, okAsync, errAsync } from '@application/domain/shared/result';
import { DomainError } from '@application/domain/shared/domain-error';
import { Delivery } from '@application/domain/delivery/delivery';
import { DeliveryController } from './delivery.controller';

class FakeGetDeliveryUseCase {
  result: any = okAsync(null);
  execute(_input: any) {
    return this.result;
  }
}

class FakeUpdateDeliveryStatusUseCase {
  result: any = okAsync(null);
  execute(_input: any) {
    return this.result;
  }
}

class TestError extends DomainError {
  constructor() {
    super('DELIVERY_NOT_FOUND', 'Delivery not found');
  }
}

function makeDelivery(): Delivery {
  const result = Delivery.create({
    id: 'del-1',
    transactionId: 'tx-1',
    status: 'PENDING',
    carrier: 'DHL',
    trackingNumber: 'TRK123',
  });
  return result.match(
    (d) => d,
    () => { throw new Error('Invalid delivery'); },
  );
}

describe('DeliveryController', () => {
  it('getById returns DTO on success', async () => {
    const getUseCase = new FakeGetDeliveryUseCase();
    const updateUseCase = new FakeUpdateDeliveryStatusUseCase();
    getUseCase.result = okAsync(makeDelivery());
    const controller = new DeliveryController(getUseCase as any, updateUseCase as any);

    const result = await controller.getById('del-1');
    expect(result.id).toBe('del-1');
    expect(result.transactionId).toBe('tx-1');
    expect(result.status).toBe('PENDING');
    expect(result.carrier).toBe('DHL');
    expect(result.trackingNumber).toBe('TRK123');
  });

  it('getById throws on error', async () => {
    const getUseCase = new FakeGetDeliveryUseCase();
    const updateUseCase = new FakeUpdateDeliveryStatusUseCase();
    getUseCase.result = errAsync(new TestError());
    const controller = new DeliveryController(getUseCase as any, updateUseCase as any);

    await expect(controller.getById('del-1')).rejects.toThrow();
  });

  it('getByTransactionId returns DTO on success', async () => {
    const getUseCase = new FakeGetDeliveryUseCase();
    const updateUseCase = new FakeUpdateDeliveryStatusUseCase();
    getUseCase.result = okAsync(makeDelivery());
    const controller = new DeliveryController(getUseCase as any, updateUseCase as any);

    const result = await controller.getByTransactionId('tx-1');
    expect(result.id).toBe('del-1');
  });

  it('getByTransactionId throws on error', async () => {
    const getUseCase = new FakeGetDeliveryUseCase();
    const updateUseCase = new FakeUpdateDeliveryStatusUseCase();
    getUseCase.result = errAsync(new TestError());
    const controller = new DeliveryController(getUseCase as any, updateUseCase as any);

    await expect(controller.getByTransactionId('tx-1')).rejects.toThrow();
  });

  it('updateStatus returns DTO on success', async () => {
    const getUseCase = new FakeGetDeliveryUseCase();
    const updateUseCase = new FakeUpdateDeliveryStatusUseCase();
    updateUseCase.result = okAsync(makeDelivery());
    const controller = new DeliveryController(getUseCase as any, updateUseCase as any);

    const result = await controller.updateStatus('del-1', {
      status: 'SHIPPED',
      carrier: 'DHL',
      trackingNumber: 'TRK123',
    } as any);
    expect(result.id).toBe('del-1');
  });

  it('updateStatus throws on error', async () => {
    const getUseCase = new FakeGetDeliveryUseCase();
    const updateUseCase = new FakeUpdateDeliveryStatusUseCase();
    updateUseCase.result = errAsync(new TestError());
    const controller = new DeliveryController(getUseCase as any, updateUseCase as any);

    await expect(controller.updateStatus('del-1', { status: 'SHIPPED' } as any)).rejects.toThrow();
  });
});
