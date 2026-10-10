import { PrismaTransactionRepository } from './transaction.repository';
import {
  TransactionRepositoryError,
  TransactionNotFoundError,
} from '@application/domain/transaction/transaction-errors';
import { Transaction } from '@application/domain/transaction/transaction';

function makeTransactionRow(overrides: Partial<any> = {}) {
  return {
    id: 'tx-1',
    productId: 'prod-1',
    customerId: null,
    quantity: 2,
    unitPriceInCents: 2999,
    baseFeeInCents: 5998,
    shippingFeeInCents: 1000,
    totalAmountInCents: 6998,
    currency: 'COP',
    status: 'PENDING',
    wompiTransactionId: null,
    reference: 'REF-001',
    productData: {
      id: 'prod-1',
      title: 'Test Product',
      price: 29.99,
      image: 'test.jpg',
      description: 'A test product',
    },
    customerData: {
      email: 'user@example.com',
      fullName: 'John Doe',
      phoneNumber: '3001234567',
      phoneNumberPrefix: '+57',
    },
    shippingAddress: {
      addressLine1: 'Calle 123',
      country: 'CO',
      city: 'Bogota',
      phoneNumber: '3001234567',
      region: 'Cundinamarca',
    },
    ...overrides,
  };
}

function makeTransaction(): Transaction {
  const result = Transaction.create({
    id: 'tx-1',
    productId: 'prod-1',
    customerId: null,
    quantity: 2,
    unitPriceInCents: 2999,
    baseFeeInCents: 5998,
    shippingFeeInCents: 1000,
    totalAmountInCents: 6998,
    currency: 'COP',
    status: 'PENDING',
    wompiTransactionId: null,
    reference: 'REF-001',
    productData: {
      id: 'prod-1',
      title: 'Test Product',
      price: 29.99,
      image: 'test.jpg',
      description: 'A test product',
    },
    customerData: {
      email: 'user@example.com',
      fullName: 'John Doe',
      phoneNumber: '3001234567',
      phoneNumberPrefix: '+57',
    },
    shippingAddress: {
      addressLine1: 'Calle 123',
      country: 'CO',
      city: 'Bogota',
      phoneNumber: '3001234567',
      region: 'Cundinamarca',
    },
  });
  return result.match(
    (t) => t,
    () => { throw new Error('Invalid transaction'); },
  );
}

function makePrisma(row: any = null) {
  const tx = {
    transaction: {
      findUnique: jest.fn().mockResolvedValue(row),
      update: jest.fn().mockResolvedValue(row),
      create: jest.fn().mockResolvedValue(row),
    },
    customer: {
      create: jest.fn().mockResolvedValue({ id: 'cust-new' }),
    },
    product: {
      update: jest.fn().mockResolvedValue(undefined),
    },
  };
  return {
    transaction: {
      create: jest.fn().mockResolvedValue(row ?? makeTransactionRow()),
      findUnique: jest.fn().mockResolvedValue(row),
    },
    $transaction: jest.fn(async (fn: (tx: any) => Promise<any>) => fn(tx)),
  };
}

describe('PrismaTransactionRepository', () => {
  it('save returns transaction on success', async () => {
    const prisma = makePrisma(makeTransactionRow());
    const repo = new PrismaTransactionRepository(prisma as any);

    const result = await repo.save(makeTransaction());
    result.match(
      (t) => expect(t.id).toBe('tx-1'),
      () => fail('Expected Ok'),
    );
  });

  it('save returns error on prisma failure', async () => {
    const prisma = makePrisma();
    prisma.transaction.create.mockRejectedValue(new Error('DB error'));
    const repo = new PrismaTransactionRepository(prisma as any);

    const result = await repo.save(makeTransaction());
    result.match(
      () => fail('Expected Err'),
      (error) => expect(error).toBeInstanceOf(TransactionRepositoryError),
    );
  });

  it('findById returns transaction when found', async () => {
    const prisma = makePrisma(makeTransactionRow());
    const repo = new PrismaTransactionRepository(prisma as any);

    const result = await repo.findById('tx-1');
    result.match(
      (t) => expect(t).not.toBeNull(),
      () => fail('Expected Ok'),
    );
  });

  it('findById returns null when not found', async () => {
    const prisma = makePrisma(null);
    const repo = new PrismaTransactionRepository(prisma as any);

    const result = await repo.findById('not-found');
    result.match(
      (t) => expect(t).toBeNull(),
      () => fail('Expected Ok'),
    );
  });

  it('findByReference returns transaction when found', async () => {
    const prisma = makePrisma(makeTransactionRow());
    const repo = new PrismaTransactionRepository(prisma as any);

    const result = await repo.findByReference('REF-001');
    result.match(
      (t) => expect(t).not.toBeNull(),
      () => fail('Expected Ok'),
    );
  });

  it('findByReference returns null when not found', async () => {
    const prisma = makePrisma(null);
    const repo = new PrismaTransactionRepository(prisma as any);

    const result = await repo.findByReference('not-found');
    result.match(
      (t) => expect(t).toBeNull(),
      () => fail('Expected Ok'),
    );
  });

  it('completeTransaction updates status for non-terminal status', async () => {
    const row = makeTransactionRow({ status: 'PENDING' });
    const prisma = makePrisma(row);
    const repo = new PrismaTransactionRepository(prisma as any);

    const result = await repo.completeTransaction('REF-001', 'APPROVED', 'wompi-1');
    result.match(
      (t) => expect(t).not.toBeNull(),
      () => fail('Expected Ok'),
    );
  });

  it('completeTransaction returns error when reference not found', async () => {
    const prisma = makePrisma(null);
    const repo = new PrismaTransactionRepository(prisma as any);

    const result = await repo.completeTransaction('not-found', 'APPROVED', 'wompi-1');
    result.match(
      () => fail('Expected Err'),
      (error) => expect(error).toBeInstanceOf(TransactionNotFoundError),
    );
  });

  it('completeTransaction is idempotent for terminal status', async () => {
    const row = makeTransactionRow({ status: 'APPROVED' });
    const prisma = makePrisma(row);
    const repo = new PrismaTransactionRepository(prisma as any);

    const result = await repo.completeTransaction('REF-001', 'APPROVED', 'wompi-1');
    result.match(
      (t) => expect(t).not.toBeNull(),
      () => fail('Expected Ok'),
    );
  });
});

function fail(message: string): never {
  throw new Error(message);
}
