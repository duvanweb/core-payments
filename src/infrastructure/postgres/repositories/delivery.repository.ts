import type { Delivery as PrismaDelivery } from '@prisma/client';
import { PrismaService } from '@infrastructure/postgres/prisma.service';
import { DeliveryRepositoryPort } from '@application/ports/repositories/delivery.repository.port';
import { Delivery } from '@application/domain/delivery/delivery';
import { ResultAsync, Result, ok } from '@application/domain/shared/result';
import { DomainError } from '@application/domain/shared/domain-error';
import {
  DeliveryRepositoryError,
} from '@application/domain/delivery/delivery-errors';

export class PrismaDeliveryRepository implements DeliveryRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  save(delivery: Delivery): ResultAsync<Delivery, DomainError> {
    return ResultAsync.fromPromise(
      this.prisma.delivery.create({
        data: {
          id: delivery.id,
          transactionId: delivery.transactionId,
          status: delivery.status.value,
          carrier: delivery.carrier,
          trackingNumber: delivery.trackingNumber,
        },
      }),
      (e) => new DeliveryRepositoryError(`Failed to save delivery: ${String(e)}`),
    ).andThen((row): Result<Delivery, DomainError> => toDomain(row));
  }

  findById(id: string): ResultAsync<Delivery | null, DomainError> {
    return ResultAsync.fromPromise(
      this.prisma.delivery.findUnique({ where: { id } }),
      (e) => new DeliveryRepositoryError(`Failed to fetch delivery: ${String(e)}`),
    ).andThen((row): Result<Delivery | null, DomainError> => {
      if (row === null) return ok(null);
      return toDomain(row);
    });
  }

  findByTransactionId(transactionId: string): ResultAsync<Delivery | null, DomainError> {
    return ResultAsync.fromPromise(
      this.prisma.delivery.findUnique({ where: { transactionId } }),
      (e) => new DeliveryRepositoryError(`Failed to fetch delivery: ${String(e)}`),
    ).andThen((row): Result<Delivery | null, DomainError> => {
      if (row === null) return ok(null);
      return toDomain(row);
    });
  }

  updateStatus(
    id: string,
    status: string,
    carrier?: string,
    trackingNumber?: string,
  ): ResultAsync<Delivery, DomainError> {
    return ResultAsync.fromPromise(
      this.prisma.delivery.update({
        where: { id },
        data: {
          status,
          ...(carrier !== undefined ? { carrier } : {}),
          ...(trackingNumber !== undefined ? { trackingNumber } : {}),
        },
      }),
      (e) => new DeliveryRepositoryError(`Failed to update delivery: ${String(e)}`),
    ).andThen((row): Result<Delivery, DomainError> => toDomain(row));
  }
}

function toDomain(row: PrismaDelivery): Result<Delivery, DomainError> {
  return Delivery.create({
    id: row.id,
    transactionId: row.transactionId,
    status: row.status,
    carrier: row.carrier,
    trackingNumber: row.trackingNumber,
  });
}
