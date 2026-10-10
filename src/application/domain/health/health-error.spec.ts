import { DomainError } from '@application/domain/shared/domain-error';
import { HealthCheckFailedError } from './health-error';

describe('HealthCheckFailedError', () => {
  it('has correct code and default message', () => {
    const error = new HealthCheckFailedError();
    expect(error.code).toBe('HEALTH_CHECK_FAILED');
    expect(error.message).toBe('Health check failed');
    expect(error).toBeInstanceOf(DomainError);
  });

  it('accepts a custom message', () => {
    const error = new HealthCheckFailedError('Database is down');
    expect(error.message).toBe('Database is down');
  });
});
