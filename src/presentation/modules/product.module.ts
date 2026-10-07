import { Module } from '@nestjs/common';
import { PRISMA_SERVICE, PrismaService } from '@infrastructure/postgres/prisma.service';
import {
  PRODUCT_REPOSITORY,
  ProductRepositoryPort,
} from '@application/ports/repositories/product.repository.port';
import { PrismaProductRepository } from '@infrastructure/postgres/repositories/product.repository';
import { GET_PRODUCTS_USE_CASE } from '@application/ports/use-cases/get-products.use-case.port';
import { GetProductsUseCase } from '@application/use-cases/product/get-products.use-case';
import { ProductController } from '@presentation/controllers/product.controller';

@Module({
  controllers: [ProductController],
  providers: [
    {
      provide: PRODUCT_REPOSITORY,
      useFactory: (prisma: PrismaService) => new PrismaProductRepository(prisma),
      inject: [PRISMA_SERVICE],
    },
    {
      provide: GET_PRODUCTS_USE_CASE,
      useFactory: (repo: ProductRepositoryPort) => new GetProductsUseCase(repo),
      inject: [PRODUCT_REPOSITORY],
    },
  ],
})
export class ProductModule {}
