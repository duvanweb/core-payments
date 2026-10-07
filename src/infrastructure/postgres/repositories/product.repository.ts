import type { Product as PrismaProduct } from '@prisma/client';
import { PrismaService } from '@infrastructure/postgres/prisma.service';
import { ProductRepositoryPort } from '@application/ports/repositories/product.repository.port';
import { Product } from '@application/domain/product/product';
import { ResultAsync, Result, ok } from '@application/domain/shared/result';
import { DomainError } from '@application/domain/shared/domain-error';
import { ProductRepositoryError } from '@application/domain/product/product-errors';

export class PrismaProductRepository implements ProductRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  findAll(): ResultAsync<Product[], DomainError> {
    return ResultAsync.fromPromise(
      this.prisma.product.findMany(),
      (e) => new ProductRepositoryError(`Failed to fetch products: ${String(e)}`),
    ).andThen((rows): Result<Product[], DomainError> => {
      const products: Product[] = [];
      for (const row of rows) {
        const r = toDomain(row);
        if (r.isErr()) return r;
        products.push(r.value);
      }
      return ok(products);
    });
  }
}

function toDomain(row: PrismaProduct): Result<Product, DomainError> {
  return Product.create({
    id: row.id,
    title: row.title,
    description: row.description,
    price: Number(row.price),
    image: row.image,
    stock: row.stock,
  });
}
