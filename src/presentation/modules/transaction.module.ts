import { Module, forwardRef } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PRISMA_SERVICE, PrismaService } from '@infrastructure/postgres/prisma.service';
import {
  TRANSACTION_REPOSITORY,
  TransactionRepositoryPort,
} from '@application/ports/repositories/transaction.repository.port';
import {
  CUSTOMER_REPOSITORY,
} from '@application/ports/repositories/customer.repository.port';
import { PrismaTransactionRepository } from '@infrastructure/postgres/repositories/transaction.repository';
import { PrismaCustomerRepository } from '@infrastructure/postgres/repositories/customer.repository';
import { WOMPI_CHECKOUT, WompiCheckoutPort } from '@application/ports/gateways/wompi-checkout.port';
import { WompiCheckoutService } from '@infrastructure/wompi/wompi-checkout.service';
import {
  PRODUCT_REPOSITORY,
  ProductRepositoryPort,
} from '@application/ports/repositories/product.repository.port';
import { CREATE_TRANSACTION_USE_CASE } from '@application/ports/use-cases/create-transaction.use-case.port';
import { CreateTransactionUseCase } from '@application/use-cases/transaction/create-transaction.use-case';
import { HANDLE_WOMPI_WEBHOOK_USE_CASE } from '@application/ports/use-cases/handle-wompi-webhook.use-case.port';
import { HandleWompiWebhookUseCase } from '@application/use-cases/transaction/handle-wompi-webhook.use-case';
import { GET_TRANSACTION_USE_CASE } from '@application/ports/use-cases/get-transaction.use-case.port';
import { GetTransactionUseCase } from '@application/use-cases/transaction/get-transaction.use-case';
import { TransactionController } from '@presentation/controllers/transaction.controller';
import { WebhookController } from '@presentation/controllers/webhook.controller';
import { ProductModule } from '@presentation/modules/product.module';
import { DeliveryModule } from '@presentation/modules/delivery.module';
import {
  CREATE_DELIVERY_USE_CASE,
  CreateDeliveryUseCasePort,
} from '@application/ports/use-cases/create-delivery.use-case.port';

@Module({
  imports: [ProductModule, forwardRef(() => DeliveryModule)],
  controllers: [TransactionController, WebhookController],
  providers: [
    {
      provide: TRANSACTION_REPOSITORY,
      useFactory: (prisma: PrismaService) => new PrismaTransactionRepository(prisma),
      inject: [PRISMA_SERVICE],
    },
    {
      provide: CUSTOMER_REPOSITORY,
      useFactory: (prisma: PrismaService) => new PrismaCustomerRepository(prisma),
      inject: [PRISMA_SERVICE],
    },
    {
      provide: WOMPI_CHECKOUT,
      useFactory: (config: ConfigService) =>
        new WompiCheckoutService({
          checkoutUrl: config.get<string>('WOMPI_CHECKOUT_URL') ?? '',
          publicKey: config.get<string>('WOMPI_PUBLIC_KEY') ?? '',
          integritySecret: config.get<string>('WOMPI_INTEGRITY_SECRET') ?? '',
          redirectUrl: config.get<string>('WOMPI_REDIRECT_URL') ?? '',
        }),
      inject: [ConfigService],
    },
    {
      provide: CREATE_TRANSACTION_USE_CASE,
      useFactory: (
        productRepo: ProductRepositoryPort,
        txRepo: TransactionRepositoryPort,
        wompiCheckout: WompiCheckoutPort,
        config: ConfigService,
      ) =>
        new CreateTransactionUseCase(productRepo, txRepo, wompiCheckout, {
          baseFeeInCents: Number(config.get<string>('BASE_FEE_IN_CENTS')),
          shippingFeeInCents: Number(config.get<string>('SHIPPING_FEE_IN_CENTS')),
          currency: config.get<string>('CURRENCY') ?? 'COP',
        }),
      inject: [PRODUCT_REPOSITORY, TRANSACTION_REPOSITORY, WOMPI_CHECKOUT, ConfigService],
    },
    {
      provide: HANDLE_WOMPI_WEBHOOK_USE_CASE,
      useFactory: (
        txRepo: TransactionRepositoryPort,
        createDelivery: CreateDeliveryUseCasePort,
      ) => new HandleWompiWebhookUseCase(txRepo, createDelivery),
      inject: [TRANSACTION_REPOSITORY, CREATE_DELIVERY_USE_CASE],
    },
    {
      provide: GET_TRANSACTION_USE_CASE,
      useFactory: (txRepo: TransactionRepositoryPort) =>
        new GetTransactionUseCase(txRepo),
      inject: [TRANSACTION_REPOSITORY],
    },
  ],
  exports: [TRANSACTION_REPOSITORY],
})
export class TransactionModule {}
