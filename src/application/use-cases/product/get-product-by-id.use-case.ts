import { GetProductByIdUseCasePort } from '@application/ports/use-cases/get-product-by-id.use-case.port';
import { ProductRepositoryPort } from '@application/ports/repositories/product.repository.port';
import { Product } from '@application/domain/product/product';
import { ResultAsync, Result, ok, err } from '@application/domain/shared/result';
import { DomainError } from '@application/domain/shared/domain-error';
import { ProductNotFoundError } from '@application/domain/product/product-errors';

export class GetProductByIdUseCase implements GetProductByIdUseCasePort {
  constructor(private readonly productRepository: ProductRepositoryPort) {}

  execute(id: string): ResultAsync<Product, DomainError> {
    return this.productRepository.findById(id).andThen(
      (product): Result<Product, DomainError> => {
        if (product === null) {
          return err(new ProductNotFoundError(`Product with id ${id} not found`));
        }
        return ok(product);
      },
    );
  }
}
