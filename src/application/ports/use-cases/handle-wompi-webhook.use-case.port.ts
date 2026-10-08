import { UseCase } from '@application/ports/use-cases/use-case.port';
import { DomainError } from '@application/domain/shared/domain-error';

export const HANDLE_WOMPI_WEBHOOK_USE_CASE = Symbol('HANDLE_WOMPI_WEBHOOK_USE_CASE');

export interface WebhookInput {
  reference: string;
  status: string;
  wompiTransactionId: string;
}

export interface HandleWompiWebhookUseCasePort extends UseCase<WebhookInput, void, DomainError> {}
