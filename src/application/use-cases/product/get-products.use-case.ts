import { GetProductsUseCasePort } from '@application/ports/use-cases/get-products.use-case.port';
import { ProductRepositoryPort } from '@application/ports/repositories/product.repository.port';
import { Product } from '@application/domain/product/product';
import { ResultAsync } from '@application/domain/shared/result';
import { DomainError } from '@application/domain/shared/domain-error';

export class GetProductsUseCase implements GetProductsUseCasePort {
  constructor(private readonly productRepository: ProductRepositoryPort) {}

  execute(): ResultAsync<Product[], DomainError> {
    return this.productRepository.findAll();
  }
}
