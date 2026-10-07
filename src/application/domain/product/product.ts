import { Entity } from '@application/domain/shared/entity';
import { Result } from '@application/domain/shared/result';
import { DomainError } from '@application/domain/shared/domain-error';
import { ProductDescription } from './product-description.vo';
import { ProductPrice } from './product-price.vo';
import { ProductImageUrl } from './product-image-url.vo';
import { Stock } from './stock.vo';

export interface ProductProps {
  id: string;
  description: string;
  price: number;
  imageUrl: string;
  stock: number;
}

/**
 * Product entity — the central aggregate of the product catalog.
 * Identity is based on `id` (UUID). Invariants are enforced through Value Objects.
 */
export class Product extends Entity<string> {
  constructor(
    id: string,
    readonly description: ProductDescription,
    readonly price: ProductPrice,
    readonly imageUrl: ProductImageUrl,
    readonly stock: Stock,
  ) {
    super(id);
  }

  static create(props: ProductProps): Result<Product, DomainError> {
    return ProductDescription.create(props.description)
      .andThen((description) =>
        ProductPrice.create(props.price).map((price) => ({ description, price })),
      )
      .andThen(({ description, price }) =>
        ProductImageUrl.create(props.imageUrl).map((imageUrl) => ({ description, price, imageUrl })),
      )
      .andThen(({ description, price, imageUrl }) =>
        Stock.create(props.stock).map((stock) => ({ description, price, imageUrl, stock })),
      )
      .map(
        ({ description, price, imageUrl, stock }) =>
          new Product(props.id, description, price, imageUrl, stock),
      );
  }
}
