import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthModule } from '@presentation/modules/health.module';
import { PrismaModule } from '@presentation/modules/prisma.module';
import { ProductModule } from '@presentation/modules/product.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), PrismaModule, HealthModule, ProductModule],
})
export class AppModule {}
