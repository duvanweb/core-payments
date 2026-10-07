import { ValueObject } from '@application/domain/shared/value-object';

export type HealthStatusValue = 'ok' | 'degraded' | 'down';

export class HealthStatus extends ValueObject<HealthStatusValue> {
  get value(): HealthStatusValue {
    return this.props;
  }

  static ok(): HealthStatus {
    return new HealthStatus('ok');
  }
}
