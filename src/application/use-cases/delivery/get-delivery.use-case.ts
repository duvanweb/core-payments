import { ok, err, errAsync } from '@application/domain/shared/result';
import { DeliveryRepositoryPort } from '@application/ports/repositories/delivery.repository.port';
import {
  GetDeliveryUseCasePort,
  GetDeliveryInput,
} from '@application/ports/use-cases/get-delivery.use-case.port';
import { DeliveryNotFoundError } from '@application/domain/delivery/delivery-errors';

export class GetDeliveryUseCase implements GetDeliveryUseCasePort {
  constructor(private readonly deliveryRepository: DeliveryRepositoryPort) {}

  execute(input: GetDeliveryInput): ReturnType<GetDeliveryUseCasePort['execute']> {
    if (input.id) {
      return this.deliveryRepository.findById(input.id).andThen((delivery) => {
        if (delivery === null) {
          return err(new DeliveryNotFoundError(`Delivery ${input.id} not found`));
        }
        return ok(delivery);
      });
    }
    if (input.transactionId) {
      return this.deliveryRepository
        .findByTransactionId(input.transactionId)
        .andThen((delivery) => {
          if (delivery === null) {
            return err(
              new DeliveryNotFoundError(
                `Delivery for transaction ${input.transactionId} not found`,
              ),
            );
          }
          return ok(delivery);
        });
    }
    return errAsync(new DeliveryNotFoundError('Either id or transactionId must be provided'));
  }
}
