import { Global, Module } from '@nestjs/common';
import { PrismaService, PRISMA_SERVICE } from '@infrastructure/postgres/prisma.service';

/**
 * Global Prisma module — wires PrismaService into the Nest DI container.
 * Made @Global so PrismaService is available across modules without re-importing.
 */
@Global()
@Module({
  providers: [{ provide: PRISMA_SERVICE, useFactory: () => new PrismaService() }],
  exports: [PRISMA_SERVICE],
})
export class PrismaModule {}
