import { Module } from '@nestjs/common';
import { CheckHealthUseCase } from '@application/use-cases/health/check-health.use-case';
import { CHECK_HEALTH_USE_CASE } from '@application/ports/use-cases/check-health.use-case.port';
import { HealthController } from '@presentation/controllers/health.controller';

@Module({
  controllers: [HealthController],
  providers: [
    {
      provide: CHECK_HEALTH_USE_CASE,
      useFactory: () => new CheckHealthUseCase(),
    },
  ],
})
export class HealthModule {}
