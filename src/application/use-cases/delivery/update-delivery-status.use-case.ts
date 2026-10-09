import { err } from '@application/domain/shared/result';
import { DeliveryRepositoryPort } from '@application/ports/repositories/delivery.repository.port';
import {
  UpdateDeliveryStatusUseCasePort,
  UpdateDeliveryStatusInput,
} from '@application/ports/use-cases/update-delivery-status.use-case.port';
import { DeliveryStatus } from '@application/domain/delivery/delivery-status.vo';
import {
  DeliveryNotFoundError,
  InvalidDeliveryStatusError,
} from '@application/domain/delivery/delivery-errors';

export class UpdateDeliveryStatusUseCase implements UpdateDeliveryStatusUseCasePort {
  constructor(private readonly deliveryRepository: DeliveryRepositoryPort) {}

  execute(input: UpdateDeliveryStatusInput): ReturnType<UpdateDeliveryStatusUseCasePort['execute']> {
    return this.deliveryRepository.findById(input.id).andThen((delivery) => {
      if (delivery === null) {
        return err(new DeliveryNotFoundError(`Delivery ${input.id} not found`));
      }

      const nextStatusResult = DeliveryStatus.create(input.status);
      if (nextStatusResult.isErr()) {
        return err(nextStatusResult.error);
      }
      const nextStatus = nextStatusResult.value;

      if (!delivery.status.canTransitionTo(nextStatus.value)) {
        return err(
          new InvalidDeliveryStatusError(
            `Cannot transition from ${delivery.status.value} to ${nextStatus.value}`,
          ),
        );
      }

      return this.deliveryRepository.updateStatus(
        input.id,
        input.status,
        input.carrier,
        input.trackingNumber,
      );
    });
  }
}
