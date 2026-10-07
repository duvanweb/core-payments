import { CheckHealthUseCasePort } from '@application/ports/use-cases/check-health.use-case.port';
import { HealthCheckResult } from '@application/domain/health/health-check-result';
import { ResultAsync, okAsync } from '@application/domain/shared/result';
import { DomainError } from '@application/domain/shared/domain-error';

export class CheckHealthUseCase implements CheckHealthUseCasePort {
  execute(): ResultAsync<HealthCheckResult, DomainError> {
    return okAsync({
      status: 'ok',
      timestamp: new Date(),
    });
  }
}
