import { Result, ok, ResultAsync, okAsync, errAsync } from '@application/domain/shared/result';
import { DomainError } from '@application/domain/shared/domain-error';
import { Transaction } from '@application/domain/transaction/transaction';
import { TransactionNotFoundError } from '@application/domain/transaction/transaction-errors';
import { TransactionRepositoryPort } from '@application/ports/repositories/transaction.repository.port';
import { GetTransactionUseCasePort } from '@application/ports/use-cases/get-transaction.use-case.port';
import {
  WompiApiPort,
  WompiTransactionData,
} from '@application/ports/gateways/wompi-api.port';
import { HandleWompiWebhookUseCasePort } from '@application/ports/use-cases/handle-wompi-webhook.use-case.port';

const DOMAIN_STATUSES = new Set(['PENDING', 'APPROVED', 'DECLINED', 'ERROR']);

function mapWompiStatus(status: string): string {
  if (DOMAIN_STATUSES.has(status)) return status;
  if (status === 'VOIDED') return 'DECLINED';
  return 'ERROR';
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export interface GetTransactionConfig {
  maxRetries: number;
  retryDelayMs: number;
}

export class GetTransactionUseCase implements GetTransactionUseCasePort {
  constructor(
    private readonly transactionRepository: TransactionRepositoryPort,
    private readonly wompiApi: WompiApiPort,
    private readonly handleWebhookUseCase: HandleWompiWebhookUseCasePort,
    private readonly config: GetTransactionConfig,
  ) {}

  execute(id: string): ReturnType<GetTransactionUseCasePort['execute']> {
    return this.transactionRepository.findById(id).andThen(
      (transaction): ResultAsync<Transaction, DomainError> => {
        if (transaction === null) {
          return errAsync(
            new TransactionNotFoundError(`Transaction with id ${id} not found`),
          );
        }
        if (transaction.status.isTerminal()) {
          return okAsync(transaction);
        }
        return this.syncFromWompi(transaction, id);
      },
    );
  }

  private syncFromWompi(
    transaction: Transaction,
    id: string,
  ): ResultAsync<Transaction, DomainError> {
    return new ResultAsync(this.doSyncFromWompi(transaction, id));
  }

  private async doSyncFromWompi(
    transaction: Transaction,
    id: string,
  ): Promise<Result<Transaction, DomainError>> {
    for (let attempt = 1; attempt <= this.config.maxRetries; attempt++) {
      const wompiResult = await this.queryWompi(transaction);

      const wompiData = wompiResult.match(
        (d: WompiTransactionData | null) => d,
        () => null,
      );

      if (wompiData === null) {
        if (attempt < this.config.maxRetries) {
          await sleep(this.config.retryDelayMs);
        }
        continue;
      }

      const mappedStatus = mapWompiStatus(wompiData.status);

      if (mappedStatus === 'PENDING') {
        if (attempt < this.config.maxRetries) {
          await sleep(this.config.retryDelayMs);
        }
        continue;
      }

      // Terminal status from Wompi — update DB + side effects
      await this.handleWebhookUseCase
        .execute({
          reference: transaction.reference.value,
          status: mappedStatus,
          wompiTransactionId: wompiData.id,
        })
        .match(
          () => undefined,
          () => undefined,
        );

      // Re-fetch the updated transaction from the DB
      return this.transactionRepository.findById(id).match(
        (tx) => ok(tx ?? transaction),
        () => ok(transaction),
      );
    }

    // Still pending after all retries — return the original transaction
    return ok(transaction);
  }

  private async queryWompi(
    transaction: Transaction,
  ): Promise<Result<WompiTransactionData | null, DomainError>> {
    if (transaction.wompiTransactionId) {
      return this.wompiApi.getTransactionById(transaction.wompiTransactionId);
    }
    return this.wompiApi.getTransactionByReference(transaction.reference.value);
  }
}
