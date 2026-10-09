import { okAsync, ResultAsync } from '@application/domain/shared/result';
import { DomainError } from '@application/domain/shared/domain-error';
import { TransactionRepositoryPort } from '@application/ports/repositories/transaction.repository.port';
import { CreateDeliveryUseCasePort } from '@application/ports/use-cases/create-delivery.use-case.port';
import {
  HandleWompiWebhookUseCasePort,
  WebhookInput,
} from '@application/ports/use-cases/handle-wompi-webhook.use-case.port';
import { DeliveryAlreadyExistsError } from '@application/domain/delivery/delivery-errors';

export class HandleWompiWebhookUseCase implements HandleWompiWebhookUseCasePort {
  constructor(
    private readonly transactionRepository: TransactionRepositoryPort,
    private readonly createDeliveryUseCase: CreateDeliveryUseCasePort,
  ) {}

  execute(input: WebhookInput): ReturnType<HandleWompiWebhookUseCasePort['execute']> {
    return this.transactionRepository
      .completeTransaction(input.reference, input.status, input.wompiTransactionId)
      .andThen((transaction) => {
        if (transaction.status.value !== 'APPROVED') {
          return okAsync(undefined);
        }
        return ResultAsync.fromPromise(
          this.createDeliveryUseCase
            .execute({ transactionId: transaction.id })
            .match(
              () => undefined,
              (error) => {
                if (!(error instanceof DeliveryAlreadyExistsError)) {
                  throw error;
                }
                return undefined;
              },
            ),
          (e) => e as DomainError,
        );
      });
  }
}
