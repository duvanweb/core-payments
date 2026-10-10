import { PrismaDeliveryRepository } from './delivery.repository';
import { DeliveryRepositoryError } from '@application/domain/delivery/delivery-errors';
import { Delivery } from '@application/domain/delivery/delivery';

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

function makePrismaRow(overrides: Partial<any> = {}) {
  return {
    id: 'del-1',
    transactionId: 'tx-1',
    status: 'PENDING',
    carrier: 'DHL',
    trackingNumber: 'TRK123',
    ...overrides,
  };
}

function makePrisma(row: any = null) {
  return {
    delivery: {
      create: jest.fn().mockResolvedValue(row ?? makePrismaRow()),
      findUnique: jest.fn().mockResolvedValue(row),
      update: jest.fn().mockResolvedValue(row ?? makePrismaRow()),
    },
  };
}

describe('PrismaDeliveryRepository', () => {
  it('save returns delivery on success', async () => {
    const prisma = makePrisma(makePrismaRow());
    const repo = new PrismaDeliveryRepository(prisma as any);

    const result = await repo.save(makeDelivery());
    result.match(
      (d) => expect(d.id).toBe('del-1'),
      () => fail('Expected Ok'),
    );
  });

  it('save returns error on prisma failure', async () => {
    const prisma = makePrisma();
    prisma.delivery.create.mockRejectedValue(new Error('DB error'));
    const repo = new PrismaDeliveryRepository(prisma as any);

    const result = await repo.save(makeDelivery());
    result.match(
      () => fail('Expected Err'),
      (error) => expect(error).toBeInstanceOf(DeliveryRepositoryError),
    );
  });

  it('findById returns delivery when found', async () => {
    const prisma = makePrisma(makePrismaRow());
    const repo = new PrismaDeliveryRepository(prisma as any);

    const result = await repo.findById('del-1');
    result.match(
      (d) => expect(d).not.toBeNull(),
      () => fail('Expected Ok'),
    );
  });

  it('findById returns null when not found', async () => {
    const prisma = makePrisma(null);
    const repo = new PrismaDeliveryRepository(prisma as any);

    const result = await repo.findById('not-found');
    result.match(
      (d) => expect(d).toBeNull(),
      () => fail('Expected Ok'),
    );
  });

  it('findByTransactionId returns delivery when found', async () => {
    const prisma = makePrisma(makePrismaRow());
    const repo = new PrismaDeliveryRepository(prisma as any);

    const result = await repo.findByTransactionId('tx-1');
    result.match(
      (d) => expect(d).not.toBeNull(),
      () => fail('Expected Ok'),
    );
  });

  it('findByTransactionId returns null when not found', async () => {
    const prisma = makePrisma(null);
    const repo = new PrismaDeliveryRepository(prisma as any);

    const result = await repo.findByTransactionId('not-found');
    result.match(
      (d) => expect(d).toBeNull(),
      () => fail('Expected Ok'),
    );
  });

  it('updateStatus returns delivery on success', async () => {
    const prisma = makePrisma(makePrismaRow({ status: 'IN_TRANSIT' }));
    const repo = new PrismaDeliveryRepository(prisma as any);

    const result = await repo.updateStatus('del-1', 'IN_TRANSIT', 'DHL', 'TRK123');
    result.match(
      (d) => expect(d.status.value).toBe('IN_TRANSIT'),
      () => fail('Expected Ok'),
    );
  });

  it('updateStatus returns error on prisma failure', async () => {
    const prisma = makePrisma();
    prisma.delivery.update.mockRejectedValue(new Error('DB error'));
    const repo = new PrismaDeliveryRepository(prisma as any);

    const result = await repo.updateStatus('del-1', 'IN_TRANSIT');
    result.match(
      () => fail('Expected Err'),
      (error) => expect(error).toBeInstanceOf(DeliveryRepositoryError),
    );
  });
});

function fail(message: string): never {
  throw new Error(message);
}
