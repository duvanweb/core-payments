import { DomainError } from '@application/domain/shared/domain-error';

export class HealthCheckFailedError extends DomainError {
  constructor(message: string = 'Health check failed') {
    super('HEALTH_CHECK_FAILED', message);
  }
}
