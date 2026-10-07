import { UseCase } from './use-case.port';
import { HealthCheckResult } from '@application/domain/health/health-check-result';
import { DomainError } from '@application/domain/shared/domain-error';

export const CHECK_HEALTH_USE_CASE = Symbol('CHECK_HEALTH_USE_CASE');

export interface CheckHealthUseCasePort
  extends UseCase<void, HealthCheckResult, DomainError> {}
