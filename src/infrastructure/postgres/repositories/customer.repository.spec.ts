import { PrismaCustomerRepository } from './customer.repository';
import { CustomerRepositoryError } from '@application/domain/customer/customer-errors';
import { Customer } from '@application/domain/customer/customer';

function makeCustomer(): Customer {
  const result = Customer.create({
    id: 'cust-1',
    email: 'user@example.com',
    fullName: 'John Doe',
    phoneNumber: '3001234567',
    phoneNumberPrefix: '+57',
  });
  return result.match(
    (c) => c,
    () => { throw new Error('Invalid customer'); },
  );
}

function makePrisma() {
  return {
    customer: {
      create: jest.fn().mockResolvedValue({ id: 'cust-1' }),
    },
  };
}

describe('PrismaCustomerRepository', () => {
  it('save returns customer on success', async () => {
    const prisma = makePrisma();
    const repo = new PrismaCustomerRepository(prisma as any);
    const customer = makeCustomer();

    const result = await repo.save(customer);
    result.match(
      (c) => expect(c.id).toBe('cust-1'),
      () => fail('Expected Ok'),
    );
    expect(prisma.customer.create).toHaveBeenCalledWith({
      data: {
        id: 'cust-1',
        email: 'user@example.com',
        fullName: 'John Doe',
        phoneNumber: '3001234567',
        phoneNumberPrefix: '+57',
        legalId: null,
        legalIdType: null,
      },
    });
  });

  it('save returns error on prisma failure', async () => {
    const prisma = makePrisma();
    prisma.customer.create.mockRejectedValue(new Error('DB error'));
    const repo = new PrismaCustomerRepository(prisma as any);

    const result = await repo.save(makeCustomer());
    result.match(
      () => fail('Expected Err'),
      (error) => expect(error).toBeInstanceOf(CustomerRepositoryError),
    );
  });
});

function fail(message: string): never {
  throw new Error(message);
}
