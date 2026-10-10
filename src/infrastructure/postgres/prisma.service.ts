import { PrismaClient } from '@prisma/client';
import { OnModuleDestroy, OnModuleInit } from '@nestjs/common';

/**
 * Prisma service — infrastructure adapter for PostgreSQL.
 * Connects eagerly on module init (fail-fast at boot) and disconnects on shutdown.
 * Registered via `useFactory` + `PRISMA_SERVICE` token in PrismaModule (no @Injectable()).
 */
export const PRISMA_SERVICE = Symbol('PRISMA_SERVICE');

export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
