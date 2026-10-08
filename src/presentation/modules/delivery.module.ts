import { Module, forwardRef } from '@nestjs/common';
import { PRISMA_SERVICE, PrismaService } from '@infrastructure/postgres/prisma.service';
import {
  DELIVERY_REPOSITORY,
  DeliveryRepositoryPort,
} from '@application/ports/repositories/delivery.repository.port';
import { PrismaDeliveryRepository } from '@infrastructure/postgres/repositories/delivery.repository';
import {
  TRANSACTION_REPOSITORY,
  TransactionRepositoryPort,
} from '@application/ports/repositories/transaction.repository.port';
import { CREATE_DELIVERY_USE_CASE } from '@application/ports/use-cases/create-delivery.use-case.port';
import { CreateDeliveryUseCase } from '@application/use-cases/delivery/create-delivery.use-case';
import { GET_DELIVERY_USE_CASE } from '@application/ports/use-cases/get-delivery.use-case.port';
import { GetDeliveryUseCase } from '@application/use-cases/delivery/get-delivery.use-case';
import { UPDATE_DELIVERY_STATUS_USE_CASE } from '@application/ports/use-cases/update-delivery-status.use-case.port';
import { UpdateDeliveryStatusUseCase } from '@application/use-cases/delivery/update-delivery-status.use-case';
import { DeliveryController } from '@presentation/controllers/delivery.controller';
import { TransactionModule } from '@presentation/modules/transaction.module';

@Module({
  imports: [forwardRef(() => TransactionModule)],
  controllers: [DeliveryController],
  providers: [
    {
      provide: DELIVERY_REPOSITORY,
      useFactory: (prisma: PrismaService) => new PrismaDeliveryRepository(prisma),
      inject: [PRISMA_SERVICE],
    },
    {
      provide: CREATE_DELIVERY_USE_CASE,
      useFactory: (txRepo: TransactionRepositoryPort, deliveryRepo: DeliveryRepositoryPort) =>
        new CreateDeliveryUseCase(txRepo, deliveryRepo),
      inject: [TRANSACTION_REPOSITORY, DELIVERY_REPOSITORY],
    },
    {
      provide: GET_DELIVERY_USE_CASE,
      useFactory: (deliveryRepo: DeliveryRepositoryPort) => new GetDeliveryUseCase(deliveryRepo),
      inject: [DELIVERY_REPOSITORY],
    },
    {
      provide: UPDATE_DELIVERY_STATUS_USE_CASE,
      useFactory: (deliveryRepo: DeliveryRepositoryPort) =>
        new UpdateDeliveryStatusUseCase(deliveryRepo),
      inject: [DELIVERY_REPOSITORY],
    },
  ],
  exports: [DELIVERY_REPOSITORY, CREATE_DELIVERY_USE_CASE],
})
export class DeliveryModule {}
