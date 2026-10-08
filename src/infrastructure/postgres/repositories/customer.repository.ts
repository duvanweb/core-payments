import { PrismaService } from '@infrastructure/postgres/prisma.service';
import { CustomerRepositoryPort } from '@application/ports/repositories/customer.repository.port';
import { Customer } from '@application/domain/customer/customer';
import { ResultAsync, Result, ok } from '@application/domain/shared/result';
import { DomainError } from '@application/domain/shared/domain-error';
import { CustomerRepositoryError } from '@application/domain/customer/customer-errors';

export class PrismaCustomerRepository implements CustomerRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  save(customer: Customer): ResultAsync<Customer, DomainError> {
    return ResultAsync.fromPromise(
      this.prisma.customer.create({
        data: {
          id: customer.id,
          email: customer.email.value,
          fullName: customer.fullName.value,
          phoneNumber: customer.phoneNumber.value,
          phoneNumberPrefix: customer.phoneNumberPrefix.value,
          legalId: customer.legalId?.value ?? null,
          legalIdType: customer.legalIdType?.value ?? null,
        },
      }),
      (e) => new CustomerRepositoryError(`Failed to save customer: ${String(e)}`),
    ).andThen((_row): Result<Customer, DomainError> => ok(customer));
  }
}
