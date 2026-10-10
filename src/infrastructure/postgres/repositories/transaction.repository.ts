import { randomUUID } from 'crypto';
import type { Transaction as PrismaTransaction } from '@prisma/client';
import { PrismaService } from '@infrastructure/postgres/prisma.service';
import { TransactionRepositoryPort } from '@application/ports/repositories/transaction.repository.port';
import { Transaction } from '@application/domain/transaction/transaction';
import { ResultAsync, Result, ok, err } from '@application/domain/shared/result';
import { DomainError } from '@application/domain/shared/domain-error';
import {
  TransactionRepositoryError,
  TransactionNotFoundError,
} from '@application/domain/transaction/transaction-errors';
import type { ProductSnapshotProps } from '@application/domain/transaction/product-snapshot.vo';
import type { CustomerSnapshotProps } from '@application/domain/transaction/customer-snapshot.vo';
import type { ShippingAddressProps } from '@application/domain/transaction/shipping-address.vo';

const TERMINAL_STATUSES = ['APPROVED', 'DECLINED', 'ERROR'];

export class PrismaTransactionRepository implements TransactionRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  save(transaction: Transaction): ResultAsync<Transaction, DomainError> {
    return ResultAsync.fromPromise(
      this.prisma.transaction.create({
        data: {
          id: transaction.id,
          productId: transaction.productId,
          customerId: transaction.customerId,
          quantity: transaction.quantity.value,
          unitPriceInCents: transaction.unitPriceInCents.value,
          baseFeeInCents: transaction.baseFeeInCents.value,
          shippingFeeInCents: transaction.shippingFeeInCents.value,
          totalAmountInCents: transaction.totalAmountInCents.value,
          currency: transaction.currency,
          status: transaction.status.value,
          wompiTransactionId: transaction.wompiTransactionId,
          reference: transaction.reference.value,
          productData: transaction.productData.toJSON() as object,
          customerData: transaction.customerData.toJSON() as object,
          shippingAddress: transaction.shippingAddress.toJSON() as object,
        },
      }),
      (e) => new TransactionRepositoryError(`Failed to save transaction: ${String(e)}`),
    ).andThen((row): Result<Transaction, DomainError> => toDomain(row));
  }

  findById(id: string): ResultAsync<Transaction | null, DomainError> {
    return ResultAsync.fromPromise(
      this.prisma.transaction.findUnique({ where: { id } }),
      (e) => new TransactionRepositoryError(`Failed to fetch transaction: ${String(e)}`),
    ).andThen((row): Result<Transaction | null, DomainError> => {
      if (row === null) return ok(null);
      return toDomain(row);
    });
  }

  findByReference(reference: string): ResultAsync<Transaction | null, DomainError> {
    return ResultAsync.fromPromise(
      this.prisma.transaction.findUnique({ where: { reference } }),
      (e) => new TransactionRepositoryError(`Failed to fetch transaction: ${String(e)}`),
    ).andThen((row): Result<Transaction | null, DomainError> => {
      if (row === null) return ok(null);
      return toDomain(row);
    });
  }

  completeTransaction(
    reference: string,
    status: string,
    wompiTransactionId: string,
  ): ResultAsync<Transaction, DomainError> {
    return ResultAsync.fromPromise(
      this.prisma.$transaction(async (tx) => {
        const row = await tx.transaction.findUnique({ where: { reference } });
        if (row === null) {
          throw new TransactionNotFoundError(`Transaction with reference ${reference} not found`);
        }

        if (TERMINAL_STATUSES.includes(row.status)) {
          return row;
        }

        await tx.transaction.update({
          where: { reference },
          data: { status, wompiTransactionId },
        });

        if (status === 'APPROVED') {
          const customerData = row.customerData as unknown as CustomerSnapshotProps;
          const customer = await tx.customer.create({
            data: {
              id: randomUUID(),
              email: customerData.email,
              fullName: customerData.fullName,
              phoneNumber: customerData.phoneNumber,
              phoneNumberPrefix: customerData.phoneNumberPrefix,
              legalId: customerData.legalId ?? null,
              legalIdType: customerData.legalIdType ?? null,
            },
          });

          await tx.transaction.update({
            where: { reference },
            data: { customerId: customer.id },
          });

          await tx.product.update({
            where: { id: row.productId },
            data: { stock: { decrement: row.quantity } },
          });
        }

        return await tx.transaction.findUnique({ where: { reference } });
      }),
      (e) => {
        if (e instanceof TransactionNotFoundError) return e;
        return new TransactionRepositoryError(`Failed to complete transaction: ${String(e)}`);
      },
    ).andThen((row): Result<Transaction, DomainError> => {
      if (row === null) {
        return err(new TransactionNotFoundError(`Transaction with reference ${reference} not found`));
      }
      return toDomain(row);
    });
  }
}

function toDomain(row: PrismaTransaction): Result<Transaction, DomainError> {
  return Transaction.create({
    id: row.id,
    productId: row.productId,
    customerId: row.customerId,
    quantity: row.quantity,
    unitPriceInCents: row.unitPriceInCents,
    baseFeeInCents: row.baseFeeInCents,
    shippingFeeInCents: row.shippingFeeInCents,
    totalAmountInCents: row.totalAmountInCents,
    currency: row.currency,
    status: row.status,
    wompiTransactionId: row.wompiTransactionId,
    reference: row.reference,
    productData: row.productData as unknown as ProductSnapshotProps,
    customerData: row.customerData as unknown as CustomerSnapshotProps,
    shippingAddress: row.shippingAddress as unknown as ShippingAddressProps,
  });
}
