import { okAsync, errAsync } from '@application/domain/shared/result';
import { DomainError } from '@application/domain/shared/domain-error';
import { HealthController } from './health.controller';

class FakeHealthUseCase {
  result: any = okAsync({ status: 'ok' as const, timestamp: new Date() });
  execute() {
    return this.result;
  }
}

class TestError extends DomainError {
  constructor() {
    super('HEALTH_CHECK_FAILED', 'Health check failed');
  }
}

describe('HealthController', () => {
  it('returns status on success', async () => {
    const useCase = new FakeHealthUseCase();
    const controller = new HealthController(useCase as any);

    const result = await controller.checkHealth();
    expect(result).toEqual({ status: 'ok' });
  });

  it('throws HttpException on error', async () => {
    const useCase = new FakeHealthUseCase();
    useCase.result = errAsync(new TestError());
    const controller = new HealthController(useCase as any);

    await expect(controller.checkHealth()).rejects.toThrow();
  });
});
