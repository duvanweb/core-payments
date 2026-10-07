import { okAsync } from '@application/domain/shared/result';
import { TransactionRepositoryPort } from '@application/ports/repositories/transaction.repository.port';
import {
  HandleWompiWebhookUseCasePort,
  WebhookInput,
} from '@application/ports/use-cases/handle-wompi-webhook.use-case.port';

export class HandleWompiWebhookUseCase implements HandleWompiWebhookUseCasePort {
  constructor(private readonly transactionRepository: TransactionRepositoryPort) {}

  execute(input: WebhookInput): ReturnType<HandleWompiWebhookUseCasePort['execute']> {
    return this.transactionRepository
      .completeTransaction(input.reference, input.status, input.wompiTransactionId)
      .andThen(() => okAsync(undefined));
  }
}
