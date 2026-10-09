import { randomUUID } from 'crypto';
import { err } from '@application/domain/shared/result';
import { TransactionRepositoryPort } from '@application/ports/repositories/transaction.repository.port';
import { DeliveryRepositoryPort } from '@application/ports/repositories/delivery.repository.port';
import {
  CreateDeliveryUseCasePort,
  CreateDeliveryInput,
} from '@application/ports/use-cases/create-delivery.use-case.port';
import { Delivery } from '@application/domain/delivery/delivery';
import { TransactionNotFoundError } from '@application/domain/transaction/transaction-errors';
import {
  InvalidDeliveryStatusError,
  DeliveryAlreadyExistsError,
} from '@application/domain/delivery/delivery-errors';

export class CreateDeliveryUseCase implements CreateDeliveryUseCasePort {
  constructor(
    private readonly transactionRepository: TransactionRepositoryPort,
    private readonly deliveryRepository: DeliveryRepositoryPort,
  ) {}

  execute(input: CreateDeliveryInput): ReturnType<CreateDeliveryUseCasePort['execute']> {
    return this.transactionRepository.findById(input.transactionId).andThen((transaction) => {
      if (transaction === null) {
        return err(new TransactionNotFoundError(`Transaction ${input.transactionId} not found`));
      }
      if (transaction.status.value !== 'APPROVED') {
        return err(
          new InvalidDeliveryStatusError(
            'Delivery can only be created for APPROVED transactions',
          ),
        );
      }
      return this.deliveryRepository.findByTransactionId(input.transactionId).andThen((existing) => {
        if (existing !== null) {
          return err(new DeliveryAlreadyExistsError());
        }
        const deliveryResult = Delivery.create({
          id: randomUUID(),
          transactionId: input.transactionId,
          status: 'PENDING',
          carrier: null,
          trackingNumber: null,
        });
        if (deliveryResult.isErr()) {
          return err(deliveryResult.error);
        }
        return this.deliveryRepository.save(deliveryResult.value);
      });
    });
  }
}
