import { HealthStatusValue } from './health-status.vo';

export interface HealthCheckResult {
  status: HealthStatusValue;
  timestamp: Date;
}
