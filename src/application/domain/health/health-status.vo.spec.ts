import { HealthStatus } from './health-status.vo';

describe('HealthStatus', () => {
  it('creates an ok status via factory', () => {
    const status = HealthStatus.ok();
    expect(status.value).toBe('ok');
  });
});
