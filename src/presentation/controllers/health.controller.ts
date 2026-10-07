import { Controller, Get, Inject } from '@nestjs/common';
import {
  CheckHealthUseCasePort,
  CHECK_HEALTH_USE_CASE,
} from '@application/ports/use-cases/check-health.use-case.port';
import { resultToHttp } from '@presentation/controllers/result-to-http';

@Controller('health')
export class HealthController {
  constructor(
    @Inject(CHECK_HEALTH_USE_CASE)
    private readonly checkHealthUseCase: CheckHealthUseCasePort,
  ) {}

  @Get()
  async checkHealth(): Promise<{ status: string }> {
    return this.checkHealthUseCase.execute().match(
      (result) => ({ status: result.status }),
      (error) => {
        throw resultToHttp(error);
      },
    );
  }
}
