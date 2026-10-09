import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { HealthModule } from '@presentation/modules/health.module';
import { PrismaModule } from '@presentation/modules/prisma.module';
import { ProductModule } from '@presentation/modules/product.module';
import { TransactionModule } from '@presentation/modules/transaction.module';
import { DeliveryModule } from '@presentation/modules/delivery.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'public', 'products'),
      serveRoot: '/images',
    }),
    PrismaModule,
    HealthModule,
    ProductModule,
    TransactionModule,
    DeliveryModule,
  ],
})
export class AppModule {}
